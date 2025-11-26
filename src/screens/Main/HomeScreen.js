import { ORS_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import announcementApi from '../../api/announcementApi';
import tripApi from '../../api/tripApi';
import AnnouncementCarousel from '../../components/home/AnnouncementCarousel';
import TopBar from '../../components/home/TopBar';
import BottomSheet from '../../components/sheets/BottomSheet';
import { useAuth } from '../../context/AuthContext';
import { usePopup } from '../../context/PopupContext';
import useSocket from '../../hooks/useSocket';
import { addRecentLocation, getSavedLocations } from '../../storage/locationsStorage';

const { height: screenHeight } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const discountPercent = Number(user?.discountPercent ?? user?.loyalty?.discountPercent ?? 0);
  const { tripStatus, accountStatus } = useSocket();
  const { showAlert } = usePopup();

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [pickup, setPickup] = useState(null);
  const [pickupQuery, setPickupQuery] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [editingPickup, setEditingPickup] = useState(false);
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [dropoff, setDropoff] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [homeLocation, setHomeLocation] = useState(null);
  const [workLocation, setWorkLocation] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [estimateError, setEstimateError] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        showAlert('Location permission denied');
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      setLocation(coords);
      setPickup(coords);
      setPickupQuery('Current location');
      setLoadingLocation(false);
    })();
  }, [showAlert]);

  useEffect(() => {
    if (!tripStatus) return;
    if (tripStatus.event === 'trip:assigned') {
      navigation.navigate('Trip', {
        screen: 'DriverAssigned',
        params: {
          tripId: tripStatus.data?.id,
          pickup,
          driverLocation: tripStatus.data?.driver?.location || tripStatus.data?.driver_location,
        },
      });
    }
  }, [tripStatus, navigation, pickup]);

  useEffect(() => {
    if (!accountStatus) return;
    if (accountStatus.type === 'banned') {
      navigation.navigate('Banned', { message: accountStatus.data?.message });
    } else if (accountStatus.type === 'warning') {
      navigation.navigate('Warning', { message: accountStatus.data?.message });
    }
  }, [accountStatus, navigation]);

  // Suggestion helpers (OpenRouteService autocomplete)
  const fetchPickupSuggestions = async (text) => {
    setPickupQuery(text);
    if (!text || !ORS_API_KEY) {
      setPickupSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}`
      );
      const json = await res.json();
      const features = json.features || [];
      setPickupSuggestions(
        features.map((f) => ({
          id: f.properties.id || f.properties.place_id || String(f.properties.label),
          label: f.properties.label,
          coords: { latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] },
        }))
      );
    } catch (e) {
      console.warn('ORS pickup autocomplete error', e);
      setPickupSuggestions([]);
    }
  };

  const fetchSuggestions = async (text) => {
    setDropoffQuery(text);
    if (!text || !ORS_API_KEY) {
      setDropoffSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}`
      );
      const json = await res.json();
      const features = json.features || [];
      setDropoffSuggestions(
        features.map((f) => ({
          id: f.properties.id || f.properties.place_id || String(f.properties.label),
          label: f.properties.label,
          coords: { latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] },
        }))
      );
    } catch (e) {
      console.warn('ORS dropoff autocomplete error', e);
      setDropoffSuggestions([]);
    }
  };

  const onSelectDropoff = (item) => {
    setDropoff(item.coords);
    setDropoffQuery(item.label);
    setDropoffSuggestions([]);
  };

  const fetchEstimate = async () => {
    if (!pickup || !dropoff) {
      setRouteCoords([]);
      setEstimate(null);
      setEstimateError(null);
      return;
    }
    setEstimateLoading(true);
    setEstimateError(null);
    try {
      const payload = {
        pickup: { lat: pickup.latitude, lng: pickup.longitude },
        dropoff: { lat: dropoff.latitude, lng: dropoff.longitude },
      };
      const data = await tripApi.getEstimate(payload);
      setEstimate(data);

      // Fetch route for polyline
      const directionsRes = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pickup.longitude},${pickup.latitude}&end=${dropoff.longitude},${dropoff.latitude}&format=geojson`
      );
      const directionsJson = await directionsRes.json();
      const coords = directionsJson.features[0]?.geometry?.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      })) || [];
      setRouteCoords(coords);
    } catch (e) {
      console.warn('Estimate or directions fetch failed', e);
      setEstimate(null);
      setRouteCoords([]);
      if (e.message === 'Forbidden' || e?.response?.status === 403) {
        setEstimateError('Unable to fetch estimate. Please check your connection or log in again.');
      } else {
        setEstimateError('Unable to fetch estimate. Please try again.');
      }
    } finally {
      setEstimateLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [pickup, dropoff]);

  const handleMapLongPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setDropoff(coordinate);
    setDropoffQuery('Dropped pin');
    setDropoffSuggestions([]);
  };

  const handleRequestRide = async () => {
    if (!pickup || !dropoff) {
      showAlert('Select a dropoff location');
      return;
    }

    // Confirmation dialog
    const confirmMessage = discountPercent > 0 && estimate?.total
      ? `Confirm your ride to ${dropoffQuery}? Estimated cost: ${estimate.total.toFixed(2)} EGP → ${((estimate.total) * (1 - discountPercent / 100)).toFixed(2)} EGP (${discountPercent}% off)`
      : `Confirm your ride to ${dropoffQuery}? Estimated cost: ${estimate?.total?.toFixed(2) || 'N/A'} EGP`;

    Alert.alert(
      'Confirm Ride',
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setRequesting(true);
            try {
              const payload = {
                pickup: {
                  lat: pickup.latitude,
                  lng: pickup.longitude,
                },
                dropoff: {
                  lat: dropoff.latitude,
                  lng: dropoff.longitude,
                },
              };

              // include scheduledAt only when scheduling for future
              if (scheduleType === 'scheduled' && scheduledAt) {
                payload.scheduledAt = scheduledAt.toISOString();
              }
              const data = await tripApi.requestTrip(payload);
              const { tripId, fareEstimate, fare, discountPercent: tripDiscountPercent, discountAmount: tripDiscountAmount, distanceKm, etaDropoffMinutes } = data || {};

              // persist recent dropoff
              try {
                await addRecentLocation({
                  label: dropoffQuery || 'Dropped pin',
                  latitude: dropoff.latitude,
                  longitude: dropoff.longitude,
                });
                const saved = await getSavedLocations();
                setRecentLocations(saved.recent);
              } catch {
                // ignore storage errors
              }

              navigation.navigate('Trip', {
                screen: 'SearchDriver',
                params: { tripId, pickup, dropoff, fareEstimate, fare, discountPercent: tripDiscountPercent, discountAmount: tripDiscountAmount, distanceKm, etaMinutes: etaDropoffMinutes, scheduledAt: scheduledAt ? scheduledAt.toISOString() : null },
              });
            } catch (error) {
              const status = error?.response?.status;
              const reason = error?.response?.data?.reason;
              const message = error?.response?.data?.message;

              if (status === 403) {
                const code = error?.response?.data?.code;
                const blockedUntil = error?.response?.data?.blockedUntil;
                if (code === 'TEMP_BLOCKED') {
                  navigation.navigate('Banned', { message: error?.response?.data?.error || message, blockedUntil });
                  return;
                }
                if (reason === 'banned') {
                  navigation.navigate('Banned', { message });
                  return;
                }
                // fallback - navigate to banned screen for 403
                navigation.navigate('Banned', { message: message || error?.response?.data?.error });
                return;
              }
              if (status === 409 || reason === 'geofence') {
                navigation.navigate('Trip', { screen: 'GeofenceError' });
                return;
              }
              if (status === 503 || reason === 'service_unavailable') {
                navigation.navigate('Trip', { screen: 'ServiceUnavailable' });
                return;
              }

              showAlert('Could not request ride');
            } finally {
              setRequesting(false);
            }
          },
        },
      ]
    );
  };

  // Scheduling UI state
  const [scheduleType, setScheduleType] = useState('now'); // 'now' or 'scheduled'
  const [scheduledAt, setScheduledAt] = useState(null);
  // custom modal state (embedded picker)

  const pickQuickSchedule = (minutes) => {
    const dt = new Date(Date.now() + minutes * 60 * 1000);
    // round quick selections up to the next 15-minute interval
    const rounded = roundUpToNearest(dt, 15);
    setScheduledAt(rounded);
    setScheduleType('scheduled');
  };

  // Round up to the nearest interval (minutes)
  const roundUpToNearest = (date, interval) => {
    const ms = 1000 * 60 * interval;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  };

  // scheduling is available via quick increments only (+15m, +30m, +60m, +120m)

  // Android handlers: native date then time dialogs
  // removed Android native pickers and their callbacks — scheduling via quick chips only

  const drivers =
    (tripStatus && Array.isArray(tripStatus.data?.drivers) && tripStatus.data.drivers) || [];

  if (loadingLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Getting location…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onLongPress={handleMapLongPress}>
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#2563eb"
              strokeWidth={4}
            />
          )}
          {pickup && <Marker coordinate={pickup} title="Pickup" />}
          {dropoff && <Marker coordinate={dropoff} title="Dropoff" pinColor="green" />}
          {drivers.map((d, index) => {
            if (!d.location) return null;
            return (
              <Marker
                key={d.id || index}
                coordinate={{
                  latitude: d.location.latitude,
                  longitude: d.location.longitude,
                }}
                title="Driver"
                pinColor="blue"
              />
            );
          })}
        </MapView>
      )}

      <TopBar user={user} onPressNotifications={() => navigation.navigate('Notifications')} />

      {/* Floating Search Card */}
      <View style={styles.searchContainer}>
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <View style={styles.dot} />
            <TextInput
              style={styles.searchInput}
              placeholder="Current location"
              value={pickupQuery}
              editable={editingPickup}
              onChangeText={editingPickup ? fetchPickupSuggestions : undefined}
              onFocus={() => setEditingPickup(true)}
            />
            <TouchableOpacity onPress={() => setEditingPickup(!editingPickup)}>
              <Text style={styles.changeText}>{editingPickup ? 'Done' : 'Change'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.searchRow}>
            <View style={[styles.dot, { backgroundColor: '#d32f2f' }]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where to?"
              value={dropoffQuery}
              onChangeText={fetchSuggestions}
            />
          </View>
        </View>

        {/* Quick Places */}
        <View style={styles.quickContainer}>
          {homeLocation && (
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => {
                setDropoff({
                  latitude: homeLocation.latitude,
                  longitude: homeLocation.longitude,
                });
                setDropoffQuery(homeLocation.label || 'Home');
                setDropoffSuggestions([]);
              }}>
              <Text style={styles.quickLabel}>🏠 Home</Text>
            </TouchableOpacity>
          )}
          {workLocation && (
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => {
                setDropoff({
                  latitude: workLocation.latitude,
                  longitude: workLocation.longitude,
                });
                setDropoffQuery(workLocation.label || 'Work');
                setDropoffSuggestions([]);
              }}>
              <Text style={styles.quickLabel}>💼 Work</Text>
            </TouchableOpacity>
          )}
          {recentLocations.slice(0, 2).map((loc) => (
            <TouchableOpacity
              key={`${loc.latitude}-${loc.longitude}-${loc.ts}`}
              style={styles.quickChip}
              onPress={() => {
                setDropoff({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                });
                setDropoffQuery(loc.label || 'Recent');
                setDropoffSuggestions([]);
              }}>
              <Text style={styles.quickLabel} numberOfLines={1}>
                🕒 {loc.label || 'Recent'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Suggestions */}
        {(pickupSuggestions.length > 0 || dropoffSuggestions.length > 0) && (
          <View style={styles.suggestionsContainer}>
            {editingPickup && pickupSuggestions.length > 0 && (
              <FlatList
                data={pickupSuggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => {
                      setPickup(item.coords);
                      setPickupQuery(item.label);
                      setPickupSuggestions([]);
                      setEditingPickup(false);
                    }}>
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            {!editingPickup && dropoffSuggestions.length > 0 && (
              <FlatList
                data={dropoffSuggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => onSelectDropoff(item)}>
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
      </View>

      {/* Bottom Sheet for Estimate and Request */}
      {dropoff && (
        <>
        <BottomSheet collapsedHeight={250} expandedHeight={screenHeight * 0.5}>
          <View style={styles.rideCard}>
            {estimateLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Fetching estimate...</Text>
              </View>
            ) : estimateError ? (
              <View style={styles.center}>
                <Text style={styles.errorText}>{estimateError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchEstimate}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : estimate ? (
              <>
                <Text style={styles.rideTitle}>Yalla Ride</Text>
                {discountPercent > 0 ? (
                  <>
                    <Text style={[styles.ridePrice, styles.strike]}>{estimate.total ? `${estimate.total.toFixed(2)} EGP` : 'N/A'}</Text>
                    <Text style={[styles.ridePrice, styles.discounted]}>{((estimate.total || 0) * (1 - discountPercent / 100)).toFixed(2)} EGP</Text>
                  </>
                ) : (
                  <Text style={styles.ridePrice}>{estimate.total ? `${estimate.total.toFixed(2)} EGP` : 'N/A'}</Text>
                )}
                <Text style={styles.rideDetails}>
                  {estimate.distanceKm?.toFixed(1)} km • {estimate.etaMinutes} min
                </Text>
                <View style={styles.fareBreakdown}>
                  <Text style={styles.breakdownText}>Base fare: {estimate.baseFare ? `${estimate.baseFare.toFixed(2)} EGP` : 'N/A'}</Text>
                    <Text style={styles.breakdownText}>
                      Distance: {(estimate.distanceKm * estimate.perKm).toFixed(2)} EGP ({estimate.perKm?.toFixed(2)}/km)
                    </Text>
                  {discountPercent > 0 ? (
                    <Text style={styles.breakdownText}>
                      Total: <Text style={styles.strike}>{estimate.total ? `${estimate.total.toFixed(2)} EGP` : 'N/A'}</Text> <Text style={styles.discounted}>{((estimate.total || 0) * (1 - discountPercent / 100)).toFixed(2)} EGP</Text>
                    </Text>
                  ) : (
                    <Text style={styles.breakdownText}>Total: {estimate.total ? `${estimate.total.toFixed(2)} EGP` : 'N/A'}</Text>
                  )}
                </View>
                {/* Scheduling controls */}
                <View style={styles.scheduleContainer}>
                  <View style={styles.scheduleToggleRow}>
                    <TouchableOpacity style={[styles.scheduleTab, scheduleType === 'now' && styles.scheduleTabActive]} onPress={() => { setScheduleType('now'); setScheduledAt(null); }}>
                      <Text style={[styles.scheduleTabText, scheduleType === 'now' && styles.scheduleTabTextActive]}>Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.scheduleTab, scheduleType === 'scheduled' && styles.scheduleTabActive]} onPress={() => setScheduleType('scheduled')}>
                      <Text style={[styles.scheduleTabText, scheduleType === 'scheduled' && styles.scheduleTabTextActive]}>Schedule</Text>
                    </TouchableOpacity>
                  </View>

                  {scheduleType === 'scheduled' && (
                    <View style={styles.scheduleOptionsRow}>
                      <TouchableOpacity style={styles.scheduleChip} onPress={() => pickQuickSchedule(15)}>
                        <Text style={styles.scheduleChipText}>+15m</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.scheduleChip} onPress={() => pickQuickSchedule(30)}>
                        <Text style={styles.scheduleChipText}>+30m</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.scheduleChip} onPress={() => pickQuickSchedule(60)}>
                        <Text style={styles.scheduleChipText}>+60m</Text>
                      </TouchableOpacity>
                      {/* Custom scheduling removed — only quick increments are supported now */}
                      <TouchableOpacity style={styles.scheduleChip} onPress={() => pickQuickSchedule(120)}>
                              <Text style={styles.scheduleChipText}>+120m</Text>
                            </TouchableOpacity>
                    </View>
                  )}

                  {scheduleType === 'scheduled' && scheduledAt && (
                    <Text style={styles.scheduleSelectedText}>Scheduled for {scheduledAt.toLocaleString()}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.requestButton, requesting && styles.requestButtonDisabled]}
                  onPress={handleRequestRide}
                  disabled={requesting}>
                  <Text style={styles.requestButtonText}>
                      {requesting ? 'Requesting...' : (scheduleType === 'scheduled' ? 'Schedule Trip' : 'Confirm & Find Driver')}
                    </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.center}>
                <Text style={styles.loadingText}>Setting up estimate...</Text>
              </View>
            )}
          </View>
        </BottomSheet>

        {/* Custom modal handled above when showCustomModal is true */}
        {/* custom modal removed */}
        {/* Android: show native date/time pickers as dialogs when requested */}
        {/* Android native pickers removed */}
        </>
      )}

      {/* Announcements or Welcome when no dropoff */}
      {!dropoff && (
        <BottomSheet collapsedHeight={200} expandedHeight={screenHeight * 0.4}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Yalla Ride!</Text>
            <Text style={styles.welcomeSubtitle}>
              Enter your destination above to get an instant fare estimate and find nearby drivers.
            </Text>
            {announcements.length > 0 && (
              <View style={styles.announcementsSection}>
                <Text style={styles.sectionTitle}>Latest Updates</Text>
                <AnnouncementCarousel
                  items={announcements}
                  onPressItem={async (item) => {
                    try {
                      if (item._id) {
                        await announcementApi.markRead(item._id);
                      }
                    } catch {
                      // ignore
                    }
                  }}
                />
              </View>
            )}
          </View>
        </BottomSheet>
      )}
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
  searchContainer: {
    position: 'absolute',
    top: 100, // below TopBar
    left: 16,
    right: 16,
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#4caf50',
    marginRight: 12,
  },

  /* Scheduling styles moved out of dot - placed here */
  scheduleContainer: {
    marginTop: 12,
    paddingVertical: 8,
  },
  scheduleToggleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scheduleTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  scheduleTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  scheduleTabText: {
    color: '#1f2937',
  },
  scheduleTabTextActive: {
    color: '#fff',
  },
  scheduleOptionsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  scheduleChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  scheduleChipText: {
    color: '#111827',
  },
  scheduleSelectedText: {
    marginTop: 8,
    color: '#374151',
    fontSize: 13,
  },
  // custom modal / fallback styles removed — scheduling uses quick-fixes only
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  quickContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickLabel: {
    fontSize: 14,
    color: '#333',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rideCard: {
    padding: 16,
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  ridePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  strike: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    fontSize: 18,
    marginRight: 8,
  },
  discounted: {
    color: '#059669',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  rideDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  fareBreakdown: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  breakdownText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  requestButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    backgroundColor: '#ccc',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeContainer: {
    padding: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  announcementsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
