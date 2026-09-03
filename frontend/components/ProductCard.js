import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

// The first products were seeded from the legacy local products.json and still
// reference bundled assets by relative path. Any product created afterwards
// through the app stores a real image URI (device photo or remote URL) instead.
const legacyImages = {
  'assets/Produits1.jpeg': require('../assets/Produits1.jpeg'),
  'assets/produits4.png': require('../assets/produits4.png'),
  'assets/produits6.png': require('../assets/produits6.png'),
};

function resolveImageSource(image) {
  if (!image) return null;
  if (legacyImages[image]) return legacyImages[image];
  return { uri: image };
}

const ProductCard = ({ product, onPress, style }) => {
  const source = resolveImageSource(product.image);

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      {source ? (
        <Image source={source} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.placeholder]}>
          <Feather name="image" size={28} color="#666" />
        </View>
      )}
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
      {!!product.storeLocation && (
        <Text style={styles.productStoreLocation} numberOfLines={1}>
          {product.storeLocation}
        </Text>
      )}
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
    height: 250,
    width: 150,
    // "shadow*" props are deprecated in favor of the cross-platform
    // "boxShadow" style; Android still relies on "elevation" for depth.
    ...Platform.select({
      android: { elevation: 3 },
      default: { boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' },
    }),
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  placeholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
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
