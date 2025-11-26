import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import tripApi from '../../api/tripApi';
import { useAuth } from '../../context/AuthContext';

const RidesHistoryScreen = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadTrips = useCallback(async (pageNum = 1, append = false) => {
    try {
      setError(null);
      const response = await tripApi.getTripHistory(pageNum, 10);
      const newTrips = response.trips || [];
      setTrips(append ? [...trips, ...newTrips] : newTrips);
      setHasMore(newTrips.length === 10);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load trip history');
      console.error('Load trips error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trips]);

  useFocusEffect(
    useCallback(() => {
      loadTrips(1, false);
    }, [loadTrips])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips(1, false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadTrips(page + 1, true);
    }
  };

  const renderTrip = ({ item }) => (
    <TouchableOpacity style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripType}>Yalla Ride</Text>
        <Text style={styles.tripDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {/* Savings information when discount applied */}
      {(() => {
        const est = typeof item.fareEstimate === 'number' ? item.fareEstimate : null;
        const final = typeof item.fare === 'number' ? item.fare : null;
        const discountAmt = typeof item.discountAmount === 'number' ? item.discountAmount : (est !== null && final !== null ? round2(est - final) : 0);
        const saved = (est !== null && final !== null) ? round2(est - final) : (discountAmt || 0);
        if (saved && saved > 0) {
          return (
            <View style={{ marginTop: 6 }}>
              <Text style={{ color: '#059669', fontWeight: '600' }}>You saved {saved.toFixed(2)} EGP</Text>
            </View>
          );
        }
        return null;
      })()}
      <View style={styles.tripDetails}>
        <Text style={styles.tripLocations}>
          {item.pickup ? `${item.pickup.lat.toFixed(2)}, ${item.pickup.lng.toFixed(2)}` : 'N/A'} → {'\n'}
          {item.dropoff ? `${item.dropoff.lat.toFixed(2)}, ${item.dropoff.lng.toFixed(2)}` : 'N/A'}
        </Text>
        <Text style={styles.tripInfo}>
          {item.distanceKm?.toFixed(1)} km •{' '}
          {/**
           * Display logic (prefer stored final fare):
           * - If `fare` exists: show it; if discount metadata exists and differs from estimate, show estimate struck through + final
           * - Else if `discountPercent` or `discountAmount` exist and `fareEstimate` available: compute the discounted fare client-side and show both
           * - Else fall back to showing the fareEstimate
           */}
          {typeof item.fare === 'number' && item.fare !== null ? (
            item.discountPercent > 0 && item.fareEstimate !== undefined && item.fareEstimate !== null ? (
              <>
                <Text style={styles.originalPrice}>{item.fareEstimate.toFixed(2)} EGP</Text>
                <Text style={styles.finalPrice}>  {item.fare.toFixed(2)} EGP <Text style={styles.discountText}>({item.discountPercent}% off)</Text></Text>
              </>
            ) : (
              <Text>{item.fare.toFixed(2)} EGP</Text>
            )
          ) : ( // no stored fare
            (() => {
              const estimate = item.fareEstimate ?? null;
              const percent = typeof item.discountPercent === 'number' ? item.discountPercent : null;
              const amount = typeof item.discountAmount === 'number' ? item.discountAmount : null;

              if (estimate !== null && (percent > 0 || amount > 0)) {
                const discountFromPercent = percent > 0 ? round2(estimate * (percent / 100)) : 0;
                const discountApplied = amount > 0 ? amount : discountFromPercent;
                const discounted = round2(Math.max(0, estimate - discountApplied));
                return (
                  <>
                    <Text style={styles.originalPrice}>{estimate.toFixed(2)} EGP</Text>
                    <Text style={styles.finalPrice}>  {discounted.toFixed(2)} EGP {percent > 0 ? <Text style={styles.discountText}>({percent}% off)</Text> : null}</Text>
                  </>
                );
              }

              return `${estimate?.toFixed(2) ?? '0.00'} EGP`;
            })()
          )}
        </Text>
      </View>
      <View style={styles.tripStatus}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
        {item.driverId && (
          <Text style={styles.driverInfo}>
            Driver: {item.driverId.name || item.driverId.phone}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'driver_assigned': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading && trips.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Rides</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={trips}
        keyExtractor={(item) => item._id}
        renderItem={renderTrip}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No rides yet</Text>
            <Text style={styles.emptySubtext}>Your completed trips will appear here</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? <ActivityIndicator style={styles.footer} /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    textTransform: 'capitalize',
  },
  tripDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  tripDetails: {
    marginBottom: 8,
  },
  tripLocations: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  tripInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#9ca3af'
  },
  finalPrice: {
    fontWeight: '700',
    color: '#111827'
  },
  discountText: {
    fontSize: 12,
    color: '#10b981'
  },
  tripStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  driverInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  footer: {
    marginVertical: 16,
  },
});

export default RidesHistoryScreen;

// helper used in the inline compute above
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}