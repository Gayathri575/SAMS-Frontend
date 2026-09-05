import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import apiClient from '../../api/client';

export default function AdminTeachersScreen() {
  const navigation = useNavigation();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [classSection, setClassSection] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTeachers = async () => {
    try {
      const response = await apiClient.get('/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to load teachers', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTeachers();
    }, [])
  );

  const resetForm = () => {
    setEmployeeId('');
    setName('');
    setDepartment('');
    setClassSection('');
  };

  const handleAdd = async () => {
    if (!employeeId.trim() || !name.trim()) {
      Alert.alert('Missing info', 'Employee ID and name are required');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/teachers', {
        employeeId: employeeId.trim(),
        name: name.trim(),
        department: department.trim() || null,
        classSection: classSection.trim() || null,
      });
      resetForm();
      setShowForm(false);
      loadTeachers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add teacher';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const navItems = [
    { label: 'Dashboard', onPress: () => navigation.navigate('Dashboard') },
    { label: 'Teachers', onPress: () => navigation.navigate('Teachers') },
    { label: 'Students', onPress: () => navigation.navigate('Students') },
  ];

  return (
    <ScreenWrapper navItems={navItems} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Teachers</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
            <Text style={styles.addButtonText}>{showForm ? 'Cancel' : '+ Add Teacher'}</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Employee ID" value={employeeId} onChangeText={setEmployeeId} />
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Department (optional)" value={department} onChangeText={setDepartment} />
            <TextInput
              style={styles.input}
              placeholder="Class Section, e.g. 10-A (only if class teacher)"
              value={classSection}
              onChangeText={setClassSection}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Create Teacher</Text>}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={teachers}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>No teachers yet</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowSub}>{item.employeeId} · {item.department || 'No department'}</Text>
                </View>
                {item.classSection ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.classSection}</Text>
                  </View>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  form: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14, backgroundColor: '#fff' },
  submitButton: { backgroundColor: '#059669', borderRadius: 8, padding: 12, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: '600' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  rowName: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: { backgroundColor: '#ede9fe', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { color: '#6d28d9', fontWeight: '700', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 30 },
});