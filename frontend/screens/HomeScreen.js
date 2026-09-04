import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import * as productsApi from '../services/api/productsApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const FOOTER_LINKS = {
  About: 'SnaekersHub is a mobile marketplace for authentic sneakers - curated drops, real stock, straightforward checkout.',
  Contact: 'Need help with an order? Reach us at support@snaekershub.com.',
  'Privacy Policy': 'We only use your data to run your account, cart and orders. We never sell it.',
  Terms: 'By using SnaekersHub you agree to pay for orders placed and to provide accurate shipping details.',
  Help: 'Most questions are answered in My Orders and My Profile. Still stuck? Contact support.',
};

const HomeScreen = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLanding = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesRes, featuredRes, newArrivalsRes, bestSellersRes] = await Promise.all([
        productsApi.fetchCategories(),
        productsApi.fetchProducts({ featured: true }),
        productsApi.fetchProducts({ sort: 'Latest' }),
        productsApi.fetchBestSellers(10),
      ]);
      setCategories(categoriesRes.data);
      setFeatured(featuredRes.data);
      setNewArrivals(newArrivalsRes.data.slice(0, 10));
      setBestSellers(bestSellersRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanding();
  }, [loadLanding]);

  const handleSearch = useCallback(async (text) => {
    setSearch(text);
    if (!text.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await productsApi.fetchProducts({ search: text });
      setSearchResults(res.data);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const goToStore = (params) => navigation.navigate('Store', { screen: 'StoreScreen', params });

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      onRequireLogin={() => navigation.navigate('Login')}
    />
  );

  const renderSection = (title, data, seeAllParams) =>
    data.length > 0 && (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity onPress={() => goToStore(seeAllParams)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />
      </View>
    );

  return (
    <LinearGradient colors={['#000000', '#000000']} style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>SnaekersHub</Text>
        <View style={styles.headerActions}>
          {isAuthenticated ? (
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { screen: 'ProfileScreen' })}>
              <Feather name="user" size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.headerAuthButton}>
                <Text style={styles.headerAuthText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.headerAuthButtonPrimary}>
                <Text style={styles.headerAuthTextPrimary}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Cart', { screen: 'CartScreen' })} style={styles.cartIcon}>
            <Feather name="shopping-cart" size={22} color="#fff" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search sneakers, brands..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={handleSearch}
      />

      {search.trim() ? (
        searching ? (
          <LoadingState label="Searching…" />
        ) : searchResults && searchResults.length === 0 ? (
          <EmptyState message="No products found." />
        ) : (
          <FlatList
            data={searchResults || []}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
          />
        )
      ) : isLoading ? (
        <LoadingState label="Loading SnaekersHub…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadLanding} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Sneakers premium.{'\n'}Style. Performance.</Text>
            <Text style={styles.heroSubtitle}>
              {user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Discover the drop everyone is talking about.'}
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroButtonPrimary} onPress={() => goToStore()}>
                <Text style={styles.heroButtonPrimaryText}>Shop Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroButtonSecondary} onPress={() => goToStore()}>
                <Text style={styles.heroButtonSecondaryText}>Explore Collection</Text>
              </TouchableOpacity>
            </View>
          </View>

          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoryRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.categoryChip}
                    onPress={() => goToStore({ category: cat })}
                  >
                    <Text style={styles.categoryChipText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {renderSection('Featured Products', featured, { featured: true })}
          {renderSection('New Arrivals', newArrivals, { sort: 'Latest' })}
          {renderSection('Best Sellers', bestSellers, {})}

          <TouchableOpacity style={styles.promo} onPress={() => goToStore()}>
            <Text style={styles.promoTitle}>Up to 30% Off Selected Sneakers</Text>
            <Text style={styles.promoSubtitle}>Shop the sale before it's gone</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            {Object.entries(FOOTER_LINKS).map(([label, body]) => (
              <TouchableOpacity key={label} onPress={() => Alert.alert(label, body)} style={styles.footerLink}>
                <Text style={styles.footerLinkText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.footerCopy}>© {new Date().getFullYear()} SnaekersHub</Text>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2CDD0D',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerAuthButton: {
    paddingHorizontal: 4,
  },
  headerAuthText: {
    color: '#ccc',
    fontSize: 14,
  },
  headerAuthButtonPrimary: {
    backgroundColor: '#2CDD0D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerAuthTextPrimary: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  cartIcon: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ff5c5c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: {
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 14,
  },
  grid: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  hero: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 22,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F1FAC0',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  heroButtonPrimary: {
    backgroundColor: '#2CDD0D',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  heroButtonPrimaryText: {
    color: '#000',
    fontWeight: '700',
  },
  heroButtonSecondary: {
    borderWidth: 1,
    borderColor: '#2CDD0D',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  heroButtonSecondaryText: {
    color: '#2CDD0D',
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1FAC0',
    marginBottom: 10,
  },
  seeAll: {
    fontSize: 13,
    color: '#2CDD0D',
  },
  productList: {
    paddingBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryChipText: {
    color: '#F1FAC0',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  promo: {
    backgroundColor: '#1f2a12',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  promoTitle: {
    color: '#2CDD0D',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  promoSubtitle: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 6,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 16,
    paddingBottom: 30,
  },
  footerLink: {
    paddingVertical: 8,
  },
  footerLinkText: {
    color: '#888',
    fontSize: 13,
  },
  footerCopy: {
    color: '#555',
    fontSize: 11,
    marginTop: 12,
  },
});

export default HomeScreen;
