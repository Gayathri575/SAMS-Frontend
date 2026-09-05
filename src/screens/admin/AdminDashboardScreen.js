import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import apiClient from '../../api/client';

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const navItems = [
    { label: 'Dashboard', onPress: () => navigation.navigate('Dashboard') },
    { label: 'Teachers', onPress: () => navigation.navigate('Teachers') },
    { label: 'Students', onPress: () => navigation.navigate('Students') },
  ];

  if (loading) {
    return (
      <ScreenWrapper navItems={navItems}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents, color: '#2563eb' },
    { label: 'Total Teachers', value: stats?.totalTeachers, color: '#059669' },
    { label: 'Class Teachers', value: stats?.totalClassTeachers, color: '#d97706' },
    { label: 'Sections', value: stats?.totalSections, color: '#7c3aed' },
  ];

  return (
    <ScreenWrapper
      navItems={navItems}
      scrollable={false}
    >
      <View
        style={styles.container}
        onScrollEndDrag={() => {}}
      >
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.label} style={[styles.card, { backgroundColor: card.color }]}>
              <Text style={styles.cardValue}>{card.value ?? '—'}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 12, padding: 20 },
  cardValue: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  cardLabel: { fontSize: 13, color: '#fff', marginTop: 6 },
});