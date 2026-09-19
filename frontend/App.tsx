import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Navigation, { navigationRef } from './src/navigation';
import { TOKEN_KEY, setUnauthorizedHandler } from './src/api/client';
import { colors, styles } from './src/styles';

export default function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');

  // Antes la app siempre arrancaba en Login, incluso con un token válido en
  // AsyncStorage. Ahora, si ya hay sesión guardada, entra directo a Home.
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        setInitialRoute(token ? 'Home' : 'Login');
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  // Si el backend responde 401 (token vencido o inválido) en cualquier
  // pantalla, regresamos a Login automáticamente en lugar de dejar la app
  // colgada mostrando errores genéricos.
  const handleUnauthorized = useCallback(() => {
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  if (checkingSession) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: true,
        colors: {
          primary: colors.green,
          background: colors.bg,
          card: colors.bg,
          text: colors.ink,
          border: colors.border,
          notification: colors.green,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Navigation initialRoute={initialRoute} />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
