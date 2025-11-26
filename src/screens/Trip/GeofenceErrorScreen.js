import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GeofenceErrorScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Outside service area / خارج منطقة الخدمة</Text>
      <Text style={styles.text}>
        Rides are not available from your current location.
      </Text>
      <Button title="Back / رجوع" onPress={() => navigation.goBack()} />
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
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default GeofenceErrorScreen;

