// utils/optimizer.js
export const optimizeRoute = async (stops, apiKey) => {
    const origin = stops[0];
    const destination = stops[stops.length - 1];
    const waypoints = stops.slice(1, -1)
      .map(stop => `${stop.lat},${stop.lng}`)
      .join('|');
  
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&waypoints=optimize:true|${waypoints}&key=${apiKey}`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes returned from Google Maps API');
    }
  
    return data.routes[0];
  };
  