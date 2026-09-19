import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, TOKEN_KEY } from '../api/client';
import { RootStackParamList } from '../navigation';
import { Visit } from '../types';
import { colors, styles } from '../styles';
import FadeIn from '../components/FadeIn';
import StatusBadge from '../components/StatusBadge';
import { ChevronIcon, LogoutIcon, PlusIcon } from '../components/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadVisits = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get<Visit[]>('/visits');
      setVisits(data);
      setError('');
    } catch {
      setError('No se pudieron cargar las visitas');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadVisits(); }, [loadVisits]));

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    navigation.replace('Login');
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={visits}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl tintColor={colors.green} refreshing={refreshing} onRefresh={loadVisits} />}
        contentContainerStyle={[styles.content, { paddingBottom: 32 }]}
        ListHeaderComponent={
          <FadeIn style={{ gap: 14, marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ gap: 4, flex: 1 }}>
                <Text style={styles.title}>Mis visitas</Text>
                <Text style={styles.subtitle}>
                  {visits.length > 0 ? `${visits.length} visita${visits.length === 1 ? '' : 's'} registrada${visits.length === 1 ? '' : 's'}` : 'Aún no tienes visitas'}
                </Text>
              </View>
              <Pressable
                onPress={logout}
                style={({ pressed }) => [styles.iconCircle, { opacity: pressed ? 0.7 : 1 }]}
                hitSlop={8}
              >
                <LogoutIcon size={19} color={colors.muted} />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { flexDirection: 'row', gap: 8, justifyContent: 'center', opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => navigation.navigate('NewVisit')}
            >
              <PlusIcon size={18} />
              <Text style={styles.buttonText}>Registrar visita</Text>
            </Pressable>

            {!!error && <Text style={styles.error}>{error}</Text>}
          </FadeIn>
        }
        ListEmptyComponent={
          !refreshing ? (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 28 }]}>
              <Text style={styles.subtitle}>Aún no tienes visitas registradas.</Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item, index }) => (
          <FadeIn delay={Math.min(index, 6) * 40}>
            <Pressable
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => navigation.navigate('VisitDetail', { visitId: item.id })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: colors.ink, fontSize: 18, fontWeight: '800' }}>{item.client_name}</Text>
                  <Text style={styles.subtitle}>{item.location_name}{item.address ? ` · ${item.address}` : ''}</Text>
                </View>
                <ChevronIcon size={16} color={colors.faint} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <StatusBadge status={item.status} />
                <Text style={[styles.subtitle, { fontSize: 13 }]}>{new Date(item.started_at).toLocaleString()}</Text>
              </View>
            </Pressable>
          </FadeIn>
        )}
      />
    </View>
  );
}
