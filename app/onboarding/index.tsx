import { useEffect, useMemo, useState } from 'react';
import { View, Text, Button, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { DeviceMotion } from 'expo-sensors';
import { supabase } from '../../lib/supabase';
import { captureError, trackEvent } from '../../lib/analytics';
import { setOnboardingComplete } from '../../lib/onboarding';
import { getProfile, upsertProfile } from '../../lib/profile';

const STEP_ORDER = ['intro', 'location', 'camera', 'motion', 'profile'] as const;

type Step = (typeof STEP_ORDER)[number];

function generateUsername() {
  const adjectives = ['Swift', 'Bright', 'Bold', 'Calm', 'Lively', 'Urban'];
  const nouns = ['Walker', 'Strider', 'Ranger', 'Scout', 'Voyager'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 900 + 100);
  return `${adjective}${noun}${number}`;
}

function randomAvatarEmoji() {
  const options = ['🚶', '🧭', '🌆', '🏃', '🌉', '🛰️', '⭐️', '🪄'];
  return options[Math.floor(Math.random() * options.length)];
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(randomAvatarEmoji());
  const [loadingProfile, setLoadingProfile] = useState(true);

  const defaultUsername = useMemo(() => generateUsername(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          return;
        }
        const profile = await getProfile(user.user.id);
        if (!cancelled && profile) {
          if (profile.username) {
            setUsername(profile.username);
          }
          if (profile.avatar_url) {
            setAvatar(profile.avatar_url);
          }
        }
      } catch (error) {
        captureError(error, { stage: 'loadOnboardingProfile' });
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goToNext = () => {
    const currentIndex = STEP_ORDER.indexOf(step);
    const nextStep = STEP_ORDER[currentIndex + 1];
    if (nextStep) {
      setStep(nextStep);
    }
  };

  const handleLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location needed', 'We need your location to unlock quests.');
        return;
      }
      if (typeof (Location as any).requestAccuracyUpgradeAsync === 'function') {
        try {
          await (Location as any).requestAccuracyUpgradeAsync();
        } catch (err) {
          // requestAccuracyUpgradeAsync is best-effort
          console.debug('Accuracy upgrade not available', err);
        }
      }
      trackEvent('onboarding_location_granted');
      goToNext();
    } catch (error) {
      captureError(error, { stage: 'locationPermission' });
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera needed', 'Camera access lets you capture proof photos.');
        return;
      }
      trackEvent('onboarding_camera_granted');
      goToNext();
    } catch (error) {
      captureError(error, { stage: 'cameraPermission' });
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleMotionPermission = async () => {
    try {
      const response = await DeviceMotion.requestPermissionsAsync();
      if (!response.granted) {
        Alert.alert('Motion access needed', 'Motion data helps verify your walk.');
        return;
      }
      trackEvent('onboarding_motion_granted');
      goToNext();
    } catch (error) {
      captureError(error, { stage: 'motionPermission' });
      Alert.alert('Error', (error as Error).message);
    }
  };

  const completeProfile = async (skip = false) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('No active user session');
      }
      const finalUsername = skip ? defaultUsername : (username.trim() || defaultUsername);
      const finalAvatar = avatar || randomAvatarEmoji();
      await upsertProfile(user.user.id, {
        username: finalUsername,
        avatar_url: finalAvatar,
        onboarding_complete: true,
      });
      await setOnboardingComplete();
      trackEvent('onboarding_complete');
      router.replace('/');
    } catch (error) {
      captureError(error, { stage: 'profileComplete' });
      Alert.alert('Error', (error as Error).message);
    }
  };

  const renderIntro = () => (
    <View style={{ gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Welcome to WalkQuest</Text>
      <Text>We will guide you through a quick setup to make sure your quests are verified smoothly.</Text>
      <Button title="Get Started" onPress={goToNext} />
    </View>
  );

  const renderLocation = () => (
    <View style={{ gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '500' }}>Enable Location</Text>
      <Text>We need precise location while you walk to verify quest boundaries and distance.</Text>
      <Text>• Accurate GPS unlocks the “Go!” button.
• Helps us detect spoofing and keep quests fair.
• Only used during active play.</Text>
      <Button title="Allow Location" onPress={handleLocationPermission} />
    </View>
  );

  const renderCamera = () => (
    <View style={{ gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '500' }}>Enable Camera</Text>
      <Text>Capture proof photos directly in-app for landmark quests.</Text>
      <Text>• We never access your camera without asking.
• No gallery uploads—helps prevent cheating.
• Photos upload securely for verification.</Text>
      <Button title="Allow Camera" onPress={handleCameraPermission} />
    </View>
  );

  const renderMotion = () => (
    <View style={{ gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '500' }}>Enable Motion</Text>
      <Text>Motion data verifies real walking pace and direction changes.</Text>
      <Text>• We sample lightweight motion data.
• Improves fraud detection.
• Only active during quests.</Text>
      <Button title="Allow Motion" onPress={handleMotionPermission} />
    </View>
  );

  const renderProfile = () => (
    <View style={{ gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '500' }}>Create Your Profile</Text>
      <Text>Pick a display name and avatar for leaderboards and crew play. We’ll fill something in if you skip.</Text>
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        <Text style={{ fontSize: 48 }}>{avatar}</Text>
        <Button title="Shuffle Avatar" onPress={() => setAvatar(randomAvatarEmoji())} />
      </View>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder={defaultUsername}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      <Button title="Save Profile" onPress={() => completeProfile(false)} disabled={loadingProfile} />
      <Button title="Skip for now" onPress={() => completeProfile(true)} />
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return renderIntro();
      case 'location':
        return renderLocation();
      case 'camera':
        return renderCamera();
      case 'motion':
        return renderMotion();
      case 'profile':
        return renderProfile();
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      {renderContent()}
    </View>
  );
}
