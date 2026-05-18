import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DocumentCreateScreen,
  FillInDetailsScreen,
  HomeScreen,
} from '../../screens/main/home';
import { useStackScreenOptions } from '../../hooks';

const Stack = createNativeStackNavigator();

export function HomeStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="FillInDetails"
        component={FillInDetailsScreen}
        options={{ ...nestedScreenOptions, title: 'Fill in details' }}
      />
      <Stack.Screen
        name="DocumentCreate"
        component={DocumentCreateScreen}
        options={{ ...nestedScreenOptions, title: 'Create document' }}
      />
    </Stack.Navigator>
  );
}
