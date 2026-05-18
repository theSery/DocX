/**
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashGate } from './src/components';
import { AuthProvider } from './src/contexts';
import { useNavigationTheme } from './src/hooks';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ColorSchemeProvider } from './src/theme';

function AppNavigation() {
  const navigationTheme = useNavigationTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ColorSchemeProvider>
        <SafeAreaProvider>
          <SplashGate>
            <AuthProvider>
              <AppNavigation />
            </AuthProvider>
          </SplashGate>
        </SafeAreaProvider>
      </ColorSchemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
