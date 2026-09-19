import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { pickAndUploadEvidence } from '../api/evidence';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation';
import { styles } from '../styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveInspection'>;

const STEP_THRESHOLD = 1.25;
const SAMPLE_INTERVAL_MS = 300;
const STRIDE_METERS = 0.7;

export default function ActiveInspectionScreen({ route, navigation }: Props) {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [notes, setNotes] = useState('');
  const [motion, setMotion] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');

  // Antes se contaba un "paso" cada vez que la muestra estaba por encima del
  // umbral, muestreando cada 500ms. Con `wasAboveThreshold` solo se cuenta el
  // cruce ascendente (de abajo del umbral a arriba), que es una heurística
  // de detección de pasos más estándar y menos propensa a sobre-contar.
  const wasAboveThreshold = useRef(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const intensity = Math.sqrt(x * x + y * y + z * z);
      const isAboveThreshold = intensity > STEP_THRESHOLD;
      if (isAboveThreshold && !wasAboveThreshold.current) {
        setSteps((value) => value + 1);
        setDistance((value) => value + STRIDE_METERS);
      }
      wasAboveThreshold.current = isAboveThreshold;
    });
    return () => subscription.remove();
  }, []);

  async function finish() {
    setFinishError('');
    setFinishing(true);
    try {
      await api.put(`/visits/${route.params.visitId}`, {
        status: 'completed',
        steps_detected: steps,
        distance_m: Number(distance.toFixed(1)),
        motion_summary: motion,
        notes,
      });
      navigation.replace('VisitDetail', { visitId: route.params.visitId });
    } catch (requestError: any) {
      // Antes, si esta petición fallaba (token vencido, sin red, etc.), no
      // se le avisaba nada al usuario: la pantalla simplemente no avanzaba.
      setFinishError(requestError.response?.data?.message ?? 'No se pudo finalizar la visita. Intenta de nuevo.');
    } finally {
      setFinishing(false);
    }
  }

  async function attachEvidence(source: 'camera' | 'library') {
    setEvidenceError('');
    setUploadingEvidence(true);
    try {
      const uploaded = await pickAndUploadEvidence(route.params.visitId, source);
      if (uploaded) setEvidenceCount((value) => value + 1);
    } catch (uploadError: any) {
      setEvidenceError(uploadError?.response?.data?.message ?? uploadError?.message ?? 'No se pudo subir la evidencia');
    } finally {
      setUploadingEvidence(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Inspección activa</Text>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Pasos detectados</Text>
          <Text style={{ fontSize: 34, fontWeight: '800' }}>{steps}</Text>
          <Text style={styles.subtitle}>Distancia aproximada: {distance.toFixed(1)} m</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Evidencia adjuntada: {evidenceCount}</Text>
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

        <Text style={styles.label}>Resumen de movimiento</Text>
        <TextInput style={styles.input} value={motion} onChangeText={setMotion} placeholder="Describe el recorrido" />

        <Text style={styles.label}>Notas</Text>
        <TextInput style={[styles.input, { minHeight: 90 }]} value={notes} onChangeText={setNotes} multiline />

        {!!finishError && <Text style={styles.error}>{finishError}</Text>}
        <Pressable style={[styles.button, { opacity: finishing ? 0.6 : 1 }]} onPress={finish} disabled={finishing}>
          <Text style={styles.buttonText}>{finishing ? 'Guardando...' : 'Finalizar visita'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
