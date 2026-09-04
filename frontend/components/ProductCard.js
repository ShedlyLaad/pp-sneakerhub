import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

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

const ProductCard = ({ product, onPress, style, onRequireLogin }) => {
  const source = resolveImageSource(product.image);
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isAuthenticated && isFavorite(product.id);

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      onRequireLogin?.();
      return;
    }
    toggleFavorite(product);
  };

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {source ? (
          <Image source={source} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.placeholder]}>
            <Feather name="image" size={28} color="#666" />
          </View>
        )}
        {!!product.discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{product.discountPercent}%</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite} hitSlop={8}>
          <Feather name="heart" size={16} color={favorited ? '#ff5c5c' : '#fff'} />
        </TouchableOpacity>
      </View>
      <Text style={styles.productName} numberOfLines={1}>
        {product.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
        {!!product.compareAtPrice && (
          <Text style={styles.comparePrice}>${Number(product.compareAtPrice).toFixed(2)}</Text>
        )}
      </View>
      {product.stock === 0 ? (
        <Text style={styles.outOfStock}>Out of stock</Text>
      ) : (
        !!product.storeLocation && (
          <Text style={styles.productStoreLocation} numberOfLines={1}>
            {product.storeLocation}
          </Text>
        )
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
  imageWrapper: {
    position: 'relative',
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
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#ff5c5c',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    marginVertical: 5,
    color: '#F1FAC0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#2CDD0D',
    fontWeight: '700',
  },
  comparePrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  outOfStock: {
    fontSize: 12,
    color: '#ff5c5c',
  },
  productStoreLocation: {
    fontSize: 12,
    color: '#F1FAC0',
  },
});

export default ProductCard;
