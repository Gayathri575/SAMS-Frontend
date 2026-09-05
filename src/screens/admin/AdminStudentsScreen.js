import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import apiClient from '../../api/client';

export default function AdminStudentsScreen() {
  const navigation = useNavigation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    try {
      const response = await apiClient.get('/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Failed to load students', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [])
  );

  const resetForm = () => {
    setRollNumber('');
    setName('');
    setSection('');
    setDepartment('');
    setYear('');
  };

  const handleAdd = async () => {
    if (!rollNumber.trim() || !name.trim() || !section.trim()) {
      Alert.alert('Missing info', 'Roll number, name, and section are required');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/students', {
        rollNumber: rollNumber.trim(),
        name: name.trim(),
        section: section.trim(),
        department: department.trim() || null,
        year: year.trim() || null,
      });
      resetForm();
      setShowForm(false);
      loadStudents();
    } catch (error) {
      let message = error.response?.data?.message || 'Failed to add student';
      if (error.response?.data?.fieldErrors) {
        const details = Object.entries(error.response.data.fieldErrors)
          .map(([f, msg]) => `${f}: ${msg}`)
          .join('\n');
        message = `${message}\n${details}`;
      }
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
          <Text style={styles.title}>Students</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.addButtonText}>
              {showForm ? 'Cancel' : '+ Add Student'}
            </Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Roll Number (e.g. 101)"
              value={rollNumber}
              onChangeText={setRollNumber}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Section (e.g. 10-A, A)"
              value={section}
              onChangeText={setSection}
            />
            <TextInput
              style={styles.input}
              placeholder="Department (optional, e.g. CS)"
              value={department}
              onChangeText={setDepartment}
            />
            <TextInput
              style={styles.input}
              placeholder="Year (optional, e.g. 2026)"
              value={year}
              onChangeText={setYear}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAdd}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Student</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 30 }} />
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) =>
              (item.id || item.rollNumber || Math.random()).toString()
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No students found</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowSub}>
                    Roll: {item.rollNumber}
                    {item.department ? ` · ${item.department}` : ''}
                    {item.year ? ` · ${item.year}` : ''}
                  </Text>
                </View>
                {item.section || item.classSection ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.section || item.classSection}
                    </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  form: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowName: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: { color: '#1d4ed8', fontWeight: '700', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 30 },
});
