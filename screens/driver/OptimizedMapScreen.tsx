import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, Animated, Dimensions, StyleSheet
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import { useRoute } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedRegion, MarkerAnimated } from 'react-native-maps';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBzRkZqWuXYKYMhVLx_D4HQFluFvvRKXZA';

export default function OptimizedMapScreen() {
  const route = useRoute();
  const { routeId, routeName } = route.params;
  const mapRef = useRef(null);
  const navigation = useNavigation<any>();

  const [deliveries, setDeliveries] = useState([]);
  const [geocodedStops, setGeocodedStops] = useState([]);
  const [optimizedStops, setOptimizedStops] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [liveLocation, setLiveLocation] = useState(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('satellite');
  const [toastMsg, setToastMsg] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [completedStops, setCompletedStops] = useState<number[]>([]);
  const [allRouteCoords, setAllRouteCoords] = useState([]);
  const [animatedCoords, setAnimatedCoords] = useState([]);

  const [routeStats, setRouteStats] = useState({
    distanceKm: 0,
    durationMin: 0,
  });


  

  useEffect(() => {
    fetchRouteFromFirestore();
    getUserLocation();
    loadMapType();
  }, []);


  const getFinishTime = (durationMinutes) => {
    const end = new Date(Date.now() + durationMinutes * 60 * 1000);
    return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const showToast = (msg: string) => {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const toggleMapType = async () => {
    const newType = mapType === 'satellite' ? 'standard' : 'satellite';
    setMapType(newType);
    await AsyncStorage.setItem('mapType', newType);
    showToast(newType === 'satellite' ? 'Satellite View' : 'Map View');
  };

  const loadMapType = async () => {
    const saved = await AsyncStorage.getItem('mapType');
    if (saved === 'standard' || saved === 'satellite') setMapType(saved);
  };

  const fetchRouteFromFirestore = async () => {
    const docRef = doc(db, 'routes', routeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const sorted = data.deliveries.sort((a, b) => a.sequence - b.sequence);
      setDeliveries(sorted);
      geocodeAllAddresses(sorted);
    } else {
      Alert.alert('Error', 'Route not found.');
    }
  };

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setLiveLocation(coords);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 10,
      },
      (loc) => {
        setLiveLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    );
  };

  const geocodeAddress = async (address) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.status === 'OK' ? data.results[0].geometry.location : null;
  };

  const geocodeAllAddresses = async (stops) => {
    const geocoded = await Promise.all(
      stops.map(async (stop) => {
        const coords = await geocodeAddress(stop.address);
        return coords ? { ...stop, latitude: coords.lat, longitude: coords.lng } : null;
      })
    );
    const valid = geocoded.filter(Boolean);
    setGeocodedStops(valid);
    setOptimizedStops(valid);
  };
  const driverPos = useRef(
    new AnimatedRegion({
      latitude: animatedCoords[0]?.latitude || 51.05,
      longitude: animatedCoords[0]?.longitude || -114.07,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    })
  ).current;
  const chunkArray = (array, size) =>
    Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  
  const smartStopFilter = (stops) => {
    const unique = [];
    const seen = new Set();
  
    for (let i = 0; i < stops.length; i++) {
      const current = stops[i];
      const key = `${Math.round(current.latitude * 10000)},${Math.round(current.longitude * 10000)}`;
      if (seen.has(key)) continue;
      seen.add(key);
  
      const tooClose = unique.some(existing =>
        haversineDistance(existing.latitude, existing.longitude, current.latitude, current.longitude) < 0.025
      );
  
      if (!tooClose) {
        unique.push(current);
      }
    }
  
    return unique;
  };
  

  
  
  const fetchRouteAndOptimize = async () => {
    if (!liveLocation || geocodedStops.length < 2) {
      Alert.alert('Missing data', 'Ensure your location and stops are loaded.');
      return;
    }
  
    setIsLoading(true);
    setAnimatedCoords([]);
    const finalStops = [];
  
    const cleanedStops = smartStopFilter(geocodedStops);
    const chunks = chunkArray(cleanedStops, 15);
  
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk.length < 2) continue;
  
      const originLatLng = i === 0
        ? { latitude: liveLocation.latitude, longitude: liveLocation.longitude }
        : { latitude: chunk[0].latitude, longitude: chunk[0].longitude };
  
      const destination = chunk[chunk.length - 1];
      const waypoints = chunk.slice(0, -1);
  
      const seen = new Set();
      const filteredWaypoints = waypoints
        .filter(w => w.latitude && w.longitude)
        .filter(w => {
          const key = `${w.latitude},${w.longitude}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
  
      if (
        originLatLng.latitude === destination.latitude &&
        originLatLng.longitude === destination.longitude
      ) {
        console.warn(`Chunk ${i + 1} origin and destination are identical. Skipping...`);
        continue;
      }
  
      const intermediates = filteredWaypoints.map(stop => ({
        location: {
          latLng: {
            latitude: stop.latitude,
            longitude: stop.longitude
          }
        }
      }));
  
      const payload = {
        origin: { location: { latLng: originLatLng } },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude
            }
          }
        },
        intermediates,
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        optimizeWaypointOrder: true,
        polylineEncoding: 'ENCODED_POLYLINE'
      };
  
      try {
        const res = await fetch(
          `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex'
            },
            body: JSON.stringify(payload)
          }
        );
  
        const data = await res.json();
        const route = data?.routes?.[0];
        console.log("✅ ROUTE STATS", route?.distanceMeters, route?.duration);
       
        if (!route || !route.polyline?.encodedPolyline) throw new Error("Routes API polyline missing");
  
        const points = polyline.decode(route.polyline.encodedPolyline);
        const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        setAnimatedCoords(prev => [...prev, ...coords]);
  
        const order = route.optimizedIntermediateWaypointIndex || [];
        const reorderedChunk = [
          ...(i === 0 ? [{ address: 'Start', ...liveLocation }] : []),
          ...order.map(idx => filteredWaypoints[idx]),
          destination
        ];
        finalStops.push(...reorderedChunk);
  
      } catch (err) {
        console.warn(`Chunk ${i + 1} failed. Trying fallback.`, err);
  
        const originStr = `${originLatLng.latitude},${originLatLng.longitude}`;
        const destinationStr = `${destination.latitude},${destination.longitude}`;
        const waypointsStr = filteredWaypoints.map(w => `${w.latitude},${w.longitude}`).join('|');
  
        try {
          const fallbackRes = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&waypoints=optimize:true|${waypointsStr}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const fallbackData = await fallbackRes.json();
          const fallbackRoute = fallbackData.routes?.[0];
          if (!fallbackRoute?.overview_polyline?.points) continue;
          if (fallbackRoute?.legs?.length) {
            const totalDistance = fallbackRoute.legs.reduce(
              (sum, leg) => sum + (leg.distance?.value || 0),
              0
            );
            const totalDuration = fallbackRoute.legs.reduce(
              (sum, leg) => sum + (leg.duration?.value || 0),
              0
            );
        
            setRouteStats((prev) => ({
              distanceKm: prev.distanceKm + totalDistance / 1000,
              durationMin: prev.durationMin + totalDuration / 60,
            }));
          }
          const points = polyline.decode(fallbackRoute.overview_polyline.points);
          const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
          setAnimatedCoords(prev => [...prev, ...coords]);
  
          const order = fallbackRoute.waypoint_order || [];
          const reorderedChunk = [
            ...(i === 0 ? [{ address: 'Start', ...liveLocation }] : []),
            ...order.map(idx => filteredWaypoints[idx]),
            destination
          ];
          finalStops.push(...reorderedChunk);
        } catch (fallbackErr) {
          console.error('Fallback API failed', fallbackErr);
        }
      }
    }
  
    setOptimizedStops(finalStops);
    setIsLoading(false);
  };
  
  
  const getETATime = (startTime, minutesOffset) => {
    const eta = new Date(startTime.getTime() + minutesOffset * 60000);
    return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
<View style={styles.container}>
    {/* 🔙 Back Button / Header */}
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#007AFF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.screenTitle}>{routeName}</Text>
    </View>


  <MapView
    ref={mapRef}
    style={styles.map}
    mapType={mapType}
    showsUserLocation
    initialRegion={{
      latitude: 51.05,
      longitude: -114.07,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }}
  >
    {liveLocation && (
      <Marker coordinate={liveLocation} title="You" />
    )}
    {animatedCoords.length > 0 && (
      <Polyline coordinates={animatedCoords} strokeColor="#1f78ff" strokeWidth={4} />
    )}
    <MarkerAnimated coordinate={driverPos}>
      <Image
        source={require('../../assets/images/driver_icon.svg')}
        style={{ width: 36, height: 36 }}
        resizeMode="contain"
      />
    </MarkerAnimated>
    {optimizedStops.map((stop, index) => (
      <Marker
        key={index}
        coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
        title={`Stop ${index + 1}`}
        description={stop.address}
      />
    ))}
  </MapView>

  <TouchableOpacity style={styles.optimizeButton} onPress={fetchRouteAndOptimize}>
    <Text style={styles.optimizeText}>Optimize Route</Text>
  </TouchableOpacity>
  
  <FlatList
  data={optimizedStops}
  keyExtractor={(_, index) => index.toString()}
  contentContainerStyle={styles.listContainer}
  ListHeaderComponent={() => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Finish by: {getFinishTime(routeStats.durationMin)}</Text>
      <Text style={styles.summaryText}>
        Stops: {optimizedStops.length} · Distance: {routeStats.distanceKm.toFixed(1)} km
      </Text>
    </View>
  )}
  renderItem={({ item, index }) => (
    <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name="location-outline" size={20} color="#1f78ff" style={{ marginRight: 8 }} />
      <Text style={styles.cardTitle}>Stop {index + 1}</Text>
    </View>
    <Text style={styles.addressText}>{item.address}</Text>

    <TouchableOpacity
      style={[
        styles.statusButton,
        completedStops.includes(index) && styles.statusButtonCompleted,
      ]}
      onPress={() => {
        setCompletedStops((prev) =>
          prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
      }}
    >
      <Ionicons
        name={completedStops.includes(index) ? 'checkmark-circle' : 'radio-button-off'}
        size={16}
        color={completedStops.includes(index) ? 'green' : '#888'}
        style={{ marginRight: 6 }}
      />
      <Text style={styles.statusButtonText}>
        {completedStops.includes(index) ? 'Delivered' : 'Mark as Delivered'}
      </Text>
    </TouchableOpacity>
  </View>
  )}
/>
  <TouchableOpacity style={styles.mapToggle} onPress={toggleMapType}>
    <Ionicons name={mapType === 'satellite' ? 'map-outline' : 'image-outline'} size={24} color="#007aff" />
  </TouchableOpacity>

  <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
    <Text style={styles.toastText}>{toastMsg}</Text>
  </Animated.View>

  {isLoading && (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  )}
</View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: height * 0.35, width: '100%' },
  button: {
    backgroundColor: '#1f78ff',
    margin: 12,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#f2f5f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  summaryTitle: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryText: {
    color: '#444',
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    zIndex: 999,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginLeft: 20,
  },
  

  optimizeButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1f78ff',
    padding: 14,
    borderRadius: 12,
    zIndex: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
  },
  optimizeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  mapToggle: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    elevation: 4,
    zIndex: 100,
  },
  toast: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    backgroundColor: '#007aff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 99,
  },
  toastText: { color: '#fff', fontWeight: '600' },
 
  completeButton: {
    backgroundColor: '#eee',
    padding: 10,
    marginTop: 6,
    borderRadius: 6,
  },
  completeButtonDone: {
    backgroundColor: '#ccffcc',
  },
  completeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  markerCircle: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  loadingBox: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f78ff',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    alignSelf: 'flex-start',
  },
  statusButtonCompleted: {
    backgroundColor: '#e6ffed',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  
});
