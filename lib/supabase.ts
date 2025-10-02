import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

export const supabase = createClient(
  Constants.expoConfig?.extra?.SUPABASE_URL ?? process.env.SUPABASE_URL!,
  Constants.expoConfig?.extra?.SUPABASE_ANON ?? process.env.SUPABASE_ANON!,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);
