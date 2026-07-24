import { useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DocumentsSvg from '../components/icons/DocumentsSvg';
import FilesSvg from '../components/icons/FilesSvg';
import HomeSvg from '../components/icons/HomeSvg';
import UserSvg from '../components/icons/UserSvg';
import { useAuthSession, useTheme } from '../hooks';
import { FONT_FAMILY, palette } from '../theme';
import { TabBarBlurBackground } from './TabBarBlurBackground';
import {
  TabBarGlassBackground,
  TAB_BAR_LAYOUT,
  tabBarFloatingStyle,
} from './TabBarGlassBackground';
import {
  AccountStackNavigator,
  DocumentsStackNavigator,
  FaylStackNavigator,
  HomeStackNavigator,
} from './stacks';
import { PUBLIC_TAB_ROUTE_NAMES } from './tabConstants';
import { BlurTabBar } from './BlurTabBar';
import { View } from 'react-native';

export { PUBLIC_TAB_ROUTE_NAMES };

const Tab = createBottomTabNavigator();

// const renderTabBarBackground = () => (
//   <>
//     {/* <TabBarBlurBackground /> */}
//     <TabBarGlassBackground />
//   </>
// );

function HomeTabIcon({ color }) {
  return <HomeSvg width={23} height={23} fill={color} />;
}

function DocumentsTabIcon({ color }) {
  return(
    <View style={{ backgroundColor: '#1D3D81', width: 80, height: "100%", justifyContent: 'center', alignItems: 'center' }}>
      <DocumentsSvg width={27} height={27} fill={color} />
    </View>
  );
}

function FilesTabIcon({ color }) {
  return <FilesSvg width={23} height={23} fill={color} />;
}

function AccountTabIcon({ color }) {
  return <UserSvg width={23} height={23} fill={color} />;
}

export function TabNavigator() {
  // const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const { isAuthenticated, openAuth } = useAuthSession();

  // const bottomInset = Math.max(
  //   (insets?.bottom ?? 0) - TAB_BAR_LAYOUT.bottomOffset,
  //   0,
  // );

  const tabBarStyle = useMemo(
    () => ({
      // ...tabBarFloatingStyle,
      // marginBottom: bottomInset,
      shadowColor: colors.shadow,
    }),
    [colors.shadow],
  );

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
// const renderTabBar = props => <BlurTabBar {...props} />
  return (
    <Tab.Navigator
      initialRouteName="Home"
      // tabBar={renderTabBar}


      screenOptions={{
        headerShown: false,
        tabBarStyle,
        // tabBarBackground: renderTabBarBackground,
        tabBarActiveTintColor: colors.mainWhite,
        tabBarInactiveTintColor: isDarkMode
          ? colors.textSecondary
          : colors.text,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: FONT_FAMILY.semiBold,
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Ստեղծել',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsStackNavigator}
        options={{
          title: 'Փաստաթղթեր',
          tabBarIcon: DocumentsTabIcon,
        }}
        listeners={protectedListeners}
      />
      <Tab.Screen
        name="Files"
        component={FaylStackNavigator}
        options={{
          title: 'Ֆայլեր',
          tabBarIcon: FilesTabIcon,
        }}
        listeners={protectedListeners}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={{
          headerShown: false,
          title: 'Հաշիվ',
          tabBarIcon: AccountTabIcon,
        }}
        listeners={protectedListeners}
      />
    </Tab.Navigator>
  );
}
