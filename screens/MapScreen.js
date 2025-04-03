import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { doc, getDoc } from 'firebase/firestore';
import { optimizeRoute } from '../utils/optimizer'; // Adjust as needed
import { auth, db } from '../firebaseconfig';
import { signOut } from 'firebase/auth'; 
import { LogoutText, LogoutButton } from '@/components/FormStyles';
import { useNavigation } from '@react-navigation/native';

export const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [stops, setStops] = useState([
    { lat: 51.0447, lng: -114.0719 }, // Calgary
    { lat: 53.5461, lng: -113.4938 }, // Edmonton
    { lat: 49.2827, lng: -123.1207 }  // Vancouver
  ]);
  const [userName, setUserName] = useState('');
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;
const navigation = useNavigation();
  useEffect(() => {
    const init = async () => {
      try {
        // Get location permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        // Get current user location
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        // Get optimized route
        const route = await optimizeRoute(stops, GOOGLE_MAPS_API_KEY);
        if (route?.overview_polyline?.points) {
            const points = decodePolyline(route.overview_polyline.points);
            setRouteCoords(points);
          } else {
            console.warn('No route returned or missing polyline:', route);
          }
        // Fetch user name from Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);
          console.log('User data:', userSnap.data());
          if (userSnap.exists()) {
            setUserName(userSnap.data().name);
          }
        }
      } catch (err) {
        console.error('Error loading map screen:', err);
      }
    };

    init();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const decodePolyline = (t, e = 5) => {
    let points = [], index = 0, lat = 0, lng = 0;
    while (index < t.length) {
      let b, shift = 0, result = 0;
      do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
      while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0; result = 0;
      do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; }
      while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  if (!location) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {userName} 👋</Text>
      <LogoutButton onPress={handleLogout}>
  <LogoutText>Logout</LogoutText>
</LogoutButton>
  <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {stops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={`Stop ${index + 1}`}
          />
        ))}
        <Polyline coordinates={routeCoords} strokeWidth={4} />
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative', // <== important
      },
      welcome: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 40,
        marginBottom: 10,
        marginHorizontal: 16,
        zIndex: 2, // ensures it's above MapView
      },
      map: {
        flex: 1,
        zIndex: 1,
      },
});
