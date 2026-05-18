import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';

import { DocumentsScreen } from '../screens/main/documents';
import { FilesScreen } from '../screens/main/files';
import { useTheme } from '../hooks';
import { AccountStackNavigator, HomeStackNavigator } from './stacks';

const Tab = createNativeBottomTabNavigator();

export function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: 'Documents' }}
      />
      <Tab.Screen
        name="Files"
        component={FilesScreen}
        options={{ title: 'Files' }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}
