import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import * as ordersApi from '../services/api/ordersApi';

const CartScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { cart, isLoading, error, refreshCart, updateQuantity, removeFromCart } = useCart();
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [address, setAddress] = useState({ line1: '', city: '', postalCode: '', country: '' });

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <EmptyState message="Log in to view your cart." />
        <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.checkoutButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading your cart…" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={refreshCart} />
      </View>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.line1.trim() || !address.city.trim() || !address.country.trim()) {
      setCheckoutError('Address line, city and country are required.');
      return;
    }
    setPlacing(true);
    setCheckoutError(null);
    try {
      await ordersApi.createOrder({ shippingAddress: address });
      await refreshCart();
      setCheckoutVisible(false);
      navigation.navigate('Profile', { screen: 'Orders', params: { justPlaced: true } });
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      {cart.items.length === 0 ? (
        <EmptyState message="Your cart is empty." />
      ) : (
        <FlatList
          data={cart.items}
          keyExtractor={(item) => item.product.id}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              {item.product.image ? (
                <Image source={{ uri: item.product.image }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.placeholder]}>
                  <Feather name="image" size={20} color="#666" />
                </View>
              )}
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.productPrice}>${item.product.price.toFixed(2)}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    item.quantity > 1
                      ? updateQuantity(item.product.id, item.quantity - 1)
                      : removeFromCart(item.product.id)
                  }
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.removeButton}>
                <Feather name="trash-2" size={18} color="#ff5c5c" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${cart.total.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, cart.items.length === 0 && styles.checkoutButtonDisabled]}
          onPress={() => setCheckoutVisible(true)}
          disabled={cart.items.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={checkoutVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Shipping address</Text>
            <TextInput
              style={styles.input}
              placeholder="Address line"
              placeholderTextColor="#888"
              value={address.line1}
              onChangeText={(v) => setAddress((a) => ({ ...a, line1: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#888"
              value={address.city}
              onChangeText={(v) => setAddress((a) => ({ ...a, city: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Postal code"
              placeholderTextColor="#888"
              value={address.postalCode}
              onChangeText={(v) => setAddress((a) => ({ ...a, postalCode: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Country"
              placeholderTextColor="#888"
              value={address.country}
              onChangeText={(v) => setAddress((a) => ({ ...a, country: v }))}
            />
            {checkoutError && <Text style={styles.checkoutError}>{checkoutError}</Text>}
            <TouchableOpacity style={styles.checkoutButton} onPress={handlePlaceOrder} disabled={placing}>
              {placing ? <ActivityIndicator color="#000" /> : <Text style={styles.checkoutButtonText}>Place order</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCheckoutVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  placeholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
    color: '#F1FAC0',
  },
  productPrice: {
    fontSize: 14,
    color: '#2CDD0D',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#000000',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#F1FAC0',
  },
  removeButton: {
    marginLeft: 10,
    padding: 4,
  },
  totalContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F1FAC0',
  },
  checkoutButton: {
    backgroundColor: '#2CDD0D',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    opacity: 0.4,
  },
  checkoutButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#F1FAC0',
    marginBottom: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#fff',
  },
  checkoutError: {
    color: '#ff5c5c',
    marginBottom: 12,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#aaa',
  },
});

export default CartScreen;
