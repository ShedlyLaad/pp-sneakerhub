import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapLocation from '../components/MapLocation';

function BoutiqueScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Boutique Screen</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddProductScreen')}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>
      <View style={styles.mapContainer}>
        <Text style={styles.subtitle}>Map Shop</Text>
        <MapLocation />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#2CDD0D',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
});

export default BoutiqueScreen;
