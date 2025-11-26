import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ORS_API_KEY } from '@env';
import { saveHomeLocation, saveWorkLocation } from '../../storage/locationsStorage';

const EditSavedLocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { kind } = route.params || {};
  const title = kind === 'work' ? 'Set Work location' : 'Set Home location';

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query || !ORS_API_KEY) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
            query
          )}`
        );
        const json = await res.json();
        const features = json.features || [];
        setSuggestions(
          features.map((f) => ({
            id: f.properties.id || f.properties.place_id || String(f.properties.label),
            label: f.properties.label,
            coords: {
              latitude: f.geometry.coordinates[1],
              longitude: f.geometry.coordinates[0],
            },
          }))
        );
      } catch (e) {
        console.warn('ORS saved location search error', e);
      }
    };
    fetchSuggestions();
  }, [query]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const location = {
        label: selected.label,
        latitude: selected.coords.latitude,
        longitude: selected.coords.longitude,
      };
      if (kind === 'work') {
        await saveWorkLocation(location);
      } else {
        await saveHomeLocation(location);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Search address"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selected && selected.id === item.id && styles.itemSelected,
            ]}
            onPress={() => setSelected(item)}>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <Button
        title={saving ? 'Saving…' : 'Save'}
        onPress={handleSave}
        disabled={saving || !selected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  list: {
    flex: 1,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 8,
  },
  itemSelected: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  itemLabel: {
    fontSize: 14,
  },
});

export default EditSavedLocationScreen;

