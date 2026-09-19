import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { api, TOKEN_KEY } from '../api/client';
import { RootStackParamList } from '../navigation';
import { colors, styles } from '../styles';


type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
  setError('');
  setLoading(true);
  try {
    console.log('1. enviando login a', api); // importa API_BASE_URL de '../api/client'
     console.log('Payload enviado:', JSON.stringify({ username, password }));
     
    const { data } = await api.post('/auth/login', { username, password });
    console.log('2. respuesta recibida', data);

   

    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    console.log('3. token guardado');

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = hasHardware && (await LocalAuthentication.isEnrolledAsync());
    console.log('4. hasHardware', hasHardware, 'isEnrolled', isEnrolled);

    if (isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirma tu identidad',
      });
      console.log('5. resultado biometría', result);
      if (!result.success) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setError('No se pudo verificar tu identidad. Intenta de nuevo.');
        return;
      }
    }

    console.log('6. navegando a Home');
    navigation.replace('Home');
  } catch (requestError: any) {
    console.log('ERROR:', requestError?.message, requestError?.response?.status, requestError?.response?.data);
    setError(requestError.response?.data?.message ?? 'No se pudo iniciar sesión');
  } finally {
    setLoading(false);
  }
}

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.content, { flex: 1, justifyContent: 'center' }]}>
        <Text style={styles.title}>Bitácora de inspección</Text>
        <Text style={styles.subtitle}>Accede para continuar con tus visitas de campo.</Text>
        <View>
          <Text style={styles.label}>Usuario o correo</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
        </View>
        <View>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={submit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Validando...' : 'Iniciar sesión'}</Text>
        </Pressable>
        {loading && <ActivityIndicator color={colors.teal} />}
      </View>
    </KeyboardAvoidingView>
  );
}
