import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';

const STATUS_OPTIONS = ['PRESENT', 'LATE', 'ABSENT'];

export default function RequestCorrectionScreen() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [requestedStatus, setRequestedStatus] = useState('PRESENT');
  const [studentReason, setStudentReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = async () => {
    try {
      const response = await apiClient.get('/attendance/me');
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to load records', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const openModal = (record) => {
    setSelected(record);
    setRequestedStatus('PRESENT');
    setStudentReason('');
  };

  const submitCorrection = async () => {
    if (!studentReason.trim()) {
      Alert.alert('Reason required', 'Please explain why this record should be corrected');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/attendance/correction', {
        attendanceId: selected.id,
        requestedStatus,
        studentReason: studentReason.trim(),
      });
      Alert.alert('Submitted', 'Your correction request has been sent to your class teacher');
      setSelected(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit request';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>No attendance records yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openModal(item)}>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.currentStatus}>{item.status}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Correction</Text>
            <Text style={styles.modalSubtitle}>{selected?.date} — currently {selected?.status}</Text>

            <Text style={styles.label}>Correct status should be:</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusChip, requestedStatus === status && styles.statusChipActive]}
                  onPress={() => setRequestedStatus(status)}
                >
                  <Text style={[styles.statusChipText, requestedStatus === status && styles.statusChipTextActive]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Explain why (e.g. medical emergency, doctor's note attached)"
              value={studentReason}
              onChangeText={setStudentReason}
              multiline
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSelected(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submitCorrection} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  dateText: { fontSize: 15, fontWeight: '500' },
  currentStatus: { fontSize: 13, color: '#666' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  statusRow: { flexDirection: 'row', marginBottom: 16 },
  statusChip: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 14, marginRight: 8,
  },
  statusChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  statusChipText: { fontSize: 13, color: '#333' },
  statusChipTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 14, marginBottom: 16, fontSize: 15, minHeight: 70, textAlignVertical: 'top',
  },
  modalButtonRow: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#f3f4f6' },
  cancelButtonText: { fontWeight: '600', color: '#333' },
  submitButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#2563eb' },
  submitButtonText: { fontWeight: '600', color: '#fff' },
});