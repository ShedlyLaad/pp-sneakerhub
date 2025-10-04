import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import productsData from '../products.json';
import ProductCard from '../components/ProductCard';
import MapLocation from '../components/MapLocation';

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(productsData);

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const newData = productsData.filter(item => {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredProducts(newData);
    } else {
      setFilteredProducts(productsData);
    }
  };

  const bestSellers = filteredProducts.slice(0, 5); // Example data for Best Sellers
  const lastSellers = filteredProducts.slice(5, 10); // Example data for Last Sellers
  const news = filteredProducts.slice(10, 15); // Example data for News

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    />
  );

  return (
    <LinearGradient colors={['#000000', '#000000']} style={styles.container}>
      <Text style={styles.subtitle}>Best Sellers</Text>
      <FlatList
        data={bestSellers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
      />

      <Text style={styles.subtitle}>Last Sellers</Text>
      <FlatList
        data={bestSellers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
      />

      <Text style={styles.subtitle}>News</Text>
      
      <FlatList
        data={bestSellers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productList}
      />
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
  productList: {
    paddingBottom: 20,
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
});

export default HomeScreen;
