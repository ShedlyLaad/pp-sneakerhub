import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from '../components/ProductCard';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import * as productsApi from '../services/api/productsApi';

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async (searchText) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsApi.fetchProducts({ search: searchText });
      setProducts(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (text) => {
    setSearch(text);
    loadProducts(text);
  };

  // Sections are derived slices of the same backend result: newest, and a
  // simple "best sellers" placeholder until real sales data exists.
  const bestSellers = products.slice(0, 5);
  const news = [...products].reverse().slice(0, 5);

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    />
  );

  if (isLoading) {
    return (
      <LinearGradient colors={['#000000', '#000000']} style={styles.container}>
        <LoadingState label="Loading products…" />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#000000', '#000000']} style={styles.container}>
        <ErrorState message={error} onRetry={() => loadProducts(search)} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#000000']} style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={handleSearch}
      />

      {products.length === 0 ? (
        <EmptyState message="No products found." />
      ) : (
        <>
          <Text style={styles.subtitle}>Best Sellers</Text>
          <FlatList
            data={bestSellers}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />

          <Text style={styles.subtitle}>News</Text>
          <FlatList
            data={news}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  searchBar: {
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#F1FAC0',
    marginVertical: 10,
  },
  productList: {
    paddingBottom: 20,
  },
});

export default HomeScreen;
