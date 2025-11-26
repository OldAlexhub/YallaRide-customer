import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Vibration } from 'react-native';

const DriverNearbyScreen = () => {
  useEffect(() => {
    Vibration.vibrate(500);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver nearby / السائق قريب</Text>
      <Text style={styles.text}>Please be ready at the pickup point.</Text>
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
  },
});

export default DriverNearbyScreen;

