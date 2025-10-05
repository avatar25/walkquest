import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { sendEmailOtp, signInWithApple, verifyEmailOtp } from '../lib/auth';
import { useNavigation, useRouter } from 'expo-router';
import { captureError, trackEvent } from '../lib/analytics';
import { useFeatureFlag } from '../lib/feature-flags';
import { isOnboardingComplete } from '../lib/onboarding';
import { getProfile } from '../lib/profile';

export default function Home() {
  const nav = useNavigation<any>();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [session, setSession] = useState<any>(null);
  const emailOtpEnabled = useFeatureFlag('auth.email_otp', false);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const onboardingNavigated = useRef(false);

  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

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
      onboardingNavigated.current = false;
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const completed = await isOnboardingComplete();
        let needsOnboarding = !completed;
        try {
          const profile = await getProfile(session.user.id);
          if (!profile || !profile.username || profile.onboarding_complete === false) {
            needsOnboarding = true;
          }
        } catch (error) {
          captureError(error, { stage: 'loadProfileForOnboarding' });
        }
        if (!cancelled && needsOnboarding && !onboardingNavigated.current) {
          onboardingNavigated.current = true;
          router.replace('/onboarding');
        }
      } catch (error) {
        captureError(error, { stage: 'checkOnboarding' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, session?.user?.id]);

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

  async function sendOtp() {
    if (!trimmedEmail) {
      Alert.alert('Enter email', 'Please add your email address first.');
      return;
    }
    try {
      setAuthLoading(true);
      await sendEmailOtp(trimmedEmail);
      setOtpRequested(true);
      Alert.alert('Check email', 'We sent a 6-digit code to your inbox.');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function verifyOtpCode() {
    if (!trimmedEmail || otpCode.length < 6) {
      Alert.alert('Enter code', 'Enter the 6-digit code from your email.');
      return;
    }
    try {
      setAuthLoading(true);
      await verifyEmailOtp(trimmedEmail, otpCode.trim());
      setOtpCode('');
      setEmail('');
      setOtpRequested(false);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      {!session ? (
        <>
          <Button title="Sign in with Apple" onPress={signIn} />
          {emailOtpEnabled ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>Or sign in with email OTP</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ borderWidth: 1, padding: 8 }}
              />
              {otpRequested ? (
                <>
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    style={{ borderWidth: 1, padding: 8 }}
                  />
                  <Button title="Verify Code" onPress={verifyOtpCode} disabled={authLoading} />
                  <Button title="Resend Code" onPress={sendOtp} disabled={authLoading} />
                </>
              ) : (
                <Button title="Send Code" onPress={sendOtp} disabled={authLoading} />
              )}
            </View>
          ) : null}
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
