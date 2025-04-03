import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './navigation';
import { ThemeProvider } from '../context/ThemeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
