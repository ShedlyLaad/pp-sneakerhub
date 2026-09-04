import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorState, EmptyState, LoginRequired } from '../components/ScreenState';

const CartScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { cart, isLoading, error, refreshCart, updateQuantity, removeFromCart } = useCart();
  const insets = useSafeAreaInsets();
  const containerStyle = [styles.container, { paddingTop: insets.top + 20 }];

  if (!isAuthenticated) {
    return (
      <View style={containerStyle}>
        <LoginRequired navigation={navigation} message="Log in to view your cart." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={containerStyle}>
        <LoadingState label="Loading your cart…" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={containerStyle}>
        <ErrorState message={error} onRetry={refreshCart} />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
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
                  style={[styles.quantityButton, item.quantity >= item.product.stock && styles.quantityButtonDisabled]}
                  disabled={item.quantity >= item.product.stock}
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
          onPress={() => navigation.navigate('Checkout')}
          disabled={cart.items.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
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
  quantityButtonDisabled: {
    opacity: 0.4,
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
});

export default CartScreen;
