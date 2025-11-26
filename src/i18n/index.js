import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import ar from './ar.json';

const STORAGE_KEY = 'yalla_language';

const resources = { en, ar };

const I18nContext = createContext(null);

const getNested = (obj, path) =>
  path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && resources[saved]) {
          setLanguageState(saved);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setLanguage = async (lang) => {
    if (!resources[lang]) return;
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);

    const isRTL = lang === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // NOTE: full app reload may be required to apply RTL layout.
    }
  };

  const t = (key) => {
    const bundle = resources[language] || resources.en;
    const value = getNested(bundle, key);
    if (value !== undefined) return value;
    const fallback = getNested(resources.en, key);
    return fallback !== undefined ? fallback : key;
  };

  const value = useMemo(
    () => ({
      t,
      language,
      setLanguage,
      loading,
      isRTL: language === 'ar',
    }),
    [language, loading]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};

