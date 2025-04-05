import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { MaterialIcons } from '@expo/vector-icons'; // add this if not already installed

const AdminDashboard = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDrivers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'Driver'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = drivers.filter(driver =>
      driver.name?.toLowerCase().includes(lower) ||
      driver.email?.toLowerCase().includes(lower)
    );
    setFilteredDrivers(filtered);
  }, [search, drivers]);

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this driver?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await deleteDoc(doc(db, 'users', id));
          fetchDrivers(); // refresh list
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDisable = async (id: string) => {
    Alert.alert('Confirm Disable', 'Temporarily disable this driver?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disable',
        onPress: async () => {
          await updateDoc(doc(db, 'users', id), { disabled: true });
          fetchDrivers();
        },
      },
    ]);
  };

  const renderRightActions = (id: string) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => Alert.alert('Edit not implemented yet')}>
        <MaterialIcons name="edit" size={20} color="#fff" />
        <Text style={styles.actionLabel}>Edit</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={[styles.actionBtn, styles.disableBtn]} onPress={() => handleDisable(id)}>
        <MaterialIcons name="block" size={20} color="#fff" />
        <Text style={styles.actionLabel}>Disable</Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(id)}>
        <MaterialIcons name="delete" size={20} color="#fff" />
        <Text style={styles.actionLabel}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.driverCard}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        {item.createdAt && (
          <Text style={styles.date}>Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>
        )}
        {item.disabled && <Text style={styles.disabledText}>🚫 Account Disabled</Text>}
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Driver Directory 🚚</Text>

      <TextInput
        style={styles.search}
        placeholder="Search by name or email..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#00a6ff" />
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#151717' },
  search: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  driverCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  email: { fontSize: 14, color: '#555' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
  disabledText: { fontSize: 12, color: 'red', marginTop: 4 },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  actionBtn: {
    width: 60,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 6,
    paddingVertical: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  editBtn: { backgroundColor: '#007aff' },
  disableBtn: { backgroundColor: '#ff9500' },
  deleteBtn: { backgroundColor: '#ff3b30' },
  
});
