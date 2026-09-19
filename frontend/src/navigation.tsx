import { createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NewVisitScreen from './screens/NewVisitScreen';
import ActiveInspectionScreen from './screens/ActiveInspectionScreen';
import VisitDetailScreen from './screens/VisitDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  NewVisit: undefined;
  ActiveInspection: { visitId: number };
  VisitDetail: { visitId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Se usa desde App.tsx para poder resetear la navegación a Login cuando el
// token expira (401), sin depender de que la pantalla actual lo maneje.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

interface Props {
  initialRoute: keyof RootStackParamList;
}

export default function Navigation({ initialRoute }: Props) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerTintColor: '#102a43', headerTitleStyle: { fontWeight: '700' } }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Mis visitas' }} />
      <Stack.Screen name="NewVisit" component={NewVisitScreen} options={{ title: 'Nueva visita' }} />
      <Stack.Screen name="ActiveInspection" component={ActiveInspectionScreen} options={{ title: 'Inspección activa' }} />
      <Stack.Screen name="VisitDetail" component={VisitDetailScreen} options={{ title: 'Detalle de visita' }} />
    </Stack.Navigator>
  );
}
