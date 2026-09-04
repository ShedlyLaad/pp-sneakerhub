import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { LoadingState, ErrorState, EmptyState, LoginRequired } from '../components/ScreenState';

const FavoritesScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { favorites, isLoading, error, removeFavorite, refreshFavorites } = useFavorites();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);
  const insets = useSafeAreaInsets();
  const containerStyle = [styles.container, { paddingTop: insets.top + 20 }];

  if (!isAuthenticated) {
    return (
      <View style={containerStyle}>
        <LoginRequired navigation={navigation} message="Log in to see your favorites." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={containerStyle}>
        <LoadingState label="Loading your favorites…" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={containerStyle}>
        <ErrorState message={error} onRetry={refreshFavorites} />
      </View>
    );
  }

  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    await addToCart(product.id, 1);
    setAddingId(null);
  };

  return (
    <View style={containerStyle}>
      <Text style={styles.title}>My Favorites</Text>
      {favorites.length === 0 ? (
        <EmptyState message="You haven't added any favorites yet." />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholder]}>
                  <Feather name="image" size={20} color="#666" />
                </View>
              )}
              <View style={styles.details}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
                {item.stock === 0 && <Text style={styles.outOfStock}>Out of stock</Text>}
              </View>
              <TouchableOpacity
                style={[styles.cartButton, item.stock === 0 && styles.cartButtonDisabled]}
                disabled={item.stock === 0 || addingId === item.id}
                onPress={() => handleAddToCart(item)}
              >
                <Feather name="shopping-cart" size={16} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeFavorite(item.id)} hitSlop={8}>
                <Feather name="heart" size={18} color="#ff5c5c" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1FAC0',
    marginBottom: 14,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    color: '#F1FAC0',
    fontSize: 15,
  },
  price: {
    color: '#2CDD0D',
    fontSize: 14,
    marginTop: 2,
  },
  outOfStock: {
    color: '#ff5c5c',
    fontSize: 12,
    marginTop: 2,
  },
  cartButton: {
    backgroundColor: '#2CDD0D',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cartButtonDisabled: {
    opacity: 0.3,
  },
  removeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default FavoritesScreen;
