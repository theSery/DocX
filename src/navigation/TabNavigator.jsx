import { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';

import { useAuthSession } from '../hooks';
import {
  AccountStackNavigator,
  DocumentsStackNavigator,
  FaylStackNavigator,
  HomeStackNavigator,
} from './stacks';
import { PUBLIC_TAB_ROUTE_NAMES } from './tabConstants';
import { TabBar } from './TabBar';

export { PUBLIC_TAB_ROUTE_NAMES };

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const { isAuthenticated, openAuth } = useAuthSession();

  const tabListeners = useCallback(
    ({ navigation, route }) => ({
      tabPress: e => {
        if (
          !isAuthenticated &&
          !PUBLIC_TAB_ROUTE_NAMES.includes(route.name)
        ) {
          e.preventDefault();
          openAuth();
          return;
        }

        // Re-pressing the active tab always returns to that tab's main screen.
        const nestedState = route.state;
        if (
          navigation.isFocused() &&
          nestedState?.key != null &&
          nestedState.index > 0
        ) {
          navigation.dispatch({
            ...StackActions.popToTop(),
            target: nestedState.key,
          });
        }
      },
    }),
    [isAuthenticated, openAuth],
  );

  const renderTabBar = useCallback(props => <TabBar {...props} />, []);

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
        listeners={tabListeners}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsStackNavigator}
        options={{
          title: 'Փաստաթղթեր',
        }}
        listeners={tabListeners}
      />
      <Tab.Screen
        name="Files"
        component={FaylStackNavigator}
        options={{
          title: 'Ֆայլեր',
        }}
        listeners={tabListeners}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={{
          headerShown: false,
          title: 'Հաշիվ',
        }}
        listeners={tabListeners}
      />
    </Tab.Navigator>
  );
}
