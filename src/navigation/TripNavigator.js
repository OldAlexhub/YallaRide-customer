import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchDriverScreen from '../screens/Trip/SearchDriverScreen';
import DriverAssignedScreen from '../screens/Trip/DriverAssignedScreen';
import DriverEnrouteScreen from '../screens/Trip/DriverEnrouteScreen';
import DriverNearbyScreen from '../screens/Trip/DriverNearbyScreen';
import TripInProgressScreen from '../screens/Trip/TripInProgressScreen';
import TripSummaryScreen from '../screens/Trip/TripSummaryScreen';
import GeofenceErrorScreen from '../screens/Errors/GeofenceErrorScreen';
import ServiceUnavailableScreen from '../screens/Errors/ServiceUnavailableScreen';
import NoDriversScreen from '../screens/Errors/NoDriversScreen';

const Stack = createNativeStackNavigator();

const TripNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchDriver" component={SearchDriverScreen} />
      <Stack.Screen name="DriverAssigned" component={DriverAssignedScreen} />
      <Stack.Screen name="DriverEnroute" component={DriverEnrouteScreen} />
      <Stack.Screen name="DriverNearby" component={DriverNearbyScreen} />
      <Stack.Screen name="TripInProgress" component={TripInProgressScreen} />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} />
      <Stack.Screen name="GeofenceError" component={GeofenceErrorScreen} />
      <Stack.Screen name="ServiceUnavailable" component={ServiceUnavailableScreen} />
      <Stack.Screen name="NoDrivers" component={NoDriversScreen} />
    </Stack.Navigator>
  );
};

export default TripNavigator;
