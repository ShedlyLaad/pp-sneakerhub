import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Import des images
const images = {
  'assets/Produits1.jpeg': require('../assets/Produits1.jpeg'),
  'assets/produits4.png': require('../assets/produits4.png'),
  'assets/produits6.png': require('../assets/produits6.png'),
};

const ProductCard = ({ product, onPress }) => {
  const productImage = images[product.image];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={productImage} style={styles.productImage} />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price}</Text>
      <Text style={styles.productStoreLocation}>{product.storeLocation}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    height: 250,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  productName: {
    fontSize: 16,
    marginVertical: 5,
    color: '#F1FAC0',
  },
  productPrice: {
    fontSize: 14,
    color: '#2CDD0D',
  },
  productStoreLocation: {
    fontSize: 12,
    color: '#F1FAC0',
  },
});

export default ProductCard;
