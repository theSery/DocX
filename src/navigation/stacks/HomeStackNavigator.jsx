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

const nestedScreenOptionsWithHeader = (
  nestedScreenOptions,
  { title, subtitle, showSearch = true },
) => ({
  ...nestedScreenOptions,
  title,
  headerSubtitle: subtitle,
  headerShowSearch: showSearch,
  headerShown: true,
  header: ({ navigation, options }) => (
    <HomeStackHeader
      onPress={() => navigation.goBack()}
      title={options.title}
      subtitle={options.headerSubtitle}
      showSearch={options.headerShowSearch}
    />
  ),
});

export function HomeStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade',  }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: 'Բաժիններ',
          subtitle: 'Ընտրեք բողոքարկվող փաստաթղթի տեսակը',
        })}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: 'Կատեգորիա',
          subtitle: 'Ընտրեք փաստաթուղթ',
          showSearch: false,
        })}
      />
      <Stack.Screen
        name="FillInDetails"
        component={FillInDetailsScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: 'Fill in details',
        })}
      />
      <Stack.Screen
        name="DocumentCreate"
        component={DocumentCreateScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: 'Create document',
        })}
      />
    </Stack.Navigator>
  );
}
