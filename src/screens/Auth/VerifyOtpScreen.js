import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const VerifyOtpScreen = () => {
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { verifyOtp } = useAuth();
  const router = useRouter();

  const onSubmit = async () => {
    if (!otp) return;
    setSubmitting(true);
    try {
      await verifyOtp(otp);
      router.replace('/(tabs)');
    } catch (e) {
      console.warn('OTP verification failed', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="One-time password"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title={submitting ? 'Verifying...' : 'Verify'} onPress={onSubmit} disabled={submitting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});

export default VerifyOtpScreen;

