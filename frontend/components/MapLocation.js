import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const MapLocation = () => {
  const [userLocation, setUserLocation] = useState(null);

  const locations = [
    { latitude: 36.8065, longitude: 10.1815, title: 'Boutique Tunis Centre Ville' }, 
    { latitude: 36.8478, longitude: 10.3303, title: 'Boutique Lac 1' }, 
  ];

  useEffect(() => {
    const getUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    getUserLocation();
  }, []);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a)); // Distance in km
  };

  const getNearestLocations = () => {
    if (!userLocation) return [];

    const distances = locations.map(location => ({
      ...location,
      distance: getDistance(userLocation.latitude, userLocation.longitude, location.latitude, location.longitude),
    }));

    // Sort by distance and get the two closest
    return distances.sort((a, b) => a.distance - b.distance).slice(0, 2);
  };

  const nearestLocations = getNearestLocations();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Our Store Locations</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 36.8065,
          longitude: userLocation ? userLocation.longitude : 10.1815,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {locations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title={location.title}
          />
        ))}
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.infoHeader}>Closest Locations</Text>
        <ScrollView style={styles.scrollView}>
          {nearestLocations.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <Text style={styles.locationTitle}>{location.title}</Text>
              <Text style={styles.locationDistance}>{location.distance.toFixed(2)} km away</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  map: {
    width: '100%',
    height: height / 2,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  infoHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scrollView: {
    maxHeight: height / 3,
  },
  locationItem: {
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationDistance: {
    fontSize: 14,
    color: '#666',
  },
});

export default MapLocation;