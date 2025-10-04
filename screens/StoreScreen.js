import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import products from '../products.json';
import ProductCard from '../components/ProductCard';

const StoreScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = (text) => {
    setSearch(text);
    filterAndSortProducts(text, sortOrder);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    filterAndSortProducts(search, order);
  };

  const filterAndSortProducts = (searchText, order) => {
    let filtered = products;
    if (searchText) {
      filtered = products.filter(item => {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = searchText.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
    }
    if (order === 'A-Z') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (order === 'Z-A') {
      filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (order === 'Latest') {
      filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    setFilteredProducts(filtered);
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
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                handleSort('A-Z');
                setModalVisible(false);
              }}
            >
              <Text style={styles.filterText}>A-Z</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                handleSort('Z-A');
                setModalVisible(false);
              }}
            >
              <Text style={styles.filterText}>Z-A</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                handleSort('Latest');
                setModalVisible(false);
              }}
            >
              <Text style={styles.filterText}>Latest</Text>
            </TouchableOpacity>
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
          onChangeText={(text) => handleSearch(text)}
        />
        <TouchableOpacity style={styles.searchIcon}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterIcon} onPress={() => setModalVisible(true)}>
          <Feather name="filter" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {renderFilterModal()}

      <ScrollView contentContainerStyle={styles.productList} >
        {filteredProducts.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
            style={styles.productCard}
          />
        ))}
      </ScrollView>

      {filteredProducts.length === 0 && (
        <View style={styles.noProductView}>
          <Text style={styles.noProductText}>No Product Found</Text>
        </View>
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
    paddingBottom: 20,
  },
  productCard: {
    marginRight: 15,
  },
  noProductView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductText: {
    fontSize: 18,
    color: '#F1FAC0',
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
