import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>Student Attendance Management System</Text>
      <Text style={styles.subtext}>© {new Date().getFullYear()} SAMS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 14, alignItems: 'center', backgroundColor: '#f3f4f6',
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
  },
  text: { fontSize: 12, color: '#666', fontWeight: '500' },
  subtext: { fontSize: 11, color: '#999', marginTop: 2 },
});