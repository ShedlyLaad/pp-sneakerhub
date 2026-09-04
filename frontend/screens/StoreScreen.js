import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import * as productsApi from '../services/api/productsApi';

const SORT_OPTIONS = ['A-Z', 'Z-A', 'Latest', 'price-asc', 'price-desc'];
const SORT_LABELS = {
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
};

const EMPTY_FILTERS = { category: undefined, brand: undefined, minPrice: '', maxPrice: '', inStock: false };

const StoreScreen = ({ navigation, route }) => {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState(route.params?.sort || 'A-Z');
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...route.params });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const loadProducts = useCallback(async (searchText, sort, activeFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productsApi.fetchProducts({
        search: searchText,
        sort,
        category: activeFilters.category,
        brand: activeFilters.brand,
        minPrice: activeFilters.minPrice || undefined,
        maxPrice: activeFilters.maxPrice || undefined,
        inStock: activeFilters.inStock || undefined,
      });
      setProducts(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    productsApi.fetchCategories().then((res) => setCategories(res.data)).catch(() => {});
    productsApi.fetchBrands().then((res) => setBrands(res.data)).catch(() => {});
  }, []);

  // The Store tab stays mounted across navigations (tab navigators don't
  // unmount hidden screens), so arriving here again from Home with different
  // params (e.g. a different category chip) wouldn't otherwise reload -
  // react to route.params changing instead of only running once on mount.
  useEffect(() => {
    const nextFilters = { ...EMPTY_FILTERS, ...route.params };
    const nextSort = route.params?.sort || 'A-Z';
    setFilters(nextFilters);
    setSortOrder(nextSort);
    loadProducts(search, nextSort, nextFilters);
    // "search" intentionally excluded: incoming navigation params should
    // reset filters/sort but not clobber whatever the user is typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  const handleSearch = (text) => {
    setSearch(text);
    loadProducts(text, sortOrder, filters);
  };

  const handleSort = (order) => {
    setSortOrder(order);
    loadProducts(search, order, filters);
  };

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
    loadProducts(search, sortOrder, nextFilters);
  };

  const toggleChip = (key, value) => {
    applyFilters({ ...filters, [key]: filters[key] === value ? undefined : value });
  };

  const activeFilterCount =
    (filters.category ? 1 : 0) + (filters.brand ? 1 : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.inStock ? 1 : 0);

  const renderSortModal = () => (
    <Modal transparent visible={sortModalVisible} animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {SORT_OPTIONS.map((order) => (
              <TouchableOpacity
                key={order}
                style={styles.filterOption}
                onPress={() => {
                  handleSort(order);
                  setSortModalVisible(false);
                }}
              >
                <Text style={styles.filterText}>{SORT_LABELS[order] || order}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal transparent visible={filterModalVisible} animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContainer}>
          <ScrollView>
            <Text style={styles.filterModalTitle}>Filters</Text>

            <Text style={styles.filterSectionLabel}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, filters.category === c && styles.chipActive]}
                  onPress={() => toggleChip('category', c)}
                >
                  <Text style={[styles.chipText, filters.category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionLabel}>Brand</Text>
            <View style={styles.chipRow}>
              {brands.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, filters.brand === b && styles.chipActive]}
                  onPress={() => toggleChip('brand', b)}
                >
                  <Text style={[styles.chipText, filters.brand === b && styles.chipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionLabel}>Price range</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                placeholderTextColor="#888"
                keyboardType="decimal-pad"
                value={filters.minPrice}
                onChangeText={(v) => setFilters((f) => ({ ...f, minPrice: v }))}
              />
              <Text style={styles.priceDash}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                placeholderTextColor="#888"
                keyboardType="decimal-pad"
                value={filters.maxPrice}
                onChangeText={(v) => setFilters((f) => ({ ...f, maxPrice: v }))}
              />
            </View>

            <TouchableOpacity style={styles.inStockRow} onPress={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}>
              <Feather name={filters.inStock ? 'check-square' : 'square'} size={20} color="#2CDD0D" />
              <Text style={styles.inStockLabel}>In stock only</Text>
            </TouchableOpacity>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.filterClearButton}
                onPress={() => {
                  applyFilters(EMPTY_FILTERS);
                }}
              >
                <Text style={styles.filterClearText}>Clear all</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyButton}
                onPress={() => {
                  applyFilters(filters);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.filterApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
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
        <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
        <TouchableOpacity style={styles.filterIcon} onPress={() => setSortModalVisible(true)}>
          <Feather name="sliders" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterIcon} onPress={() => setFilterModalVisible(true)}>
          <Feather name="filter" size={20} color="#fff" />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {renderSortModal()}
      {renderFilterModal()}

      {isLoading ? (
        <LoadingState label="Loading products…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadProducts(search, sortOrder, filters)} />
      ) : products.length === 0 ? (
        <EmptyState message="No Product Found" />
      ) : (
        <ScrollView contentContainerStyle={styles.productList}>
          {products.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
              onRequireLogin={() => navigation.navigate('Login')}
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
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#2CDD0D',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filterModalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1FAC0',
    marginBottom: 16,
  },
  filterSectionLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    marginTop: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#2CDD0D',
    borderColor: '#2CDD0D',
  },
  chipText: {
    color: '#ccc',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
  },
  priceDash: {
    color: '#888',
  },
  inStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  inStockLabel: {
    color: '#F1FAC0',
    fontSize: 14,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 10,
  },
  filterClearButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  filterClearText: {
    color: '#ccc',
    fontWeight: '600',
  },
  filterApplyButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2CDD0D',
    alignItems: 'center',
  },
  filterApplyText: {
    color: '#000',
    fontWeight: '700',
  },
});

export default StoreScreen;
