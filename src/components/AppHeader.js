import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';

// navItems: [{ label, onPress }]
export default function AppHeader({ navItems = [] }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?';

  return (
    <View style={styles.header}>
      <Text style={styles.brand}>SAMS</Text>

      <View style={styles.navRow}>
        {navItems.map((item) => (
          <TouchableOpacity key={item.label} onPress={item.onPress} style={styles.navItem}>
            <Text style={styles.navItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.avatar} onPress={() => setMenuOpen(true)}>
        <Text style={styles.avatarText}>{initials}</Text>
      </TouchableOpacity>

      <Modal visible={menuOpen} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownName}>{user?.username}</Text>
            <Text style={styles.dropdownRole}>{user?.role}</Text>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#2563eb',
    ...(typeof window !== 'undefined' ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
  },
  brand: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  navRow: { flexDirection: 'row', flex: 1, justifyContent: 'center' },
  navItem: { marginHorizontal: 10 },
  navItemText: { color: '#dbeafe', fontSize: 14, fontWeight: '500' },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e40af',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  dropdown: {
    position: 'absolute', top: 60, right: 16, backgroundColor: '#fff',
    borderRadius: 10, padding: 16, minWidth: 180,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  dropdownName: { fontWeight: '700', fontSize: 15 },
  dropdownRole: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  dropdownItem: { paddingVertical: 6 },
  logoutText: { color: '#ef4444', fontWeight: '600' },
});