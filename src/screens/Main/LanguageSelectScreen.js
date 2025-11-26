import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useI18n } from '../../i18n';

const LanguageSelectScreen = () => {
  const navigation = useNavigation();
  const { t, language, setLanguage } = useI18n();

  const handleSelect = async (lang) => {
    await setLanguage(lang);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.language')}</Text>
      <View style={styles.buttons}>
        <Button
          title={t('language.english')}
          onPress={() => handleSelect('en')}
          disabled={language === 'en'}
        />
        <Button
          title={t('language.arabic')}
          onPress={() => handleSelect('ar')}
          disabled={language === 'ar'}
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
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
  },
});

export default LanguageSelectScreen;

