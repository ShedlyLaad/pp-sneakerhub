import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as productsApi from '../services/api/productsApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorState } from '../components/ScreenState';

const ProductDetails = ({ route, navigation }) => {
  const { productId } = route.params;
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

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
      setFeedback({ type: 'error', text: 'Please log in to add items to your cart.' });
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

  return (
    <View style={styles.container}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, styles.placeholder]}>
          <Feather name="image" size={48} color="#666" />
        </View>
      )}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
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

      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart} disabled={adding}>
        {adding ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.addToCartButtonText}>Add to cart</Text>
        )}
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
  placeholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F1FAC0',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 20,
    color: '#2CDD0D',
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
    width: '80%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  addToCartButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProductDetails;
