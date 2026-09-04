import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as productsApi from '../services/api/productsApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { LoadingState, ErrorState } from '../components/ScreenState';

const ProductDetails = ({ route, navigation }) => {
  const { productId } = route.params;
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsApi.fetchProduct(productId);
      setProduct(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setFeedback({ type: 'error', text: 'Please login to continue.' });
      return;
    }
    setAdding(true);
    setFeedback(null);
    const result = await addToCart(product.id, 1);
    setAdding(false);
    setFeedback(
      result.success
        ? { type: 'success', text: 'Added to cart!' }
        : { type: 'error', text: result.error }
    );
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      setFeedback({ type: 'error', text: 'Please login to continue.' });
      return;
    }
    toggleFavorite(product);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading product…" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <ErrorState message={error || 'Product not found.'} onRetry={load} />
      </View>
    );
  }

  const favorited = isAuthenticated && isFavorite(product.id);
  const outOfStock = product.stock <= 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageWrapper}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.placeholder]}>
              <Feather name="image" size={48} color="#666" />
            </View>
          )}
          {!!product.discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{product.discountPercent}%</Text>
            </View>
          )}
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite} hitSlop={8}>
            <Feather name="heart" size={20} color={favorited ? '#ff5c5c' : '#fff'} />
          </TouchableOpacity>
        </View>

        {!!product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
          {!!product.compareAtPrice && (
            <Text style={styles.comparePrice}>${Number(product.compareAtPrice).toFixed(2)}</Text>
          )}
        </View>

        <Text style={outOfStock ? styles.outOfStock : styles.inStock}>
          {outOfStock ? 'Out of stock' : `In stock (${product.stock} available)`}
        </Text>

        {!!product.storeLocation && (
          <Text style={styles.productLocation}>{product.storeLocation}</Text>
        )}
        {!!product.description && (
          <Text style={styles.productDescription}>{product.description}</Text>
        )}

        {feedback && (
          <Text style={feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}>
            {feedback.text}
          </Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addToCartButton, outOfStock && styles.addToCartButtonDisabled]}
        onPress={handleAddToCart}
        disabled={adding || outOfStock}
      >
        {adding ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.addToCartButtonText}>{outOfStock ? 'Out of stock' : 'Add to cart'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  productImage: {
    width: 220,
    height: 220,
    borderRadius: 10,
  },
  placeholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff5c5c',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBrand: {
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 4,
    color: '#F1FAC0',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#2CDD0D',
    fontWeight: '700',
  },
  comparePrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  inStock: {
    fontSize: 13,
    color: '#2CDD0D',
    marginBottom: 10,
  },
  outOfStock: {
    fontSize: 13,
    color: '#ff5c5c',
    marginBottom: 10,
  },
  productLocation: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#F1FAC0',
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackError: {
    color: '#ff5c5c',
    marginBottom: 12,
  },
  feedbackSuccess: {
    color: '#2CDD0D',
    marginBottom: 12,
  },
  addToCartButton: {
    backgroundColor: '#2CDD0D',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    opacity: 0.4,
  },
  addToCartButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProductDetails;
