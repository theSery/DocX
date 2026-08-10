import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CompletePersonalDataScreen,

  DocumentCreateScreen,
  FavoritesScreen,
  FillInDetailsScreen,
  HomeScreen,
  SubCategoryScreen,
} from '../../screens/main/home';
import { useStackScreenOptions, useThemedFocusStatusBar } from '../../hooks';
import HomeStackHeader from '../../components/headers/HomeStackHeader';
import MainHeader from '../../components/headers/MainHeader';
import { CategoryScreen } from '../../screens/main/home/CategoryScreen';
import { HomeStackHeaderScrollProvider } from '../../context/HomeStackHeaderScrollContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { animation } from '../constants';
import { ConfirmPhoneCodeScreenHome } from '../../screens/main/home/ConfirmPhoneCodeScreenHome';

const Home = createNativeStackNavigator();

const nestedScreenOptionsWithHeader = (
  nestedScreenOptions,
  {
    title,
    subtitle,
    showSearch = true,
    collapsible = true,
    isMainHeader = false,
    iconUrl,
  },
) => ({
  ...nestedScreenOptions,
  title,
  headerSubtitle: subtitle,
  headerShowSearch: showSearch,
  headerCollapsible: collapsible,
  headerIconUrl: iconUrl,
  headerShown: true,
  // Collapsible headers overlay the scene so height animation does not
  // resize the ScrollView (which caused scroll jitter / vibration).
  headerTransparent: collapsible,
  ...(collapsible
    ? { headerStyle: { backgroundColor: 'transparent' } }
    : null),
  isMainHeader,
  header: ({ navigation, route, options }) => (
    <HomeStackHeader
      onPress={options.isMainHeader ? undefined : () => navigation.goBack()}
      onFavoritesPress={() => navigation.navigate('Favorites')}
      title={options.title}
      subtitle={options.headerSubtitle}
      showSearch={options.headerShowSearch}
      collapsible={options.headerCollapsible}
      iconUrl={options.headerIconUrl}
      route={route}
    />
  ),
});

export function HomeStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();
  useThemedFocusStatusBar();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <HomeStackHeaderScrollProvider>
        <Home.Navigator
          initialRouteName="HomeMain"
          screenOptions={{ headerShown: false, animation }}
        >
          <Home.Screen
            name="HomeMain"
            component={HomeScreen}
            options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
              title: 'Բաժիններ',
              subtitle: 'Ընտրեք բողոքարկվող փաստաթղթի տեսակը',
              collapsible: false,
              isMainHeader: true,
            })}
          />
          <Home.Screen
            name="Category"
            component={CategoryScreen}
            options={({ route }) =>
              nestedScreenOptionsWithHeader(nestedScreenOptions, {
                title: route.params?.item?.name ?? '',
                iconUrl: route.params?.item?.iconUrl,
                collapsible: false,
              })
            }
          />
          <Home.Screen
            name="SubCategoryScreen"
            component={SubCategoryScreen}
            options={({ route }) =>
              nestedScreenOptionsWithHeader(nestedScreenOptions, {
                title: route.params?.title ?? '',
                subtitle: route.params?.subtitle ?? '',
                collapsible: true,
              })
            }
          />
          <Home.Screen
            name="FillInDetails"
            component={FillInDetailsScreen}
            options={{ headerShown: false }}
          />
          <Home.Screen
            name="CompletePersonalData"
            component={CompletePersonalDataScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Home.Screen
            name="ConfirmPhoneCodeScreenHome"
            component={ConfirmPhoneCodeScreenHome}
            options={{
              headerShown: true,
              header: ({ navigation }) => (
                <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
                  <MainHeader onPress={() => navigation.goBack()} />
                </View>
              ),
            }}
          />
          <Home.Screen
            name="DocumentCreate"
            component={DocumentCreateScreen}
            options={{ headerShown: false }}
          />
          <Home.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              headerShown: true,
              header: ({ navigation }) => (
                <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
                  <MainHeader onPress={() => navigation.goBack()} />
                </View>
              ),
            }}
          />
        </Home.Navigator>
      </HomeStackHeaderScrollProvider>
    </SafeAreaView>
  );
}
