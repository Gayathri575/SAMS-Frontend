
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import StudentTabs from './src/navigation/StudentTabs';
import AdminTabs from './src/navigation/AdminTabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import TeacherHomeScreen from './src/screens/TeacherHomeScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      ) : user.role === 'STUDENT' ? (
        <Stack.Screen
          name="StudentHome"
          component={StudentTabs}
        />
      ) : user.role === 'TEACHER' ? (
        <Stack.Screen
          name="TeacherHome"
          component={TeacherHomeScreen}
        />
      ) : (
        <Stack.Screen
          name="AdminHome"
          component={AdminTabs}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

