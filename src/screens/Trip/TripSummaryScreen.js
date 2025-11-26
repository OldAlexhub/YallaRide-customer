import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TripSummaryScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip summary / ملخص الرحلة</Text>
      <Text style={styles.text}>Fare, distance, and duration will be shown here.</Text>
      <Button title="Back to Home / العودة إلى الرئيسية" onPress={() => navigation.navigate('Home')} />
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

export default TripSummaryScreen;

