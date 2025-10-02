import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { signInWithApple } from '../lib/auth';
import { useNavigation } from 'expo-router';

export default function Home() {
  const nav = useNavigation<any>();
  const [code, setCode] = useState('');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function createCrew() {
    const join_code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data: user } = await supabase.auth.getUser();
    const { data: crew, error } = await supabase.from('crews').insert({ name: 'My Crew', join_code, owner: user.user?.id }).select().single();
    if (error) return Alert.alert('Error', error.message);
    await supabase.from('crew_members').insert({ crew_id: crew.id, user_id: user.user?.id });
    Alert.alert('Crew Created', `Share this code: ${join_code}`);
  }

  async function joinCrew() {
    const { data: c, error } = await supabase.from('crews').select('id').eq('join_code', code.trim()).single();
    if (error || !c) return Alert.alert('Not found', 'Check the code');
    const { data: user } = await supabase.auth.getUser();
    await supabase.from('crew_members').insert({ crew_id: c.id, user_id: user.user?.id }).catch(()=>{});
    // go straight to quests
    // @ts-ignore
    nav.navigate('quests', { crewId: c.id });
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      {!session ? (
        <Button title="Sign in with Apple" onPress={signInWithApple} />
      ) : (
        <>
          <Text style={{ fontSize: 20 }}>Welcome 👟</Text>
          <Button title="Create Crew" onPress={createCrew} />
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput value={code} onChangeText={setCode} placeholder="Join code"
              autoCapitalize="characters" style={{ borderWidth: 1, padding: 8, flex: 1 }} />
            <Button title="Join" onPress={joinCrew} />
          </View>
          <Button title="Go to Leaderboard" onPress={()=>nav.navigate('leaderboard')} />
        </>
      )}
    </View>
  );
}
