import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

// navItems: [{ label, onPress }] — pass whatever links make sense for the current role/screen
export default function ScreenWrapper({ children, navItems = [], scrollable = true }) {
  const Content = scrollable ? ScrollView : View;

  return (
    <View style={styles.container}>
      <AppHeader navItems={navItems} />
      <Content style={styles.content} contentContainerStyle={scrollable ? styles.scrollContent : undefined}>
        {children}
      </Content>
      <AppFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});