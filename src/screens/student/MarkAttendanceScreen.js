
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import apiClient from '../../api/client';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function MarkAttendanceScreen() {
  const navigation = useNavigation();

  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleMark = async () => {
    setSubmitting(true);
    setResult(null);

    try {
      const response = await apiClient.post('/attendance/mark', {
        reason: reason.trim() || null,
      });

      setResult({
        type: 'success',
        status: response.data.status,
      });
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong';

      setResult({
        type: 'error',
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper
      navItems={[
        {
          label: 'Mark',
          onPress: () => navigation.navigate('Mark'),
        },
        {
          label: 'History',
          onPress: () => navigation.navigate('History'),
        },
        {
          label: 'Correction',
          onPress: () => navigation.navigate('Correction'),
        },
      ]}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Mark Today's Attendance</Text>

        <Text style={styles.hint}>
          Reason is only needed if you're marking after 9:30 AM.
          Attendance locks at 12:30 PM.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Reason (only if late)"
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleMark}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Mark Attendance</Text>
          )}
        </TouchableOpacity>

        {result?.type === 'success' && (
          <View style={[styles.resultBox, styles.successBox]}>
            <Text style={styles.successText}>
              Marked as {result.status} ✓
            </Text>
          </View>
        )}

        {result?.type === 'error' && (
          <View style={[styles.resultBox, styles.errorBox]}>
            <Text style={styles.errorText}>{result.message}</Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  resultBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
  },

  successBox: {
    backgroundColor: '#dcfce7',
  },

  errorBox: {
    backgroundColor: '#fee2e2',
  },

  successText: {
    color: '#166534',
    fontWeight: '600',
  },

  errorText: {
    color: '#991b1b',
    fontWeight: '600',
  },
});

