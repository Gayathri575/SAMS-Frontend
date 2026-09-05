import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const username = await AsyncStorage.getItem('username');
      const role = await AsyncStorage.getItem('role');

      if (token && username && role) {
        setUser({ username, role });
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    const { token, username: returnedUsername, role } = response.data;

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('username', returnedUsername);
    await AsyncStorage.setItem('role', role);

    setUser({ username: returnedUsername, role });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'username', 'role']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}