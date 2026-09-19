import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation';
import { colors, styles } from '../styles';
import FadeIn from '../components/FadeIn';
import SlideToStart from '../components/SlideToStart';

type Props = NativeStackScreenProps<RootStackParamList, 'NewVisit'>;

const FIELDS: Array<[string, keyof typeof initialState]> = [
  ['Cliente', 'client'],
  ['Lugar', 'location'],
  ['Dirección (opcional)', 'address'],
];

const initialState = { client: '', location: '', address: '' };

export default function NewVisitScreen({ navigation }: Props) {
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const setters: Record<string, (text: string) => void> = { client: setClient, location: setLocation, address: setAddress };
  const values: Record<string, string> = { client, location, address };

  async function submit() {
    setError('');
    try {
      const { data } = await api.post('/visits', { client_name: client, location_name: location, address });
      navigation.replace('ActiveInspection', { visitId: data.id });
    } catch (e: any) {
      // Se relanza el error para que el control "Slide to Start" sepa que
      // debe volver a su posición inicial y permitir reintentar, en vez de
      // quedarse trabado como completado.
      setError(e.response?.data?.message ?? 'No se pudo crear la visita');
      throw e;
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { flex: 1 }]}>
        <FadeIn style={{ gap: 14 }}>
          <Text style={styles.title}>Nueva visita</Text>
          <Text style={styles.subtitle}>Registra el lugar antes de iniciar la inspección.</Text>

          {FIELDS.map(([label, key]) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={values[key]}
                onChangeText={setters[key]}
                placeholder={label}
                placeholderTextColor={colors.faint}
              />
            </View>
          ))}

          {!!error && <Text style={styles.error}>{error}</Text>}
        </FadeIn>
      </View>

      <View style={[styles.content, { paddingTop: 0 }]}>
        <FadeIn delay={80}>
          <SlideToStart label="Desliza para iniciar la inspección →" runningLabel="Iniciando…" onComplete={submit} />
        </FadeIn>
      </View>
    </View>
  );
}
