import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

// At the top of your component
export default function RouteSummariesScreen() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation<any>();
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const q = query(collection(db, 'routes'));
        const snapshot = await getDocs(q);

        const routeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        routeList.sort((a, b) =>
          (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
        );

        setRoutes(routeList);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('RouteDetails', {
          routeName: item.route,
          routeId: item.id,
          deliveries: item.deliveries,
          numPackages: item.packageCount,
        })
      }
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Ionicons name="map-outline" size={22} color="#333" style={{ marginRight: 6 }} />
        <Text style={styles.routeName}>{item.routeName || item.id}</Text>
      </View>
  
      <Text style={styles.packageCount}>
        📦 {item.numPackages} package{item.packageCount !== 1 ? 's' : ''}
      </Text>
  
      {item.deliveries?.length > 0 && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>🚚 Preview Deliveries:</Text>
          {item.deliveries.slice(0, 3).map((delivery: any, index: number) => (
            <Text key={index} style={styles.address}>
              • {delivery.address}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Parsed Route Summaries</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
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
    backgroundColor: '#f9f9fb',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#151717',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  packageCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  preview: {
    marginTop: 6,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    marginBottom: 2,
  },
});
