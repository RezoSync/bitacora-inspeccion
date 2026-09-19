import * as ImagePicker from 'expo-image-picker';
import { api, API_ROOT_URL } from './client';

export interface UploadedEvidence {
  id: number;
  visit_id: number;
  type: string;
  file_name: string;
  file_path: string;
}

/**
 * Abre la cámara o la galería, y si el usuario elige un archivo lo sube al
 * endpoint POST /visits/:id/evidence del backend (multer). Antes este
 * endpoint existía en el backend pero ninguna pantalla lo llamaba.
 */
export async function pickAndUploadEvidence(
  visitId: number,
  source: 'camera' | 'library',
): Promise<UploadedEvidence | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Se necesita permiso de cámara/galería para adjuntar evidencia');
  }

  const pickerOptions: ImagePicker.ImagePickerOptions = { quality: 0.7 };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const inferredName = asset.uri.split('/').pop() ?? `evidence-${Date.now()}.jpg`;
  const fileName = asset.fileName ?? inferredName;
  const mimeType = asset.mimeType ?? (fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');

  const formData = new FormData();
  // React Native espera este shape especial para archivos en FormData.
  formData.append('evidence', {
    uri: asset.uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const { data } = await api.post<UploadedEvidence>(`/visits/${visitId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export function resolveEvidenceUrl(filePath: string): string {
  return `${API_ROOT_URL}${filePath}`;
}
