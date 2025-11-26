import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const onSubmit = async () => {
    if (!phone || !password) return;
    setSubmitting(true);
    try {
      await login(phone, password);
    } catch (e) {
      console.warn('Login failed', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <View style={styles.container}>
          <View style={styles.logoRow}>
            <Image source={require('../../../assets/appstore.png')} style={styles.logo} />
            <Text style={styles.brand}>Yalla Ride</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to book your next ride</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="e.g. 0100 000 0000"
              placeholderTextColor="#6b7280"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? 'Signing in...' : 'Sign in'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.altRow} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.altText}>No account? </Text>
              <Text style={styles.altLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0b1120',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 10,
  },
  brand: {
    color: '#e5e7eb',
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  label: {
    color: '#cbd5e1',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  altText: {
    color: '#94a3b8',
  },
  altLink: {
    color: '#2563eb',
    fontWeight: '700',
  },
});

export default LoginScreen;
