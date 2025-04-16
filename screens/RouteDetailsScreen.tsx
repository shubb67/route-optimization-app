import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';

export default function RouteDetailsScreen() {
  const route = useRoute<RouteProp<any>>();
  const { routeName, deliveries, numPackages, routeId } = route.params;

  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriversAndRoute = async () => {
      try {
        const driverSnap = await getDocs(collection(db, 'users'));
        const driverList = driverSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === 'Driver');
        setDrivers(driverList);

        const routeSnap = await getDoc(doc(db, 'routes', routeId));
        if (routeSnap.exists()) {
          const routeData = routeSnap.data();
          setAssignedDriver(routeData.assignedDriver || null);
          setSelectedDriver(routeData.assignedDriver?.uid || '');
        }
      } catch (err) {
        console.error('Error loading driver data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriversAndRoute();
  }, []);

  const handleAssign = () => {
    const selected = drivers.find((d) => d.id === selectedDriver);
    if (!selected) return;

    Alert.alert(
      'Confirm Assignment',
      `Assign ${selected.name} (${selected.email}) to this route?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            await updateDoc(doc(db, 'routes', routeId), {
              assignedDriver: {
                uid: selected.id,
                name: selected.name,
                email: selected.email,
              },
            });
            setAssignedDriver({
              uid: selected.id,
              name: selected.name,
              email: selected.email,
            });
            Alert.alert('✅ Success', 'Driver assigned!');
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.deliveryCard}>
      <View style={styles.cardRow}>
        <Ionicons name="location-outline" size={20} color="#444" style={{ marginRight: 8 }} />
        <Text style={styles.address}>{item.address}</Text>
      </View>
      <Text style={styles.sequence}>Sequence: #{item.sequence}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="map" size={28} color="#007AFF" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>{routeName}</Text>
          <Text style={styles.subtitle}>{numPackages} Deliveries</Text>
        </View>
      </View>

      {/* Assigned Driver Section */}
      <View style={styles.assignSection}>
        <Text style={styles.label}>Assigned Driver:</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text style={styles.driverInfo}>
              {assignedDriver ? `${assignedDriver.name} (${assignedDriver.email})` : '❌ Unassigned'}
            </Text>

            <View style={{ zIndex: 1, position: 'relative' }}>
            <Dropdown
  style={styles.dropdown}
  containerStyle={styles.dropdownContainer}
  data={drivers.map(d => ({
    label: `${d.name} (${d.email})`,
    value: d.id,
  }))}
  labelField="label"
  valueField="value"
  placeholder="Select driver"
  value={selectedDriver}
  onChange={(item) => setSelectedDriver(item.value)}
/>

</View>

            <Text
              onPress={handleAssign}
              style={[
                styles.assignButton,
                !selectedDriver && { backgroundColor: '#ccc' },
              ]}
            >
              Assign Driver
            </Text>
          </>
        )}
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#e6f0ff',
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  assignSection: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  driverInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  picker: {
    height: 48,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
  },
  assignButton: {
    backgroundColor: '#007AFF',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  address: {
    fontSize: 15,
    color: '#333',
    flexShrink: 1,
  },
  sequence: {
    fontSize: 12,
    color: '#888',
  },
  dropdown: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  dropdownContainer: {
    borderRadius: 8,
  },
  
});
