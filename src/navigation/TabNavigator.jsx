import { useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuthSession } from '../hooks';
import { AndroidTabBar } from './AndroidTabBar';
import {
  AccountStackNavigator,
  DocumentsStackNavigator,
  FaylStackNavigator,
  HomeStackNavigator,
} from './stacks';
import { PUBLIC_TAB_ROUTE_NAMES } from './tabConstants';
import { BlurTabBar } from './BlurTabBar';

export { PUBLIC_TAB_ROUTE_NAMES };

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const { isAuthenticated, openAuth } = useAuthSession();

  const guardProtectedTab = useCallback(
    e => {
      if (!isAuthenticated) {
        e.preventDefault();
        openAuth();
      }
    },
    [isAuthenticated, openAuth],
  );

  const protectedListeners = useMemo(
    () => ({
      tabPress: guardProtectedTab,
    }),
    [guardProtectedTab],
  );

  // const renderTabBar = useCallback(props => <AndroidTabBar {...props} />, []);
  const renderTabBar = useCallback(props => <BlurTabBar {...props} />, []);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Ստեղծել',
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsStackNavigator}
        options={{
          title: 'Փաստաթղթեր',
        }}
        listeners={protectedListeners}
      />
      <Tab.Screen
        name="Files"
        component={FaylStackNavigator}
        options={{
          title: 'Ֆայլեր',
        }}
        listeners={protectedListeners}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={{
          headerShown: false,
          title: 'Հաշիվ',
        }}
        listeners={protectedListeners}
      />
    </Tab.Navigator>
  );
}
