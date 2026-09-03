import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as cartApi from '../services/api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY_CART = { items: [], total: 0 };

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await cartApi.fetchCart();
      setCart(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Reload the cart whenever the user logs in/out, so it never leaks between accounts.
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setError(null);
    try {
      const res = await cartApi.addCartItem(productId, quantity);
      setCart(res.data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setError(null);
    try {
      const res = await cartApi.updateCartItem(productId, quantity);
      setCart(res.data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    setError(null);
    try {
      const res = await cartApi.removeCartItem(productId);
      setCart(res.data);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const emptyCart = useCallback(async () => {
    setError(null);
    try {
      await cartApi.clearCart();
      setCart(EMPTY_CART);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const itemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  const value = useMemo(
    () => ({
      cart,
      itemCount,
      isLoading,
      error,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      emptyCart,
    }),
    [cart, itemCount, isLoading, error, refreshCart, addToCart, updateQuantity, removeFromCart, emptyCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
