/**
 * @format
 */

import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { SplashGate } from './src/components';
import { AppToast } from './src/components/toast/AppToast';
import { GlobalSheetProvider } from './src/components/GlobalSheet';
import { AuthProvider } from './src/contexts';
import { useNavigationTheme } from './src/hooks';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store } from './src/store';
import { ColorSchemeProvider } from './src/theme';
import { clearCredentialsIfReinstalled } from './src/utils/credentialCleanup';

function AppNavigation() {
  const navigationTheme = useNavigationTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function App() {
  const [credentialsChecked, setCredentialsChecked] = useState(false);

  useEffect(() => {
    clearCredentialsIfReinstalled().finally(() => setCredentialsChecked(true));
  }, []);

  if (!credentialsChecked) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ReduxProvider store={store}>
        <ColorSchemeProvider>
          <SafeAreaProvider>
            <AuthProvider>
              <SplashGate>
                <GlobalSheetProvider>
                  <AppNavigation />
                  <AppToast />
                </GlobalSheetProvider>
              </SplashGate>
            </AuthProvider>
          </SafeAreaProvider>
        </ColorSchemeProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
