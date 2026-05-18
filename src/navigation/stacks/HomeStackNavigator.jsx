import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DocumentCreateScreen,
  FillInDetailsScreen,
  HomeScreen,
} from '../../screens/main/home';
import { colors } from '../../theme/colors';

const Stack = createNativeStackNavigator();

const nestedScreenOptions = {
  headerShown: true,
  headerTintColor: colors.primary,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { color: colors.text, fontWeight: '600' },
  headerShadowVisible: false,
};

export function HomeStackNavigator() {
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
