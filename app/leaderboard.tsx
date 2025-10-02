import { View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Row = { user_id: string; points: number; username?: string };

async function fetchBoard(): Promise<Row[]> {
  const { data, error } = await supabase.rpc('get_week_points'); // create this in Supabase
  if (error) throw error;
  // enrich usernames
  const ids = data.map((r: Row)=>r.user_id);
  const { data: profs } = await supabase.from('profiles').select('id,username').in('id', ids);
  const map = new Map(profs?.map(p=>[p.id, p.username]));
  return data.map((r: Row)=>({ ...r, username: map.get(r.user_id) ?? r.user_id.slice(0,6)}));
}

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    fetchBoard().then(setRows).catch(console.error);
    const ch = supabase.channel('public:checkins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => {
        fetchBoard().then(setRows).catch(console.error);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return (
    <View style={{ padding: 16 }}>
      <FlatList
        data={rows.sort((a,b)=>b.points-a.points)}
        keyExtractor={r=>r.user_id}
        renderItem={({item, index})=>(
          <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8 }}>
            <Text>{index+1}. {item.username}</Text>
            <Text>{item.points} pts</Text>
          </View>
        )}
      />
    </View>
  );
}
