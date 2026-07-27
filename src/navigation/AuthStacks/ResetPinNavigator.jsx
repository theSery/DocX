import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FaceIdScreen } from '../../screens/main/home/FaceIdScreen';
import { PinVerificationScreen, ResetPinScreen } from '../../screens/faceId';
import { animation } from '../constants';

const Stack = createNativeStackNavigator();

export function ResetPinNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="FaceIdHome"
      screenOptions={{
        headerShown: false,
        animation,
      }}
    >
      <Stack.Screen name="FaceIdHome" component={FaceIdScreen} />
      <Stack.Screen name="PinVerification" component={PinVerificationScreen} />
      <Stack.Screen name="ResetPin" component={ResetPinScreen} />
    </Stack.Navigator>
  );
}
