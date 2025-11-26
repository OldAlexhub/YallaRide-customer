import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../../i18n';
import BottomSheet from '../../components/sheets/BottomSheet';

const ServiceUnavailableScreen = () => {
  const navigation = useNavigation();
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <BottomSheet>
        <Text style={styles.icon}>⏳</Text>
        <Text style={styles.title}>{t('errors.serviceUnavailableTitle')}</Text>
        <Text style={styles.message}>{t('errors.serviceUnavailableMessage')}</Text>
        <View style={styles.buttons}>
          <Button title={t('common.retry')} onPress={() => navigation.goBack()} />
          <Button title={t('common.home')} onPress={() => navigation.navigate('Home')} />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
});

export default ServiceUnavailableScreen;

