import { View, Text, Button, Alert, Image } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Camera from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { getLocationOnce, canCheckIn } from '../lib/geo';

export default function CheckIn() {
  const { questId } = useLocalSearchParams<{ questId: string }>();
  const nav = useNavigation<any>();
  const [quest, setQuest] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('quests').select('*').eq('id', questId).single().then(({ data, error })=>{
      if (error) Alert.alert('Error', error.message); else setQuest(data);
    });
  }, [questId]);

  async function takePhoto() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const cam = await Camera.launchCameraAsync({ quality: 0.5, exif: false, base64: false });
    // @ts-ignore
    if (!cam.canceled) setPhoto(cam.assets[0].uri);
  }

  async function submit() {
    if (!quest) return;
    const loc = await getLocationOnce();
    if (!canCheckIn(loc, quest.lat, quest.lng, quest.radius_m)) {
      return Alert.alert('Too far / too fast', 'Move closer and keep normal walking speed.');
    }
    // upload photo if present
    let photo_url: string | null = null;
    if (photo) {
      const file = await FileSystem.readAsStringAsync(photo, { encoding: 'base64' });
      const name = `proof_${quest.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage.from('proofs').upload(name, Buffer.from(file, 'base64'), {
        contentType: 'image/jpeg', upsert: false
      } as any);
      if (error) console.log(error); else photo_url = supabase.storage.from('proofs').getPublicUrl(name).data.publicUrl;
    }
    const { data: user } = await supabase.auth.getUser();
    const { error: e2 } = await supabase.from('checkins').insert({
      quest_id: quest.id,
      user_id: user.user?.id,
      lat: loc.coords.latitude, lng: loc.coords.longitude,
      photo_url, speed_kmh: Math.max(0, (loc.coords.speed ?? 0)*3.6)
    });
    if (e2) return Alert.alert('Error', e2.message);
    Alert.alert('Nice!', 'Quest checked in.');
    // @ts-ignore
    nav.navigate('leaderboard');
  }

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>{quest?.title ?? '...'}</Text>
      {photo && <Image source={{ uri: photo }} style={{ width: '100%', height: 240 }} />}
      <Button title={photo ? "Retake Photo" : "Take Photo (optional +3)"} onPress={takePhoto} />
      <Button title="Submit Check-in" onPress={submit} />
    </View>
  );
}
