import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PDFViewerScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { url, filename } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false }); // Hide default header
  }, []);

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {filename || 'Route PDF'}
        </Text>
      </View>

      {/* PDF Viewer */}
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        showsVerticalScrollIndicator
      />
    </View>
  );
};

export default PDFViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  header: {
    height: 56,
    backgroundColor: '#151717',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});
