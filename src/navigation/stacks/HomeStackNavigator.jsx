import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DocumentCreateScreen,
  FillInDetailsScreen,
  HomeScreen,
} from '../../screens/main/home';
import { useStackScreenOptions } from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';
import { CategoryScreen } from '../../screens/main/home/CategoryScreen';

const Stack = createNativeStackNavigator();

const nestedScreenOptionsWithHeader = (nestedScreenOptions, title) => ({
  ...nestedScreenOptions,
  title,
  headerShown: true,
  header: ({ navigation }) => (
    <MainHeader onPress={() => navigation.goBack()} />
  ),
});

export function HomeStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
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
