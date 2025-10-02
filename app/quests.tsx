import MapView, { Marker } from 'react-native-maps';
import { View, Text, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default function Quests() {
  const { crewId } = useLocalSearchParams<{ crewId: string }>();
  const nav = useNavigation<any>();
  const [quests, setQuests] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('quests')
      .select('id,title,lat,lng,radius_m,points,order_index,routes!inner(crew_id)')
      .eq('routes.crew_id', crewId)
      .order('order_index', { ascending: true })
      .then(({ data, error }) => { if (error) Alert.alert('Error', error.message); else setQuests(data ?? []); });
  }, [crewId]);

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={{
        latitude: quests[0]?.lat ?? 12.935,
        longitude: quests[0]?.lng ?? 77.614,
        latitudeDelta: 0.02, longitudeDelta: 0.02
      }}>
        {quests.map(q => <Marker key={q.id} coordinate={{ latitude: q.lat, longitude: q.lng }} title={q.title} />)}
      </MapView>
      <View style={{ padding: 12 }}>
        {quests.map(q => (
          <Button key={q.id} title={`Check ${q.title} (+${q.points})`} onPress={() => nav.navigate('checkin', { questId: q.id })} />
        ))}
      </View>
    </View>
  );
}
