import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseconfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function DriverRouteScreen() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, 'routes'),
      where('assignedDriver.uid', '==', auth.currentUser?.uid)
    ); const unsubscribe = onSnapshot(q, (snapshot) => {
      const result = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoutes(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
    style={styles.card}
    onPress={() =>
      navigation.navigate('OptimizedMapScreen', {
        routeId: item.id,
        routeName: item.route,
        deliveries: item.deliveries,
      })
    }
    >  <View style={styles.cardHeader}>
        <Ionicons name="map-outline" size={20} color="#007AFF" />
        <Text style={styles.routeText}>Route: {item.route || item.id}</Text>
      </View>
      <Text style={styles.meta}>📦 Packages: {item.packageCount}</Text>
      <Text style={styles.meta}>🚚 Stops: {item.deliveries?.length || 0}</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>

      {routes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Assigned Route</Text>
          <Text style={styles.emptyText}>You don’t have a route assigned yet.</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#151717',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#222',
  },
  meta: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
