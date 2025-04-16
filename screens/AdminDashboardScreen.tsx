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
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseconfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { differenceInDays, formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<any>();

  const fetchDrivers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'Driver'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      Alert.alert('Logout Failed', err.message);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = drivers
      .filter(driver =>
        driver.name?.toLowerCase().includes(lower) ||
        driver.email?.toLowerCase().includes(lower)
      )
      .filter(driver =>
        filter === 'disabled' ? driver.disabled :
        filter === 'active' ? !driver.disabled :
        true
      );
    setFilteredDrivers(filtered);
  }, [search, drivers, filter]);

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this driver?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await deleteDoc(doc(db, 'users', id));
          fetchDrivers();
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

  const renderRightActions = (id: string, item: any) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.editBtn]}
        onPress={() => navigation.navigate('EditDriver', { driver: item })}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.actionLabel}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.disableBtn]}
        onPress={() => handleDisable(id)}
      >
        <Ionicons name="remove-circle-outline" size={20} color="#fff" />
        <Text style={styles.actionLabel}>Disable</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.deleteBtn]}
        onPress={() => handleDelete(id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.actionLabel}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: any) => {
    const isNew = differenceInDays(new Date(), new Date(item.createdAt)) <= 7;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id, item)}>
        <View style={[styles.driverCard, item.disabled && styles.disabledCard]}>
          <View style={styles.row}>
            <Ionicons name="person-circle-outline" size={28} color="#007AFF" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <View style={styles.headerRow}>
                <Text style={styles.name}>{item.name}</Text>
                {isNew && !item.disabled && <Text style={styles.newBadge}>🆕</Text>}
              </View>

              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.meta}>
                Joined {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </Text>
              {item.disabled && <Text style={styles.inactiveBadge}>🚫 Inactive</Text>}
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  const toggleMenu = () => setMenuVisible(prev => !prev);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Driver Directory 🚚</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['all', 'active', 'disabled'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type as any)}
            style={[styles.tabButton, filter === type && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, filter === type && styles.activeTabText]}>
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#151717' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 6,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  search: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: '#ffecec',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  newBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  inactiveBadge: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#b22222',
    backgroundColor: '#f8d7da',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
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
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  miniMenu: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 4,
  },
  miniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  miniText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
