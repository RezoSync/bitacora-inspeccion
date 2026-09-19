import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, TOKEN_KEY } from '../api/client';
import { RootStackParamList } from '../navigation';
import { Visit } from '../types';
import { colors, styles } from '../styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [visits, setVisits] = useState<Visit[]>([]); const [refreshing, setRefreshing] = useState(false); const [error, setError] = useState('');
  const loadVisits = useCallback(async () => { setRefreshing(true); try { const { data } = await api.get<Visit[]>('/visits'); setVisits(data); setError(''); } catch { setError('No se pudieron cargar las visitas'); } finally { setRefreshing(false); } }, []);
  useFocusEffect(useCallback(() => { loadVisits(); }, [loadVisits]));
  async function logout() { await AsyncStorage.removeItem(TOKEN_KEY); navigation.replace('Login'); }
  return <View style={styles.screen}><View style={[styles.content, { paddingBottom: 8 }]}><Text style={styles.title}>Mis visitas</Text><Pressable style={styles.button} onPress={() => navigation.navigate('NewVisit')}><Text style={styles.buttonText}>+ Registrar visita</Text></Pressable><Pressable onPress={logout}><Text style={{ color: colors.teal, fontWeight: '700' }}>Cerrar sesión</Text></Pressable>{!!error && <Text style={styles.error}>{error}</Text>}</View><FlatList data={visits} keyExtractor={(item) => String(item.id)} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadVisits} />} contentContainerStyle={styles.content} ListEmptyComponent={!refreshing ? <Text style={styles.subtitle}>Aún no tienes visitas registradas.</Text> : null} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => navigation.navigate('VisitDetail', { visitId: item.id })}><Text style={{ color: colors.ink, fontSize: 18, fontWeight: '800' }}>{item.client_name}</Text><Text style={styles.subtitle}>{item.location_name}{item.address ? ` · ${item.address}` : ''}</Text><Text style={{ color: item.status === 'completed' ? colors.teal : colors.muted, fontWeight: '700' }}>{item.status === 'in_progress' ? 'En progreso' : item.status === 'completed' ? 'Completada' : 'Cancelada'}</Text><Text style={styles.subtitle}>{new Date(item.started_at).toLocaleString()}</Text></Pressable>} /></View>;
}
