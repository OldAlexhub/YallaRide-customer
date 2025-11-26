import React from 'react';
import { I18nManager, Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useI18n } from '../../i18n';

const WarningScreen = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
  const route = useRoute();
  const message =
    (route.params && route.params.message) || t('bans.warningMessageDefault');

  const textAlign = I18nManager.isRTL ? 'right' : 'left';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, { textAlign }]}>{t('bans.warningTitle')}</Text>
      <Text style={[styles.message, { textAlign }]}>{message}</Text>
      <View style={styles.buttonRow}>
        <Button
          title={t('common.continue')}
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fffaf0',
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
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
});

export default WarningScreen;

