import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import customerApi from '../../api/customerApi';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = () => {
  const { user, loadProfile } = useAuth();
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await customerApi.getProfile();
      const customer = response.customer || {};
      // fetch loyalty/discount details so we can show discount in profile directly
      try {
        const loyalty = await customerApi.getLoyaltyStatus();
        customer.loyalty = loyalty.loyalty || customer.loyalty;
        customer.discountPercent = loyalty.discountPercent;
        customer.founder = loyalty.founder ?? customer.founder;
        customer.totalSaved = loyalty.totalSaved ?? 0;
      } catch (e) {
        // ignore loyalty fetch errors, profile still shows
      }
      setProfile(customer);
      setName(response.customer.name);
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
      console.error('Load profile error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUserProfile();
  };

  const handleSave = async () => {
    // For now, just update local state. In future, add update API.
    setProfile({ ...profile, name });
    setEditing(false);
    Alert.alert('Success', 'Profile updated');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.phone}>{profile?.phone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.value}>{profile?.name}</Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{profile?.phone}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Member Since</Text>
          <Text style={styles.value}>
            {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {profile?.founder && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Founder Status</Text>
          <Text style={styles.founderText}>🎉 You're a Yalla Founder!</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('FounderBenefits')}
          >
            <Text style={styles.buttonText}>View Benefits</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loyalty</Text>
        <Text style={styles.loyaltyText}>
          Tier: {profile?.loyalty?.tier || 'Bronze'} | Points: {profile?.loyalty?.points || 0}
        </Text>
        {typeof profile?.discountPercent === 'number' && (
          <Text style={styles.loyaltyText}>Discount: {profile.discountPercent}% off rides</Text>
        )}
        {typeof profile?.totalSaved === 'number' && profile.totalSaved > 0 && (
          <Text style={[styles.loyaltyText, { color: '#059669', marginTop: 8 }]}>You've saved {profile.totalSaved.toFixed(2)} EGP thanks to discounts</Text>
        )}
      </View>

      <View style={styles.actions}>
        {editing ? (
          <View style={styles.editActions}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  founderText: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: 12,
  },
  loyaltyText: {
    fontSize: 16,
    color: '#1f2937',
  },
  actions: {
    padding: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
  },
});

export default ProfileScreen;

