import { useRoute } from '@react-navigation/native';
import React from 'react';
import { I18nManager, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../i18n';

const BannedScreen = () => {
  const { t } = useI18n();
  const route = useRoute();
  const message = (route.params && route.params.message) || t('bans.bannedMessageDefault');
  const blockedUntil = route.params && route.params.blockedUntil;
  let displayMessage = message;
  if (blockedUntil) {
    const d = new Date(blockedUntil);
    displayMessage = `${t('bans.bannedTemporarily')} ${d.toLocaleString()}`;
  }

  const textAlign = I18nManager.isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⛔</Text>
      <Text style={[styles.title, { textAlign }]}>{t('bans.bannedTitle')}</Text>
      <Text style={[styles.message, { textAlign }]}>{displayMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff5f5',
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
  },
});

export default BannedScreen;

