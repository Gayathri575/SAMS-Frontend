import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';

import MarkAttendanceScreen from '../screens/student/MarkAttendanceScreen';
import MyAttendanceScreen from '../screens/student/MyAttendanceScreen';
import RequestCorrectionScreen from '../screens/student/RequestCorrectionScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen name="Mark" component={MarkAttendanceScreen} options={{ title: 'Mark Attendance' }} />
      <Tab.Screen name="History" component={MyAttendanceScreen} options={{ title: 'My Attendance' }} />
      <Tab.Screen name="Correction" component={RequestCorrectionScreen} options={{ title: 'Request Correction' }} />
    </Tab.Navigator>
  );
}