import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilesMainScreen, PersonalDocumentViewScreen } from '../../screens/main/files';
import { useStackScreenOptions, useThemedFocusStatusBar, useThemedStyles } from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';

const Fayl = createNativeStackNavigator();

const FaylMainHeader = () => {
  const styles = useThemedStyles(createHeaderStyles);

  return (
    <View style={styles.container}>
      <MainHeader />
    </View>
  );
};

const faylMainScreenOptions = nestedScreenOptions => ({
  ...nestedScreenOptions,
  headerShown: true,
  contentStyle: { zIndex: 0 },
  header: FaylMainHeader,
});

export function FaylStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();
  useThemedFocusStatusBar();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Fayl.Navigator
        initialRouteName="FilesMain"
        screenOptions={{ headerShown: false,
           // animation: 'fade' 
          }}
      >
        <Fayl.Screen
          name="FilesMain"
          component={FilesMainScreen}
          options={faylMainScreenOptions(nestedScreenOptions)}
        />
        <Fayl.Screen
          name="PersonalDocumentView"
          component={PersonalDocumentViewScreen}
          options={{ headerShown: false }}
        />
      </Fayl.Navigator>
    </SafeAreaView>
  );
}

const createHeaderStyles = colors =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 8,
    },
  });
