import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AccountStackNavigator, DocumentsStackNavigator, FaylStackNavigator, HomeStackNavigator } from './stacks';
import { BlurTabBar } from './BlurTabBar';

const Tab = createBottomTabNavigator();

export const PUBLIC_TAB_ROUTE_NAMES = ['Home'];

const renderBlurTabBar = props => <BlurTabBar {...props} />;

export function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      // tabBar={renderBlurTabBar}
      screenOptions={{
        headerShown: false,
        // animation: 'fade',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
          const hideTabBar = routeName === 'SubCategoryScreen';

          return {
            title: 'Ստեղծել',
            tabBarStyle: hideTabBar ? { display: 'none' } : undefined,
          };
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
