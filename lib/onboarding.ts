import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'walkquest::onboarding_complete';

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function clearOnboardingComplete(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}

export async function isOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}
