import MapView, { Marker } from 'react-native-maps';
import { View, Text, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import type { QuestSummary } from '../lib/api';
import { readQuestCache, writeQuestCache } from '../lib/storage/questCache';
import { trackEvent } from '../lib/analytics';

export default function Quests() {
  const { crewId } = useLocalSearchParams<{ crewId: string }>();
  const nav = useNavigation<any>();
  const [quests, setQuests] = useState<QuestSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    readQuestCache()
      .then((cached) => {
        if (mounted && cached.length > 0) {
          setQuests(cached);
        }
      })
      .catch((error) => console.warn('Failed to load cached quests', error));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!crewId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quests')
          .select('id,title,lat,lng,radius_m,points,order_index,routes!inner(crew_id),difficulty')
          .eq('routes.crew_id', crewId)
          .order('order_index', { ascending: true });
        if (error) {
          throw error;
        }
        const mapped: QuestSummary[] = (data ?? []).map((quest: any) => ({
          id: quest.id,
          title: quest.title,
          latitude: quest.lat,
          longitude: quest.lng,
          radiusMeters: quest.radius_m,
          rewardPoints: quest.points,
          difficulty: (quest.difficulty ?? 'medium') as QuestSummary['difficulty'],
        }));
        if (!cancelled) {
          setQuests(mapped);
        }
        await writeQuestCache(mapped);
        trackEvent('quest_list_loaded', { crewId, count: mapped.length });
      } catch (error) {
        if (!cancelled) {
          Alert.alert('Error', (error as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [crewId]);

  const initialLatitude = quests[0]?.latitude ?? 12.935;
  const initialLongitude = quests[0]?.longitude ?? 77.614;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {quests.map((q) => (
          <Marker key={q.id} coordinate={{ latitude: q.latitude, longitude: q.longitude }} title={q.title} />
        ))}
      </MapView>
      <View style={{ padding: 12 }}>
        {loading && quests.length === 0 ? (
          <Text>Loading quests…</Text>
        ) : (
          quests.map((q) => (
            <Button key={q.id} title={`Check ${q.title} (+${q.rewardPoints})`} onPress={() => nav.navigate('checkin', { questId: q.id })} />
          ))
        )}
      </View>
    </View>
  );
}
