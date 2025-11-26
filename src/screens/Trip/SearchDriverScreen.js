import { ORS_API_KEY } from '@env';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import tripApi from '../../api/tripApi';
import BottomSheet from '../../components/sheets/BottomSheet';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';

const SearchDriverScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tripStatus, accountStatus } = useSocket();
  const { user } = useAuth();
  const discountPercent = Number(user?.discountPercent ?? user?.loyalty?.discountPercent ?? 0);
  const { tripId, pickup, dropoff, fareEstimate, fare: finalFare, discountPercent: tripDiscountPercent, discountAmount: tripDiscountAmount, distanceKm, etaMinutes, scheduledAt } = route.params || {};
  const isScheduled = !!scheduledAt;
  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  const [routeLine, setRouteLine] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!pickup || !dropoff || !ORS_API_KEY) return;
      try {
        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pickup.longitude},${pickup.latitude}&end=${dropoff.longitude},${dropoff.latitude}&format=geojson`
        );
        const data = await response.json();
        if (data.features && data.features[0]) {
          const coords = data.features[0].geometry.coordinates.map((coord) => ({
            latitude: coord[1],
            longitude: coord[0],
          }));
          setRouteLine(coords);
        }
      } catch (e) {
        console.warn('ORS route error', e);
      }
    };
    fetchRoute();
  }, [pickup, dropoff]);

  useEffect(() => {
    if (!tripStatus) return;
    if (tripStatus.event === 'trip:assigned') {
      navigation.replace('DriverAssigned', {
        tripId: tripStatus.data?.id || tripId,
        pickup,
        dropoff,
        fareEstimate,
        fare: tripStatus.data?.fare ?? finalFare,
        discountPercent: tripStatus.data?.discountPercent ?? tripDiscountPercent,
        discountAmount: tripStatus.data?.discountAmount ?? tripDiscountAmount,
        distanceKm,
        etaMinutes,
        driverLocation: tripStatus.data?.driver?.location || tripStatus.data?.driver_location,
      });
    }
    if (tripStatus.event === 'trip:canceled') {
      navigation.goBack();
    }
    if (
      tripStatus.event === 'trip:update' &&
      (tripStatus.data?.status === 'no_drivers' || tripStatus.data?.reason === 'no_drivers')
    ) {
      navigation.replace('NoDrivers');
    }
  }, [tripStatus, navigation, tripId, pickup, dropoff, fareEstimate, distanceKm, etaMinutes]);

  useEffect(() => {
    if (!accountStatus) return;
    if (accountStatus.type === 'banned' || accountStatus.type === 'blocked') {
      // blocked can be temporary (blockedUntil) or permanent ban
      navigation.navigate('Banned', {
        message: accountStatus.data?.message,
        blockedUntil: accountStatus.data?.blockedUntil,
      });
    } else if (accountStatus.type === 'warning') {
      navigation.navigate('Warning', { message: accountStatus.data?.message });
    }
  }, [accountStatus, navigation]);

  const handleCancel = async () => {
    try {
      if (tripId) {
        await tripApi.cancelTrip(tripId);
      }
    } finally {
      navigation.goBack();
    }
  };

  const region =
    pickup && dropoff
      ? {
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : null;

  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} initialRegion={region}>
          {pickup && <Marker coordinate={pickup} title="Pickup" />}
          {dropoff && <Marker coordinate={dropoff} title="Dropoff" pinColor="green" />}
          {routeLine.length > 0 && (
            <Polyline coordinates={routeLine} strokeColor="#2563eb" strokeWidth={4} />
          )}
        </MapView>
      )}

      <BottomSheet>
        {isScheduled ? (
          <>
            <Text style={styles.title}>Trip scheduled</Text>
            <Text style={styles.info}>Your trip has been scheduled for:</Text>
            <Text style={[styles.info, { fontWeight: '700', marginBottom: 8 }]}>{scheduledDate ? scheduledDate.toLocaleString() : scheduledAt}</Text>
            <Text style={styles.info}>We will notify you when a driver is assigned.</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Looking for a driver…</Text>
            <ActivityIndicator size="large" style={styles.spinner} />
          </>
        )}
        {typeof finalFare === 'number' ? (
          <Text style={styles.info}>Fare: {finalFare.toFixed(2)} EGP {tripDiscountPercent > 0 ? `(${tripDiscountPercent}% off)` : ''}</Text>
        ) : (typeof fareEstimate === 'number' && (
          discountPercent > 0 ? (
            <Text style={styles.info}>
              Estimated fare: <Text style={styles.strike}>{fareEstimate.toFixed(2)} EGP</Text> {((fareEstimate) * (1 - discountPercent / 100)).toFixed(2)} EGP ({discountPercent}% off)
            </Text>
          ) : (
            <Text style={styles.info}>Estimated fare: {fareEstimate.toFixed(2)} EGP</Text>
          )
        ))}
        {typeof distanceKm === 'number' && (
          <Text style={styles.info}>Distance: {distanceKm.toFixed(1)} km</Text>
        )}
        {typeof etaMinutes === 'number' && (
          <Text style={styles.info}>ETA to dropoff: ~{etaMinutes} min</Text>
        )}
        <Button title={isScheduled ? 'Cancel scheduled trip' : 'Cancel ride'} onPress={handleCancel} />
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
    textAlign: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  info: {
    textAlign: 'center',
    marginBottom: 4,
  },
  strike: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
});

export default SearchDriverScreen;

