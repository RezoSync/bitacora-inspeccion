import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation';
import { colors, styles } from '../styles';

type Props = NativeStackScreenProps<RootStackParamList, 'NewVisit'>;
export default function NewVisitScreen({ navigation }: Props) { const [client, setClient] = useState(''); const [location, setLocation] = useState(''); const [address, setAddress] = useState(''); const [error, setError] = useState(''); async function submit() { try { const { data } = await api.post('/visits', { client_name: client, location_name: location, address }); navigation.replace('ActiveInspection', { visitId: data.id }); } catch (e: any) { setError(e.response?.data?.message ?? 'No se pudo crear la visita'); } } return <View style={styles.screen}><View style={styles.content}><Text style={styles.title}>Nueva visita</Text><Text style={styles.subtitle}>Registra el lugar antes de iniciar la inspección.</Text>{[['Cliente', client, setClient], ['Lugar', location, setLocation], ['Dirección (opcional)', address, setAddress]].map(([label, value, setter]) => <View key={label as string}><Text style={styles.label}>{label as string}</Text><TextInput style={styles.input} value={value as string} onChangeText={setter as (text: string) => void} /></View>)}{!!error && <Text style={styles.error}>{error}</Text>}<Pressable style={styles.button} onPress={submit}><Text style={styles.buttonText}>Comenzar inspección</Text></Pressable></View></View>; }
