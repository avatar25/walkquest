import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { captureError, trackEvent } from '../lib/analytics';

type Row = { user_id: string; points: number; username?: string };

async function fetchBoard(): Promise<Row[]> {
  const { data, error } = await supabase.rpc('get_week_points');
  if (error) throw error;
  const ids = data.map((r: Row) => r.user_id);
  const { data: profs, error: profileError } = await supabase.from('profiles').select('id,username').in('id', ids);
  if (profileError) throw profileError;
  const map = new Map((profs ?? []).map((p: any) => [p.id, p.username]));
  return data.map((r: Row) => ({ ...r, username: map.get(r.user_id) ?? r.user_id.slice(0, 6) }));
}

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const next = await fetchBoard();
      setRows(next.sort((a, b) => b.points - a.points));
      trackEvent('leaderboard_loaded', { count: next.length });
    } catch (error) {
      captureError(error, { screen: 'leaderboard' });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('public:checkins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => {
        load().catch((error) => captureError(error, { screen: 'leaderboard', reason: 'realtime' }));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.user_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
            <Text>{index + 1}. {item.username}</Text>
            <Text>{item.points} pts</Text>
          </View>
        )}
      />
    </View>
  );
}
