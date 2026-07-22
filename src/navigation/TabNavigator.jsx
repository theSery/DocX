import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AccountStackNavigator, DocumentsStackNavigator, FaylStackNavigator, HomeStackNavigator } from './stacks';
import { BlurTabBar } from './BlurTabBar';
import { PUBLIC_TAB_ROUTE_NAMES } from './tabConstants';

export { PUBLIC_TAB_ROUTE_NAMES };

const Tab = createBottomTabNavigator();

const renderBlurTabBar = props => <BlurTabBar {...props} />;

export function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderBlurTabBar}
      screenOptions={{
        headerShown: false,
        // Keep scene content full-bleed under the floating blur tab bar.
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Ստեղծել',
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsStackNavigator}
        options={{ title: 'Փաստաթղթեր' }}
      />
      <Tab.Screen
        name="Files"
        component={FaylStackNavigator}
        options={{ title: 'Ֆայլեր' }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={{
          headerShown: false,
          title: 'Հաշիվ',
          // unmountOnBlur: true,
        }}
      />
    </Tab.Navigator>
  );
}
