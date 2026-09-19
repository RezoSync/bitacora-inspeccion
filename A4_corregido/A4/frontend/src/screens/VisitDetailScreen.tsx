import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { api } from '../api/client';
import { pickAndUploadEvidence, resolveEvidenceUrl } from '../api/evidence';
import { RootStackParamList } from '../navigation';
import { VisitDetail } from '../types';
import { styles } from '../styles';

type Props = NativeStackScreenProps<RootStackParamList, 'VisitDetail'>;

export default function VisitDetailScreen({ route }: Props) {
  const [visit, setVisit] = useState<VisitDetail>();
  const [loadError, setLoadError] = useState('');
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');

  const loadVisit = useCallback(async () => {
    setLoadError('');
    try {
      const { data } = await api.get<VisitDetail>(`/visits/${route.params.visitId}`);
      setVisit(data);
    } catch (requestError: any) {
      // Antes, si esta petición fallaba, la pantalla se quedaba con el
      // spinner de carga para siempre, sin explicar qué pasó.
      setLoadError(requestError.response?.data?.message ?? 'No se pudo cargar la visita');
    }
  }, [route.params.visitId]);

  useFocusEffect(
    useCallback(() => {
      loadVisit();
    }, [loadVisit]),
  );

  async function attachEvidence(source: 'camera' | 'library') {
    setEvidenceError('');
    setUploadingEvidence(true);
    try {
      const uploaded = await pickAndUploadEvidence(route.params.visitId, source);
      if (uploaded) await loadVisit();
    } catch (uploadError: any) {
      setEvidenceError(uploadError?.response?.data?.message ?? uploadError?.message ?? 'No se pudo subir la evidencia');
    } finally {
      setUploadingEvidence(false);
    }
  }

  if (loadError) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <View style={styles.content}>
          <Text style={styles.error}>{loadError}</Text>
          <Pressable style={styles.button} onPress={loadVisit}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{visit.client_name}</Text>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Lugar</Text>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>{visit.location_name}</Text>
          <Text style={styles.subtitle}>{visit.address || 'Sin dirección'}</Text>
          <Text style={styles.subtitle}>Estado: {visit.status}</Text>
          <Text style={styles.subtitle}>
            Pasos: {visit.steps_detected} · Distancia: {visit.distance_m} m
          </Text>
        </View>

        {visit.notes && (
          <View style={styles.card}>
            <Text style={styles.label}>Notas</Text>
            <Text style={styles.subtitle}>{visit.notes}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Evidencia ({visit.evidence.length})</Text>
          {visit.evidence.length === 0 && <Text style={styles.subtitle}>Aún no hay evidencia adjunta.</Text>}
          {visit.evidence.map((item) =>
            item.type === 'image' ? (
              <Image
                key={item.id}
                source={{ uri: resolveEvidenceUrl(item.file_path) }}
                style={{ width: '100%', height: 180, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <Text key={item.id} style={styles.subtitle}>
                📎 {item.file_name}
              </Text>
            ),
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              style={[styles.button, { flex: 1, opacity: uploadingEvidence ? 0.6 : 1 }]}
              onPress={() => attachEvidence('camera')}
              disabled={uploadingEvidence}
            >
              <Text style={styles.buttonText}>Tomar foto</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { flex: 1, opacity: uploadingEvidence ? 0.6 : 1 }]}
              onPress={() => attachEvidence('library')}
              disabled={uploadingEvidence}
            >
              <Text style={styles.buttonText}>Elegir de galería</Text>
            </Pressable>
          </View>
          {uploadingEvidence && <ActivityIndicator />}
          {!!evidenceError && <Text style={styles.error}>{evidenceError}</Text>}
        </View>
      </View>
    </View>
  );
}
