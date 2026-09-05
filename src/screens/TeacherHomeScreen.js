import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import ScreenWrapper from '../components/ScreenWrapper';

export default function TeacherHomeScreen() {
  const { user, logout } = useAuth();
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadCorrections = async () => {
    try {
      const response = await apiClient.get('/attendance/corrections');
      setCorrections(response.data || []);
    } catch (error) {
      // Endpoint might not return data or might be empty
      console.log('Note: Corrections endpoint query:', error.message);
      setCorrections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCorrections();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCorrections();
  };

  const handleAction = async (correctionId, status) => {
    setActionLoadingId(correctionId);
    try {
      await apiClient.post(`/attendance/correction/${correctionId}/${status.toLowerCase()}`, {
        status,
      });
      Alert.alert('Success', `Correction request has been ${status.toLowerCase()}d`);
      loadCorrections();
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${status.toLowerCase()} request`;
      Alert.alert('Action Failed', message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const navItems = [
    { label: 'Logout', onPress: logout },
  ];

  return (
    <ScreenWrapper navItems={navItems} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.welcomeText}>Welcome, {user?.username || 'Teacher'}</Text>
          <Text style={styles.roleSubtitle}>Role: {user?.role || 'TEACHER'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Pending Attendance Corrections</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            data={corrections}
            keyExtractor={(item) => (item.id || item.attendanceId || Math.random()).toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No pending corrections</Text>
                <Text style={styles.emptySubtitle}>All student attendance requests have been processed.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.studentName}>{item.studentName || item.rollNumber || 'Student'}</Text>
                  <Text style={styles.cardDate}>{item.date || 'Today'}</Text>
                </View>

                <Text style={styles.reasonText}>
                  <Text style={{ fontWeight: '600' }}>Reason: </Text>
                  {item.studentReason || item.reason || 'No reason provided'}
                </Text>

                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Requested Status: </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{item.requestedStatus || 'PRESENT'}</Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleAction(item.id, 'APPROVED')}
                    disabled={actionLoadingId === item.id}
                  >
                    {actionLoadingId === item.id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Approve</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleAction(item.id, 'REJECTED')}
                    disabled={actionLoadingId === item.id}
                  >
                    <Text style={[styles.btnText, { color: '#dc2626' }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  roleSubtitle: { color: '#dbeafe', fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#111827' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  cardDate: { fontSize: 13, color: '#6b7280' },
  reasonText: { fontSize: 14, color: '#4b5563', marginBottom: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  statusLabel: { fontSize: 13, color: '#6b7280' },
  statusBadge: { backgroundColor: '#dcfce7', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  statusBadgeText: { color: '#166534', fontWeight: '700', fontSize: 12 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: { backgroundColor: '#059669' },
  rejectBtn: { backgroundColor: '#fee2e2' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 40, padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#4b5563' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 6 },
});

