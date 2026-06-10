import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DocumentsScreen } from '../screens/main/documents';
import { FilesScreen } from '../screens/main/files';
import { AccountStackNavigator, HomeStackNavigator } from './stacks';
import { BlurTabBar } from './BlurTabBar';

const Tab = createBottomTabNavigator();

const renderBlurTabBar = props => <BlurTabBar {...props} />;

export function TabNavigator() {

  return (
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={renderBlurTabBar}
        screenOptions={{
          headerShown: false,
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
          options={{ headerShown: false, title: 'Հաշիվ' }}
          
        />
      </Tab.Navigator>
  
  );
}

