import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DocumentsScreen } from '../../screens/main/documents';
import { useStackScreenOptions } from '../../hooks';
import HomeStackHeader from '../../components/headers/HomeStackHeader';
import { HomeStackHeaderScrollProvider } from '../../context/HomeStackHeaderScrollContext';

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

export function DocumentsStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <HomeStackHeaderScrollProvider>
        <Stack.Navigator
          initialRouteName="DocumentsMain"
          screenOptions={{ headerShown: false, animation: 'fade' }}
        >
          <Stack.Screen
            name="DocumentsMain"
            component={DocumentsScreen}
            options={nestedScreenOptionsWithHeader(nestedScreenOptions, {
              title: 'Փաստաթղթեր',
              subtitle: 'Ընդհանուր գեներացվել է 3 փաստաթուղթ',
              collapsible: false,
              isMainHeader: true,
            })}
          />
        </Stack.Navigator>
      </HomeStackHeaderScrollProvider>
    </SafeAreaView>
  );
}
