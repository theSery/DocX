import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DocumentsScreen } from '../screens/main/documents';
import { FilesScreen } from '../screens/main/files';
import { AccountStackNavigator, HomeStackNavigator } from './stacks';
import { BlurTabBar } from './BlurTabBar';

const Tab = createBottomTabNavigator();

const renderBlurTabBar = props => <BlurTabBar {...props} />;

export function TabNavigator() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Tab.Navigator
        tabBar={renderBlurTabBar}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{ title: 'Ստեղծել' }}
        />
        <Tab.Screen
          name="Documents"
          component={DocumentsScreen}
          options={{ title: 'Փաստաթղթեր' }}
        />
        <Tab.Screen
          name="Files"
          component={FilesScreen}
          options={{ title: 'Ֆայլեր' }}
        />
        <Tab.Screen
          name="Account"
          component={AccountStackNavigator}
          options={{ title: 'Հաշիվ' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
