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

const Home = createNativeStackNavigator();

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
  contentStyle: { zIndex: 0 },
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
    <Home.Navigator
     initialRouteName="HomeMain" 
     screenOptions={{ headerShown: false, animation: 'fade' }}
     >
      <Home.Screen
        name="HomeMain"
        component={HomeScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: 'Բաժիններ',
          subtitle: 'Ընտրեք բողոքարկվող փաստաթղթի տեսակը',
          collapsible: false,
          isMainHeader: true
        })}
      />
      <Home.Screen
        name="Category"
        component={CategoryScreen}
        options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
          title: '',
          subtitle: '',
          // showSearch: true,
          collapsible: false,
          
        })}
      />
           <Home.Screen
        name="SubCategoryScreen"
        component={SubCategoryScreen}
        options={({ route }) =>
          nestedScreenOptionsWithHeader(nestedScreenOptions, {
            title: route.params?.title ?? '',
            subtitle: route.params?.subtitle ?? '',
            collapsible: true,
          
          
        })}
      />
      <Home.Screen
        name="FillInDetails"
        component={FillInDetailsScreen}
        options={{ headerShown: false }}
      />
      <Home.Screen
        name="DocumentCreate"
        component={DocumentCreateScreen}
        options={{ headerShown: false }}
      />
    </Home.Navigator>
    </HomeStackHeaderScrollProvider>
    </SafeAreaView>
  );
}
