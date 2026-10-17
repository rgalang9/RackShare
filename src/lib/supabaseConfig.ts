/**
 * Side-effect free so main.tsx can check config before anything imports the client
 * (a bad URL makes createClient throw at import time → blank page).
 */
export function getSupabaseConfigError(): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must both be set.';
  }
  try {
    if (/^https?:$/.test(new URL(url).protocol)) return null;
  } catch {
    // fall through
  }
  return `VITE_SUPABASE_URL ("${url}") isn't a valid URL. It should look like https://<project-ref>.supabase.co`;
}
