import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'YALLA_SAVED_LOCATIONS';

const getInitialState = () => ({
  home: null,
  work: null,
  recent: [],
});

export const getSavedLocations = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    return {
      home: parsed.home || null,
      work: parsed.work || null,
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
    };
  } catch {
    return getInitialState();
  }
};

const persist = async (state) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors for now
  }
};

export const saveHomeLocation = async (location) => {
  const state = await getSavedLocations();
  state.home = location;
  await persist(state);
  return state;
};

export const saveWorkLocation = async (location) => {
  const state = await getSavedLocations();
  state.work = location;
  await persist(state);
  return state;
};

export const addRecentLocation = async (location) => {
  const state = await getSavedLocations();
  const existing = state.recent.filter(
    (item) =>
      item.latitude !== location.latitude || item.longitude !== location.longitude
  );
  const newEntry = {
    label: location.label || 'Recent',
    latitude: location.latitude,
    longitude: location.longitude,
    ts: Date.now(),
  };
  const updated = [newEntry, ...existing].slice(0, 5);
  state.recent = updated;
  await persist(state);
  return state;
};

