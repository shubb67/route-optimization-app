import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db, storage } from '../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
import { deleteObject, ref as storageRef } from 'firebase/storage';

const UploadRouteScreen = () => {
  const [uploading, setUploading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  const fetchRoutes = async () => {
    const snap = await getDocs(collection(db, 'routesFile')); // ✅ CHANGED to routesFile
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRoutes(docs);
    setFilteredRoutes(docs);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    const filtered = routes.filter(r =>
      r.filename?.toLowerCase().includes(lower)
    );
    setFilteredRoutes(filtered);
  }, [searchQuery, routes]);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (!result.assets || result.canceled) return;

      const file = result.assets[0];
      const blob = await fetch(file.uri).then(r => r.blob());

      const uid = auth.currentUser?.uid || 'anonymous';
      const storageRefInstance = ref(storage, `routes/${uid}/${file.name}`);
      setUploading(true);
      await uploadBytes(storageRefInstance, blob);
      const url = await getDownloadURL(storageRefInstance);

      await addDoc(collection(db, 'routesFile'), {
        uid,
        filename: file.name,
        url,
        size: file.size || 0,
        uploadedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Route uploaded!');
      fetchRoutes();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to upload route.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (route: any) => {
    Alert.alert(
      'Delete PDF',
      `Are you sure you want to delete "${route.filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const fileRef = storageRef(storage, `routesFile/${route.uid}/${route.filename}`);
              await deleteObject(fileRef);
              await deleteDoc(doc(db, 'routesFile', route.id));
              Alert.alert('Deleted', 'Route successfully removed.');
              fetchRoutes();
            } catch (error) {
              console.error('Error deleting:', error);
              Alert.alert('Error', 'Could not delete the route.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    return kb > 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() =>
          navigation.navigate('PDFViewer', {
            url: item.url,
            filename: item.filename,
          })
        }
      >
        <View style={styles.cardInner}>
          <Ionicons name="document-text-outline" size={28} color="#444" />
          <View style={styles.cardText}>
            <Text style={styles.filename}>{item.filename}</Text>
            <Text style={styles.meta}>
              {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleDelete(item)}>
        <Ionicons name="trash-outline" size={22} color="#ff4d4d" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Route PDFs</Text>
      <Text style={styles.subtitle}>Upload and manage route instructions</Text>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUpload}
        disabled={uploading}
      >
        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        <Text style={styles.uploadText}>Upload New PDF</Text>
      </TouchableOpacity>

      {uploading && <ActivityIndicator style={{ marginVertical: 12 }} />}

      {routes.length === 0 ? (
        <Text style={styles.empty}>No PDFs uploaded yet.</Text>
      ) : (
        <TextInput
          style={styles.searchBar}
          placeholder="Search PDFs..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      <FlatList
        data={filteredRoutes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default UploadRouteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#151717',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151717',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  uploadText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  searchBar: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    color: '#333',
    marginTop: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardText: {
    marginLeft: 12,
    flex: 1,
  },
  filename: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  empty: {
    marginTop: 40,
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
  },
});
