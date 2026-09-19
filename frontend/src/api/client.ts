import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const TOKEN_KEY = '@bitacora/token';

// Antes la URL del backend estaba fija en 'http://10.0.2.2:3000', lo cual
// solo funciona en el emulador de Android. Esta función intenta reutilizar
// la IP del servidor de Metro/Expo (funciona en dispositivos físicos y en
// el simulador de iOS conectados por LAN o túnel) y solo si no la
// encuentra cae en los valores por defecto de cada plataforma.
function resolveApiHost(): string {
  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    (Constants as unknown as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })
      .manifest2?.extra?.expoClient?.hostUri ??
    (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  // Fallbacks conocidos cuando no se pudo detectar la IP del dev server.
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
}

const API_PORT = 3000;
export const API_ROOT_URL = `http://${resolveApiHost()}:${API_PORT}`;
export const API_BASE_URL = `${API_ROOT_URL}/api`;

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Permite que la app reaccione globalmente cuando el token expira o es
// inválido (401), sin que cada pantalla tenga que revisarlo por su cuenta.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);
