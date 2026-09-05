import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter both username and password');
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (error) {
      let message = error.response?.data?.message;
      if (!message) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          message = 'Connection timed out. Make sure your phone and laptop are connected to the same Wi-Fi / Hotspot.';
        } else if (error.message?.includes('Network Error')) {
          message = 'Cannot reach backend server. Please verify your phone is on the same Wi-Fi network as your laptop.';
        } else {
          message = error.message || 'Login failed. Please try again.';
        }
      }
      Alert.alert('Login Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SAMS Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Roll Number / Employee ID"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 14, marginBottom: 16, fontSize: 16,
  },
  button: {
    backgroundColor: '#2563eb', borderRadius: 8, padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});