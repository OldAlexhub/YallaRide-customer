import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ user, onPressNotifications }) => {
  const navigation = useNavigation();
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'Y';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.left}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Profile')}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name || 'Guest'}
            </Text>
            {user?.isFounder && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Founder</Text>
              </View>
            )}
          </View>
          <Text style={styles.status}>You&apos;re online</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.right}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressNotifications}
          activeOpacity={0.8}>
          <Image
            source={require('../../../assets/appstore.png')}
            style={styles.iconImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#f9fafb',
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#f9fafb',
    fontWeight: '600',
    marginRight: 6,
    maxWidth: 130,
  },
  badge: {
    backgroundColor: '#f59e0b',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '700',
  },
  status: {
    color: '#9ca3af',
    fontSize: 12,
  },
  right: {
    marginLeft: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
});

export default TopBar;

