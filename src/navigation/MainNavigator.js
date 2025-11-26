import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BannedScreen from '../screens/Bans/BannedScreen';
import WarningScreen from '../screens/Bans/WarningScreen';
import FounderBenefitsScreen from '../screens/Loyalty/FounderBenefitsScreen';
import EditSavedLocationScreen from '../screens/Main/EditSavedLocationScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import LanguageSelectScreen from '../screens/Main/LanguageSelectScreen';
import NotificationsScreen from '../screens/Main/NotificationsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import RidesHistoryScreen from '../screens/Main/RidesHistoryScreen';
import SettingsScreen from '../screens/Main/SettingsScreen';
import TripNavigator from './TripNavigator';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size, focused }) => {
        let iconName = 'ellipse';
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'History') {
          iconName = focused ? 'time' : 'time-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2563eb',
      tabBarInactiveTintColor: '#6b7280',
      tabBarStyle: {
        backgroundColor: '#020617',
        borderTopColor: '#111827',
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
    })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="History" component={RidesHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const MainNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={Tabs} />
      <RootStack.Screen name="Trip" component={TripNavigator} />
      <RootStack.Screen name="FounderBenefits" component={FounderBenefitsScreen} />
      <RootStack.Screen name="Banned" component={BannedScreen} />
      <RootStack.Screen name="Warning" component={WarningScreen} />
      <RootStack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />
      <RootStack.Screen name="EditSavedLocation" component={EditSavedLocationScreen} />
    </RootStack.Navigator>
  );
};

export default MainNavigator;
