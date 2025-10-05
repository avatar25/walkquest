import { supabase } from './supabase';

export interface ProfileRecord {
  id: string;
  username: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean | null;
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,avatar_url,onboarding_complete')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function upsertProfile(userId: string, values: { username: string; avatar_url?: string | null; onboarding_complete?: boolean }): Promise<void> {
  const payload = {
    id: userId,
    username: values.username,
    avatar_url: values.avatar_url ?? null,
    onboarding_complete: values.onboarding_complete ?? null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}
