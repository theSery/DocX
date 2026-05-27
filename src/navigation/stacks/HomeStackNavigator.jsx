import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DocumentCreateScreen,
  FillInDetailsScreen,
  HomeScreen,
} from '../../screens/main/home';
import { useStackScreenOptions } from '../../hooks';
import HomeStackHeader from '../../components/headers/HomeStackHeader';
import { CategoryScreen } from '../../screens/main/home/CategoryScreen';

const Stack = createNativeStackNavigator();

const nestedScreenOptionsWithHeader = (nestedScreenOptions, title) => ({
  ...nestedScreenOptions,
  title,
  headerShown: true,
  header: ({ navigation }) => (
    <HomeStackHeader onPress={() => navigation.goBack()} />
  ),
});

export function HomeStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 100 }}>
      <Stack.Screen name="HomeMain" 
          options={nestedScreenOptionsWithHeader(
            nestedScreenOptions,
            'Home',
          )}
      component={HomeScreen} />
          <Stack.Screen name="Category" 
          options={nestedScreenOptionsWithHeader(
            nestedScreenOptions,
            'Categories',
          )}
      component={CategoryScreen} />
      <Stack.Screen
        name="FillInDetails"
        component={FillInDetailsScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          'Fill in details',
        )}
      />
      <Stack.Screen
        name="DocumentCreate"
        component={DocumentCreateScreen}
        options={nestedScreenOptionsWithHeader(
          nestedScreenOptions,
          'Create document',
        )}
      />
    </Stack.Navigator>
  );
}
