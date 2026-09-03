import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import * as productsApi from '../services/api/productsApi';

const StoreScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadProducts = useCallback(async (searchText, sort) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsApi.fetchProducts({ search: searchText, sort });
      setProducts(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(search, sortOrder);
    // Only run once on mount; subsequent loads are triggered explicitly below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    loadProducts(text, sortOrder);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    loadProducts(search, order);
  };

  const renderFilterModal = () => (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {['A-Z', 'Z-A', 'Latest', 'price-asc', 'price-desc'].map((order) => (
              <TouchableOpacity
                key={order}
                style={styles.filterOption}
                onPress={() => {
                  handleSort(order);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.filterText}>
                  {order === 'price-asc' ? 'Price: low to high' : order === 'price-desc' ? 'Price: high to low' : order}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <LinearGradient colors={['#000000', '#000000']} style={styles.container}>
      <Text style={styles.subtitle}>Store</Text>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchIcon}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterIcon} onPress={() => setModalVisible(true)}>
          <Feather name="filter" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {renderFilterModal()}

      {isLoading ? (
        <LoadingState label="Loading products…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadProducts(search, sortOrder)} />
      ) : products.length === 0 ? (
        <EmptyState message="No Product Found" />
      ) : (
        <ScrollView contentContainerStyle={styles.productList}>
          {products.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
              style={styles.productCard}
            />
          ))}
        </ScrollView>
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
  subtitle: {
    fontSize: 16,
    color: '#F1FAC0',
    marginVertical: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
    color: '#ffffff',
  },
  searchIcon: {
    padding: 10,
  },
  filterIcon: {
    padding: 10,
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  productCard: {
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  filterOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterText: {
    fontSize: 18,
    color: '#333',
  },
});

export default StoreScreen;
