import { View, Text, Button, Alert, Image } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { supabase } from '../lib/supabase';
import { getLocationOnce, canCheckIn } from '../lib/geo';
import type { QuestDetail } from '../lib/api';
import { captureError, trackEvent } from '../lib/analytics';
import { useFeatureFlag } from '../lib/feature-flags';

export default function CheckIn() {
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const nav = useNavigation<any>();
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const hintsEnabled = useFeatureFlag('quest.proof_hints', true);

  useEffect(() => {
    if (!questId) return;
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.from('quests').select('*').eq('id', questId).single();
        if (error) {
          throw error;
        }
        if (mounted && data) {
          setQuest({
            id: data.id,
            title: data.title,
            latitude: data.lat,
            longitude: data.lng,
            radiusMeters: data.radius_m,
            rewardPoints: data.points,
            difficulty: (data.difficulty ?? 'medium') as QuestDetail['difficulty'],
            photoHint: data.photo_hint ?? undefined,
            description: data.description ?? undefined,
          });
        }
      } catch (error) {
        captureError(error, { questId });
        Alert.alert('Error', (error as Error).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [questId]);

  async function takePhoto() {
    if (!questId) return;
    trackEvent('quest_capture_start', { questId });
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      trackEvent('quest_capture_permission_denied', { questId });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, exif: false, base64: false });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      trackEvent('quest_capture_success', { questId });
    }
  }

  async function submit() {
    if (!quest) return;
    try {
      const loc = await getLocationOnce();
      if (!canCheckIn(loc, quest.latitude, quest.longitude, quest.radiusMeters)) {
        Alert.alert('Too far / too fast', 'Move closer and keep normal walking speed.');
        trackEvent('quest_checkin_blocked_distance', { questId });
        return;
      }
      let photoUrl: string | null = null;
      if (photo) {
        const file = await FileSystem.readAsStringAsync(photo, { encoding: 'base64' });
        const name = `proof_${quest.id}_${Date.now()}.jpg`;
        const { error } = await supabase.storage
          .from('proofs')
          .upload(name, Buffer.from(file, 'base64'), {
            contentType: 'image/jpeg',
            upsert: false,
          } as any);
        if (error) {
          captureError(error, { questId, stage: 'upload' });
        } else {
          photoUrl = supabase.storage.from('proofs').getPublicUrl(name).data.publicUrl;
        }
      }
      const { data: user } = await supabase.auth.getUser();
      const { error: e2 } = await supabase.from('checkins').insert({
        quest_id: quest.id,
        user_id: user.user?.id,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        photo_url: photoUrl,
        speed_kmh: Math.max(0, (loc.coords.speed ?? 0) * 3.6),
      });
      if (e2) {
        captureError(e2, { questId, stage: 'checkin' });
        Alert.alert('Error', e2.message);
        return;
      }
      trackEvent('quest_checkin_success', { questId });
      Alert.alert('Nice!', 'Quest checked in.');
      // @ts-ignore
      nav.navigate('leaderboard');
    } catch (error) {
      captureError(error, { questId, stage: 'submit' });
      Alert.alert('Error', (error as Error).message);
    }
  }

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>{quest?.title ?? '...'}</Text>
      {hintsEnabled && quest?.photoHint ? <Text>Hint: {quest.photoHint}</Text> : null}
      {photo && <Image source={{ uri: photo }} style={{ width: '100%', height: 240 }} />}
      <Button title={photo ? 'Retake Photo' : 'Take Photo (optional +3)'} onPress={takePhoto} />
      <Button title="Submit Check-in" onPress={submit} />
    </View>
  );
}
