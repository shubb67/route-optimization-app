import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_API_KEY';

export async function geocodeAndSaveAddresses(routeId: string, deliveries: any[]) {
  const updatedDeliveries = await Promise.all(deliveries.map(async (stop) => {
    if (stop.lat && stop.lng) return stop; // Already has coordinates

    try {
      const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: stop.address,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      const location = res.data.results[0]?.geometry.location;
      if (location) {
        return {
          ...stop,
          lat: location.lat,
          lng: location.lng,
        };
      }
    } catch (err) {
      console.error('Geocoding failed for:', stop.address, err);
    }

    return stop; // Return original if failed
  }));

  // 🔥 Update route in Firestore
  const ref = doc(db, 'routes', routeId);
  await updateDoc(ref, { deliveries: updatedDeliveries });

  return updatedDeliveries;
}
