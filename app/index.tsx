import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { signInWithApple } from '../lib/auth';
import { useNavigation } from 'expo-router';
import { captureError, trackEvent } from '../lib/analytics';
import { useFeatureFlag } from '../lib/feature-flags';

export default function Home() {
  const nav = useNavigation<any>();
  const [code, setCode] = useState('');
  const [session, setSession] = useState<any>(null);
  const emailOtpEnabled = useFeatureFlag('auth.email_otp', false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        trackEvent('auth_session_restored');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      trackEvent('auth_session_change', { hasSession: Boolean(s) });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function createCrew() {
    try {
      const join_code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data: user } = await supabase.auth.getUser();
      const { data: crew, error } = await supabase
        .from('crews')
        .insert({ name: 'My Crew', join_code, owner: user.user?.id })
        .select()
        .single();
      if (error) {
        throw error;
      }
      await supabase.from('crew_members').insert({ crew_id: crew.id, user_id: user.user?.id });
      Alert.alert('Crew Created', `Share this code: ${join_code}`);
      trackEvent('crew_created');
    } catch (error) {
      captureError(error, { action: 'createCrew' });
      Alert.alert('Error', (error as Error).message);
    }
  }

  async function joinCrew() {
    try {
      const trimmed = code.trim();
      if (!trimmed) return;
      const { data: c, error } = await supabase.from('crews').select('id').eq('join_code', trimmed).single();
      if (error || !c) {
        Alert.alert('Not found', 'Check the code');
        return;
      }
      const { data: user } = await supabase.auth.getUser();
      try {
        await supabase.from('crew_members').insert({ crew_id: c.id, user_id: user.user?.id });
      } catch (error) {
        captureError(error, { action: 'joinCrewMembers', crewId: c.id });
      }
      trackEvent('crew_joined', { crewId: c.id });
      // @ts-ignore
      nav.navigate('quests', { crewId: c.id });
    } catch (error) {
      captureError(error, { action: 'joinCrew' });
      Alert.alert('Error', (error as Error).message);
    }
  }

  function signIn() {
    signInWithApple().catch((error) => {
      Alert.alert('Error', (error as Error).message);
    });
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      {!session ? (
        <>
          <Button title="Sign in with Apple" onPress={signIn} />
          {emailOtpEnabled ? <Text style={{ color: '#666' }}>Email OTP sign-in is coming soon.</Text> : null}
        </>
      ) : (
        <>
          <Text style={{ fontSize: 20 }}>Welcome 👟</Text>
          <Button title="Create Crew" onPress={createCrew} />
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Join code"
              autoCapitalize="characters"
              style={{ borderWidth: 1, padding: 8, flex: 1 }}
            />
            <Button title="Join" onPress={joinCrew} />
          </View>
          <Button title="Go to Leaderboard" onPress={() => nav.navigate('leaderboard')} />
        </>
      )}
    </View>
  );
}
