import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { db } from '../firebaseconfig';
import { collection, getDocs, updateDoc, doc, where, query } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const AssignRoutesScreen = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    const routeSnap = await getDocs(collection(db, 'extractedRoutes'));
    const unassigned = routeSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(route => !route.assignedTo);

    setRoutes(unassigned);
  };

  const fetchDrivers = async () => {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'driver')));
    const driverList = snap.docs.map(doc => doc.data().name);
    setDrivers(driverList);
  };

  const assignRoute = async (routeId: string, driverName: string) => {
    try {
      const routeRef = doc(db, 'extractedRoutes', routeId);
      await updateDoc(routeRef, { assignedTo: driverName });
      Alert.alert('✅ Assigned', `Route assigned to ${driverName}`);
      fetchRoutes(); // Refresh list
    } catch (err) {
      Alert.alert('Error', 'Failed to assign route');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchDrivers();
      await fetchRoutes();
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📦 Unassigned Routes</Text>
      {routes.length === 0 ? (
        <Text style={styles.empty}>All routes are assigned 🎉</Text>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.routeId}>Route: {item.routeId}</Text>
              <Text style={styles.meta}>Packages: {item.totalPackages}</Text>
              <Text style={styles.meta}>Preview: {item.content.slice(0, 80)}...</Text>

              <Picker
                selectedValue={item.assignedTo || ''}
                onValueChange={value => {
                  if (value) assignRoute(item.id, value);
                }}
              >
                <Picker.Item label="Assign to driver..." value="" />
                {drivers.map(driver => (
                  <Picker.Item key={driver} label={driver} value={driver} />
                ))}
              </Picker>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

export default AssignRoutesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  routeId: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  empty: {
    marginTop: 100,
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
});
