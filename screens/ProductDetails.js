import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const ProductDetails = ({ route }) => {
  const { product } = route.params;
  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price}</Text>
      <Text style={styles.productDescription}>{product.description}</Text>
      <TouchableOpacity style={styles.addToCartButton}>
        <Text style={styles.addToCartButtonText}>Add to cart</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F1FAC0',
  },
  productPrice: {
    fontSize: 20,
    color: '#2CDD0D',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#F1FAC0',
    marginBottom: 20,
  },
  addToCartButton: {
    backgroundColor: '#2CDD0D',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#000000',
    fontSize: 18,
  },
});

export default ProductDetails;
