import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import announcementApi from '../../api/announcementApi';
import { useI18n } from '../../i18n';

const NotificationsScreen = () => {
  const { t } = useI18n();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await announcementApi.list();
        if (Array.isArray(data?.items)) {
          setItems(data.items);
        } else if (Array.isArray(data)) {
          setItems(data);
        }
      } catch (e) {
        console.warn('Notifications load failed', e?.response?.data || e.message);
      }
    };
    load();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.title || item.heading || t('common.support')}</Text>
      {item.body && <Text style={styles.body}>{item.body}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>{t('common.support')}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id || item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  title: {
    color: '#f9fafb',
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    color: '#e5e7eb',
    fontSize: 13,
  },
});

export default NotificationsScreen;

