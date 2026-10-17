import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfigError } from './supabaseConfig';

const configError = getSupabaseConfigError();
if (configError) throw new Error(configError);

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
