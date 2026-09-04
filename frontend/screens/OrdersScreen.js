import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoadingState, ErrorState, EmptyState, LoginRequired } from '../components/ScreenState';
import * as ordersApi from '../services/api/ordersApi';

const STATUS_COLORS = {
  pending: '#F1C40F',
  confirmed: '#2CDD0D',
  shipped: '#3498DB',
  delivered: '#2ECC71',
  cancelled: '#E74C3C',
};

const OrdersScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersApi.fetchMyOrders();
      setOrders(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadOrders();
    else setIsLoading(false);
  }, [isAuthenticated, loadOrders]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LoginRequired navigation={navigation} message="Log in to see your orders." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading your orders…" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={loadOrders} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <EmptyState message="You haven't placed any orders yet." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={[styles.status, { color: STATUS_COLORS[item.status] || '#fff' }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              {item.items.map((line, idx) => (
                <Text key={idx} style={styles.orderLine}>
                  {line.quantity} × {line.name}
                </Text>
              ))}
              <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
            </View>
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
  list: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDate: {
    color: '#aaa',
  },
  status: {
    fontWeight: '700',
  },
  orderLine: {
    color: '#F1FAC0',
    marginBottom: 2,
  },
  orderTotal: {
    color: '#2CDD0D',
    fontWeight: '700',
    marginTop: 8,
  },
});

export default OrdersScreen;
