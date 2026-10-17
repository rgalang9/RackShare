import { FunctionsHttpError } from '@supabase/supabase-js';
import type { CategoryId, Item } from '@/types';
import { supabase } from './supabase';

/** Private bucket; storage policies only let each user reach their own folder. */
const PHOTO_BUCKET = 'user-photos';
const photoPath = (userId: string) => `${userId}/full-body.jpg`;

/** Must match FASHN_CATEGORY in supabase/functions/try-on/index.ts. */
const TRY_ON_CATEGORIES: CategoryId[] = ['tops', 'outerwear', 'bottoms'];

export const supportsTryOn = (category: CategoryId) => TRY_ON_CATEGORIES.includes(category);

/** Error from the try-on function; `code` matches the codes it returns (not_pro, no_photo, daily_limit, …). */
export class TryOnError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

// ---- My Photo ----------------------------------------------------------

/** Short-lived signed URL for showing the user their own photo, or null if they haven't added one. */
export async function getMyPhotoUrl(userId: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(photoPath(userId), 60 * 10);
  return error ? null : data.signedUrl;
}

export async function uploadMyPhoto(userId: string, photo: Blob): Promise<void> {
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(photoPath(userId), photo, { upsert: true, contentType: 'image/jpeg', cacheControl: '0' });
  if (error) throw error;
}

export async function deleteMyPhoto(userId: string): Promise<void> {
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([photoPath(userId)]);
  if (error) throw error;
}

// ---- Try-on ------------------------------------------------------------

async function callTryOn<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>('try-on', { body });
  if (error instanceof FunctionsHttpError) {
    const payload = await (error.context as Response).json().catch(() => ({}));
    throw new TryOnError(payload.message ?? 'Something went wrong. Please try again.', payload.code);
  }
  if (error) throw new TryOnError('Could not reach the try-on service. Check your connection and try again.');
  return data as T;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Starts a try-on and polls until it's done. Resolves with the result image URL. */
export async function tryOn(item: Pick<Item, 'imageUrl' | 'category'>, signal?: AbortSignal): Promise<string> {
  const { id } = await callTryOn<{ id: string }>({
    action: 'start',
    garmentImage: item.imageUrl,
    category: item.category,
  });

  // Typically 5–15s. Give up after ~2 minutes.
  for (let attempt = 0; attempt < 60; attempt++) {
    await sleep(2000);
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    const result = await callTryOn<{ status: string; output?: string | null; error?: string }>({ action: 'status', id });
    if (result.status === 'completed' && result.output) return result.output;
    if (result.status === 'failed') throw new TryOnError(result.error ?? 'This try-on didn’t work out.');
  }
  throw new TryOnError('This is taking longer than usual. Please try again.');
}
