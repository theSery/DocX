import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  DocumentCreateScreen,
  FillInDetailsScreen,
  HomeScreen,
  SubCategoryScreen,
} from '../../screens/main/home';
import { useStackScreenOptions } from '../../hooks';
import HomeStackHeader from '../../components/headers/HomeStackHeader';
import { CategoryScreen } from '../../screens/main/home/CategoryScreen';
import { HomeStackHeaderScrollProvider } from '../../context/HomeStackHeaderScrollContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const nestedScreenOptionsWithHeader = (
  nestedScreenOptions,
  { title, subtitle, showSearch = true, collapsible = true, isMainHeader = false },
) => ({
  ...nestedScreenOptions,
  title,
  headerSubtitle: subtitle,
  headerShowSearch: showSearch,
  headerCollapsible: collapsible,
  headerShown: true,
  isMainHeader,
  header: ({ navigation, options }) => (
    <HomeStackHeader
      onPress={options.isMainHeader ? undefined : () => navigation.goBack()}
      title={options.title}
      subtitle={options.headerSubtitle}
      showSearch={options.headerShowSearch}
      collapsible={options.headerCollapsible}
    />
  ),
});

export function HomeStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <HomeStackHeaderScrollProvider>
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade',  }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: 'Բաժիններ',
          subtitle: 'Ընտրեք բողոքարկվող փաստաթղթի տեսակը',
          collapsible: false,
          isMainHeader: true
        })}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: '',
          subtitle: '',
          // showSearch: true,
          collapsible: false,
          
        })}
      />
           <Stack.Screen
        name="SubCategoryScreen"
        component={SubCategoryScreen}
        options={({ route }) =>
          nestedScreenOptionsWithHeader(nestedScreenOptions, {
            title: route.params?.title ?? '',
            subtitle: route.params?.subtitle ?? '',
            collapsible: true,
          
          
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
    </HomeStackHeaderScrollProvider>
    </SafeAreaView>
  );
}
