import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { t, setLanguage } = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      t('settings.logoutConfirm'),
      t('settings.logoutMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('settings.logout'), onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleLanguageChange = () => {
    navigation.navigate('LanguageSelect');
  };

  const handleLocationToggle = (value) => {
    setLocationEnabled(value);
    // TODO: Update user preferences via API
    Alert.alert('Feature Coming Soon', 'Location preferences will be saved to your account.');
  };

  const handleNotificationToggle = (value) => {
    setNotificationsEnabled(value);
    // TODO: Update user preferences via API
    Alert.alert('Feature Coming Soon', 'Notification preferences will be saved to your account.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.optionText}>Edit Profile</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.optionText}>Ride History</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locations</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('EditSavedLocation', { kind: 'home' })}
        >
          <Text style={styles.optionText}>Set Home Location</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('EditSavedLocation', { kind: 'work' })}
        >
          <Text style={styles.optionText}>Set Work Location</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.toggleOption}>
          <Text style={styles.optionText}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#d1d5db', true: '#2563eb' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        <View style={styles.toggleOption}>
          <Text style={styles.optionText}>Location Services</Text>
          <Switch
            value={locationEnabled}
            onValueChange={handleLocationToggle}
            trackColor={{ false: '#d1d5db', true: '#2563eb' }}
            thumbColor={locationEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        <TouchableOpacity style={styles.option} onPress={handleLanguageChange}>
          <Text style={styles.optionText}>{t('settings.language')}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Help & Support</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Terms of Service</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.version}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 24,
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
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  arrow: {
    fontSize: 18,
    color: '#6b7280',
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  version: {
    paddingTop: 12,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutSection: {
    margin: 16,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
