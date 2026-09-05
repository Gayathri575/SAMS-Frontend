import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';

const STATUS_COLORS = { PRESENT: '#166534', LATE: '#92400e', ABSENT: '#991b1b' };
const STATUS_BG = { PRESENT: '#dcfce7', LATE: '#fef3c7', ABSENT: '#fee2e2' };

export default function MyAttendanceScreen() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        apiClient.get('/attendance/me'),
        apiClient.get('/attendance/me/percentage'),
      ]);
      setRecords(recordsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load attendance', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.percentage}>{summary.attendancePercentage}%</Text>
          <Text style={styles.summarySubtitle}>Overall Attendance</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>Present: {summary.presentDays}</Text>
            <Text style={styles.statText}>Late: {summary.lateDays}</Text>
            <Text style={styles.statText}>Absent: {summary.absentDays}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No attendance records yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.dateText}>{item.date}</Text>
              {item.reason && <Text style={styles.reasonText}>{item.reason}</Text>}
            </View>
            <View style={[styles.badge, { backgroundColor: STATUS_BG[item.status] }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryCard: {
    backgroundColor: '#2563eb', margin: 16, borderRadius: 12, padding: 20, alignItems: 'center',
  },
  percentage: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  summarySubtitle: { color: '#dbeafe', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statText: { color: '#fff', fontSize: 13 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  dateText: { fontSize: 15, fontWeight: '500' },
  reasonText: { fontSize: 12, color: '#888', marginTop: 2, maxWidth: 220 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});