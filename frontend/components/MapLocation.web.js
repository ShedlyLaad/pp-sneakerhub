import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Location from 'expo-location';

// react-native-maps has no web support (it relies on native codegen components
// that don't exist on the web platform). Metro/Expo automatically picks this
// ".web.js" file instead of MapLocation.js when bundling for web, so we show
// a plain list of boutiques here instead of crashing the web bundle.
const LOCATIONS = [
  { latitude: 36.8065, longitude: 10.1815, title: 'Boutique Tunis Centre Ville' },
  { latitude: 36.8478, longitude: 10.3303, title: 'Boutique Lac 1' },
];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    0.5 - Math.cos(dLat) / 2 +
    (Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * (1 - Math.cos(dLon))) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

const MapLocation = () => {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        console.log('Location unavailable on web:', err.message);
      }
    })();
  }, []);

  const sortedLocations = userLocation
    ? [...LOCATIONS]
        .map((loc) => ({
          ...loc,
          distance: getDistance(userLocation.latitude, userLocation.longitude, loc.latitude, loc.longitude),
        }))
        .sort((a, b) => a.distance - b.distance)
    : LOCATIONS;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Our Store Locations</Text>
      <Text style={styles.note}>Map view is only available in the mobile app.</Text>
      <ScrollView style={styles.scrollView}>
        {sortedLocations.map((location, index) => (
          <View key={index} style={styles.locationItem}>
            <Text style={styles.locationTitle}>{location.title}</Text>
            {location.distance !== undefined && (
              <Text style={styles.locationDistance}>{location.distance.toFixed(2)} km away</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#F1FAC0',
  },
  note: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  locationItem: {
    marginBottom: 12,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F1FAC0',
  },
  locationDistance: {
    fontSize: 14,
    color: '#2CDD0D',
    marginTop: 4,
  },
});

export default MapLocation;
