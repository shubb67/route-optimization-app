// src/screens/driver/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⚙️ App Settings</Text>
      <Text style={styles.note}>Coming soon... Customize notifications, themes, and more.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  note: { fontSize: 14, color: '#666' },
});
