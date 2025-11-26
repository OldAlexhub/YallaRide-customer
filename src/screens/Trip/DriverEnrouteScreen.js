import { ORS_API_KEY } from '@env';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import tripApi from '../../api/tripApi';
import BottomSheet from '../../components/sheets/BottomSheet';

const DriverEnrouteScreen = () => {
  const route = useRoute();
  const { tripId } = route.params || {};
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverToPickupRoute, setDriverToPickupRoute] = useState([]);
  const [pickupToDropoffRoute, setPickupToDropoffRoute] = useState([]);

  const getDirections = async (start, end) => {
    if (!start || !end || !ORS_API_KEY) return [];
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}&format=geojson`
      );
      const data = await response.json();
      if (data.features && data.features[0]) {
        return data.features[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
      }
    } catch (error) {
      console.warn('ORS directions error:', error);
    }
    return [];
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const data = await tripApi.getActiveTrip();
        setTrip(data);

        const pickup = data.pickup ? { latitude: data.pickup.latitude, longitude: data.pickup.longitude } : null;
        const dropoff = data.dropoff ? { latitude: data.dropoff.latitude, longitude: data.dropoff.longitude } : null;
        const driverLocation = data.driver?.location ? { latitude: data.driver.location.latitude, longitude: data.driver.location.longitude } : null;

        if (driverLocation && pickup) {
          const route = await getDirections(driverLocation, pickup);
          setDriverToPickupRoute(route);
        }
        if (pickup && dropoff) {
          const route = await getDirections(pickup, dropoff);
          setPickupToDropoffRoute(route);
        }
      } catch (error) {
        console.error('Failed to fetch trip:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text>Unable to load trip details.</Text>
      </View>
    );
  }

  const pickup = trip.pickup ? { latitude: trip.pickup.latitude, longitude: trip.pickup.longitude } : null;
  const dropoff = trip.dropoff ? { latitude: trip.dropoff.latitude, longitude: trip.dropoff.longitude } : null;
  const driverLocation = trip.driver?.location ? { latitude: trip.driver.location.latitude, longitude: trip.driver.location.longitude } : null;

  const region = pickup || driverLocation ? {
    latitude: (pickup?.latitude || driverLocation?.latitude),
    longitude: (pickup?.longitude || driverLocation?.longitude),
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : null;

  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} initialRegion={region}>
          {pickup && <Marker coordinate={pickup} title="Pickup" />}
          {dropoff && <Marker coordinate={dropoff} title="Dropoff" pinColor="green" />}
          {driverLocation && <Marker coordinate={driverLocation} title="Driver" pinColor="blue" />}
          {driverToPickupRoute.length > 0 && (
            <Polyline coordinates={driverToPickupRoute} strokeColor="#22c55e" strokeWidth={4} />
          )}
          {pickupToDropoffRoute.length > 0 && (
            <Polyline coordinates={pickupToDropoffRoute} strokeColor="#2563eb" strokeWidth={4} />
          )}
        </MapView>
      )}

      <BottomSheet>
        <Text style={styles.title}>Driver en route</Text>
        <Text style={styles.text}>Your driver is heading to the pickup point.</Text>
        {typeof trip.fare === 'number' ? (
          <Text style={styles.info}>Fare: {trip.fare.toFixed(2)} EGP {trip.discountPercent ? `(${trip.discountPercent}% off)` : ''}</Text>
        ) : trip.fareEstimate ? (
          <Text style={styles.info}>Estimated fare: {trip.fareEstimate.toFixed(2)} EGP</Text>
        ) : null}
        {trip.distanceKm && (
          <Text style={styles.info}>Trip distance: {trip.distanceKm.toFixed(1)} km</Text>
        )}
        {trip.etaMinutes && (
          <Text style={styles.info}>ETA to dropoff: ~{trip.etaMinutes} min</Text>
        )}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
    marginBottom: 12,
  },
  info: {
    textAlign: 'center',
    marginBottom: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DriverEnrouteScreen;

