import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { api } from '../api/client';
import { pickAndUploadEvidence, resolveEvidenceUrl } from '../api/evidence';
import { RootStackParamList } from '../navigation';
import { VisitDetail } from '../types';
import { colors, styles } from '../styles';
import FadeIn from '../components/FadeIn';
import StatusBadge from '../components/StatusBadge';
import { CameraIcon, GalleryIcon } from '../components/Icon';

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
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FadeIn style={{ gap: 14 }}>
        <Text style={styles.title}>{visit.client_name}</Text>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 2, flex: 1 }}>
              <Text style={styles.subtitle}>Lugar</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>{visit.location_name}</Text>
              <Text style={styles.subtitle}>{visit.address || 'Sin dirección'}</Text>
            </View>
            <StatusBadge status={visit.status} />
          </View>

          <View style={{ flexDirection: 'row', gap: 24, marginTop: 10 }}>
            <View>
              <Text style={[styles.statValue, { fontSize: 26 }]}>{visit.steps_detected}</Text>
              <Text style={styles.statLabel}>pasos</Text>
            </View>
            <View>
              <Text style={[styles.statValue, { fontSize: 26 }]}>{visit.distance_m}</Text>
              <Text style={styles.statLabel}>metros</Text>
            </View>
          </View>
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
                style={{ width: '100%', height: 180, borderRadius: 16 }}
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
              style={({ pressed }) => [
                styles.buttonSecondary,
                { flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', opacity: uploadingEvidence ? 0.6 : pressed ? 0.85 : 1 },
              ]}
              onPress={() => attachEvidence('camera')}
              disabled={uploadingEvidence}
            >
              <CameraIcon size={18} color={colors.green} />
              <Text style={styles.buttonSecondaryText}>Tomar foto</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.buttonSecondary,
                { flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', opacity: uploadingEvidence ? 0.6 : pressed ? 0.85 : 1 },
              ]}
              onPress={() => attachEvidence('library')}
              disabled={uploadingEvidence}
            >
              <GalleryIcon size={18} color={colors.green} />
              <Text style={styles.buttonSecondaryText}>Elegir de galería</Text>
            </Pressable>
          </View>
          {uploadingEvidence && <ActivityIndicator color={colors.green} />}
          {!!evidenceError && <Text style={styles.error}>{evidenceError}</Text>}
        </View>
      </FadeIn>
    </ScrollView>
  );
}
