import React from 'react';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './navigation';
import { ThemeProvider } from '../context/ThemeContext';

export default function App() {
  const [fontsLoaded] = Font.useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  });

    return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
