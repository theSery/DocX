import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DocumentSignScreen, DocumentsScreen } from '../../screens/main/documents';
import { useStackScreenOptions, useThemedFocusStatusBar, useThemedStyles } from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';
import { animation } from '../constants';

const Documents = createNativeStackNavigator();

const DocumentsMainHeader = () => {
  const styles = useThemedStyles(createHeaderStyles);

  return (
    <View style={styles.container}>
      <MainHeader />
    </View>
  );
};

const documentsMainScreenOptions = nestedScreenOptions => ({
  ...nestedScreenOptions,
  headerShown: true,
  header: DocumentsMainHeader,
});

export function DocumentsStackNavigator() {
  const nestedScreenOptions = useStackScreenOptions();
  useThemedFocusStatusBar();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Documents.Navigator
        initialRouteName="DocumentsMain"
        screenOptions={{ headerShown: false, animation }}
      >
        <Documents.Screen
          name="DocumentsMain"
          component={DocumentsScreen}
          options={documentsMainScreenOptions(nestedScreenOptions)}
        />
        <Documents.Screen
          name="DocumentSign"
          component={DocumentSignScreen}
          options={{ headerShown: false }}
        />
      </Documents.Navigator>
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
