// Virtual try-on via FASHN (https://docs.fashn.ai). Runs on Supabase Edge Functions (Deno),
// so FASHN_API_KEY never reaches the browser.
//
//   POST { action: 'start', garmentImage, category }  →  { id }
//   POST { action: 'status', id }                      →  { status, output?, error? }
//
// Both actions require a signed-in Rack Share Pro user. Deploy: supabase functions deploy try-on

import { createClient } from 'npm:@supabase/supabase-js@2';

const FASHN_API = 'https://api.fashn.ai/v1';
const PHOTO_BUCKET = 'user-photos';
const DAILY_LIMIT = 20;
const MAX_DATA_URL_LENGTH = 8 * 1024 * 1024;

// Rack Share category → FASHN category. Anything not listed (shoes, headwear, accessories) isn't supported.
const FASHN_CATEGORY: Record<string, string> = {
  tops: 'tops',
  outerwear: 'tops',
  bottoms: 'bottoms',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** `code` lets the app react to specific failures (e.g. show the upgrade modal). */
function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
const fail = (status: number, code: string, message: string) => json(status, { code, message });

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

function fashn(path: string, init?: RequestInit) {
  return fetch(`${FASHN_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${Deno.env.get('FASHN_API_KEY')}`, 'Content-Type': 'application/json' },
  });
}

function isValidGarmentImage(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.startsWith('data:')) {
    return /^data:image\/(jpeg|png|webp);base64,/.test(value) && value.length <= MAX_DATA_URL_LENGTH;
  }
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

async function start(userId: string, body: Record<string, unknown>) {
  const category = FASHN_CATEGORY[String(body.category)];
  if (!category) return fail(400, 'unsupported_category', 'Try-on works with tops, outerwear and bottoms for now.');
  if (!isValidGarmentImage(body.garmentImage)) {
    return fail(400, 'bad_garment_image', 'This item needs a photo before you can try it on.');
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
    .from('tryon_requests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);
  if (countError) throw countError;
  if ((count ?? 0) >= DAILY_LIMIT) {
    return fail(429, 'daily_limit', `You've used all ${DAILY_LIMIT} try-ons for today. Check back tomorrow!`);
  }

  // Short-lived link so FASHN can fetch the private photo; the bucket itself stays private.
  const { data: signed, error: signError } = await admin.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(`${userId}/full-body.jpg`, 300);
  if (signError || !signed) return fail(400, 'no_photo', 'Add your full-body photo first.');

  // Log before calling FASHN so failed attempts still count toward the limit.
  const { data: request, error: logError } = await admin
    .from('tryon_requests')
    .insert({ user_id: userId })
    .select('id')
    .single();
  if (logError) throw logError;

  const res = await fashn('/run', {
    method: 'POST',
    body: JSON.stringify({
      model_name: 'tryon-v1.6',
      inputs: {
        model_image: signed.signedUrl,
        garment_image: body.garmentImage,
        category,
        mode: 'balanced',
        garment_photo_type: 'auto',
        num_samples: 1,
        output_format: 'jpeg',
      },
    }),
  });
  const run = await res.json().catch(() => ({}));
  if (!res.ok || !run.id) {
    console.error('FASHN run failed', res.status, run);
    return fail(502, 'provider_error', 'The try-on service is busy right now. Please try again in a minute.');
  }

  await admin.from('tryon_requests').update({ prediction_id: run.id }).eq('id', request.id);
  return json(200, { id: run.id });
}

async function status(userId: string, body: Record<string, unknown>) {
  const id = String(body.id ?? '');
  const { data: owned } = await admin
    .from('tryon_requests')
    .select('id')
    .eq('user_id', userId)
    .eq('prediction_id', id)
    .maybeSingle();
  if (!owned) return fail(404, 'not_found', 'Try-on not found.');

  const res = await fashn(`/status/${encodeURIComponent(id)}`);
  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('FASHN status failed', res.status, result);
    return fail(502, 'provider_error', 'Could not check on your try-on. Please try again.');
  }

  if (result.status === 'failed') {
    // e.g. PoseError when the person isn't clearly visible.
    const reason = result.error?.name === 'PoseError'
      ? "We couldn't find a clear full-body pose in your photo. Try a straight-on, well-lit shot."
      : "This try-on didn't work out. Try a different photo or item.";
    return json(200, { status: 'failed', error: reason });
  }
  return json(200, { status: result.status, output: result.output?.[0] ?? null });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail(405, 'method_not_allowed', 'Use POST.');

  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const { data: auth } = token ? await admin.auth.getUser(token) : { data: { user: null } };
    if (!auth.user) return fail(401, 'unauthorized', 'Please log in again.');

    // The real Pro gate: the UI hides the feature, but this is what actually enforces it.
    const { data: profile } = await admin.from('profiles').select('is_pro').eq('id', auth.user.id).maybeSingle();
    if (!profile?.is_pro) return fail(403, 'not_pro', 'Try it on is a Rack Share Pro feature.');

    const body = await req.json().catch(() => ({}));
    if (body.action === 'start') return await start(auth.user.id, body);
    if (body.action === 'status') return await status(auth.user.id, body);
    return fail(400, 'bad_action', 'Unknown action.');
  } catch (err) {
    console.error(err);
    return fail(500, 'server_error', 'Something went wrong. Please try again.');
  }
});
