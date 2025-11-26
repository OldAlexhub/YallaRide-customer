import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AnnouncementCarousel = ({ items, onPressItem }) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        horizontal
        keyExtractor={(item) => item._id || item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onPressItem && onPressItem(item)}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title || item.heading || 'Update'}
            </Text>
            {item.body && (
              <Text style={styles.body} numberOfLines={2}>
                {item.body}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    minWidth: 220,
  },
  title: {
    color: '#f9fafb',
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    color: '#e5e7eb',
    fontSize: 12,
  },
});

export default AnnouncementCarousel;

