import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import products from '../products.json'; // Assurez-vous que ce chemin est correct

const CartScreen = () => {
  const initialCartItems = products.map((product) => ({
    ...product,
    quantity: 1, // initialiser chaque produit avec une quantité de 1
  }));

  const [cartItems, setCartItems] = useState(initialCartItems);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const calculateTotal = () => {
    const totalAmount = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return sum + price * item.quantity;
    }, 0);
    setTotal(totalAmount.toFixed(2));
  };

  const updateQuantity = (id, action) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === id) {
        const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        return {
          ...item,
          quantity: newQuantity > 0 ? newQuantity : 1, // éviter les quantités négatives
        };
      }
      return item;
    });
    setCartItems(updatedCartItems);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, 'decrease')}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, 'increase')}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${total}</Text>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
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
    marginBottom: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
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
    padding: 5,
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
  totalContainer: {
    marginTop: 20,
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
  checkoutButtonText: {
    color: '#000000',
    fontSize: 18,
  },
});

export default CartScreen;
