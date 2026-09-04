import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as favoritesApi from '../services/api/favoritesApi';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await favoritesApi.fetchFavorites();
      setFavorites(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Reload whenever the user logs in/out, so favorites never leak between accounts.
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const favoriteIds = useMemo(() => new Set(favorites.map((p) => p.id)), [favorites]);

  const isFavorite = useCallback((productId) => favoriteIds.has(productId), [favoriteIds]);

  // Optimistic add/remove: the heart icon flips instantly, then reconciles
  // with the server. On failure it rolls back so the UI never lies about
  // what's actually saved.
  const addFavorite = useCallback(async (product) => {
    setFavorites((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]));
    try {
      await favoritesApi.addFavorite(product.id);
      return { success: true };
    } catch (err) {
      setFavorites((prev) => prev.filter((p) => p.id !== product.id));
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const removeFavorite = useCallback(async (productId) => {
    const previous = favorites;
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
    try {
      await favoritesApi.removeFavorite(productId);
      return { success: true };
    } catch (err) {
      setFavorites(previous);
      setError(err.message);
      return { success: false, error: err.message };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);

  const toggleFavorite = useCallback(
    (product) => (isFavorite(product.id) ? removeFavorite(product.id) : addFavorite(product)),
    [isFavorite, addFavorite, removeFavorite]
  );

  const value = useMemo(
    () => ({
      favorites,
      isLoading,
      error,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      refreshFavorites,
    }),
    [favorites, isLoading, error, isFavorite, addFavorite, removeFavorite, toggleFavorite, refreshFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
