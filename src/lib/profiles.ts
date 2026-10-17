import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

/** Row in public.profiles (see supabase/schema.sql). */
export interface Profile {
  id: string;
  username: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  /** Rack Share Pro. Read-only from the browser; the try-on function re-checks it server-side. */
  is_pro: boolean;
  created_at: string;
}

export const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

/** Same fallback the database trigger uses: "<email prefix>_<6 chars of id>". */
function fallbackUsername(user: User): string {
  const prefix = (user.email ?? 'user').split('@')[0]!.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 20);
  return `${prefix}_${user.id.replace(/-/g, '').slice(0, 6)}`;
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('username', username);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * The on_auth_user_created trigger normally creates the profile at signup.
 * This is a safety net for users created before the trigger existed.
 */
export async function loadOrCreateProfile(user: User): Promise<Profile> {
  const existing = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle<Profile>();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const requested = String(user.user_metadata.username ?? '');
  const candidates = USERNAME_PATTERN.test(requested) ? [requested, fallbackUsername(user)] : [fallbackUsername(user)];

  for (const username of candidates) {
    const { data, error } = await supabase.from('profiles').insert({ id: user.id, username }).select().single<Profile>();
    if (!error) return data;
    if (error.code !== '23505') throw error; // 23505 = unique violation → try next candidate
  }
  throw new Error('Could not create your profile. Please try again.');
}
