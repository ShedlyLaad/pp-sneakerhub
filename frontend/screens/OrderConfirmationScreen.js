import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.iconCircle}>
        <Feather name="check" size={40} color="#000" />
      </View>
      <Text style={styles.title}>Order Confirmed</Text>
      <Text style={styles.subtitle}>Thank you! Your order has been placed successfully.</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Order #</Text>
          <Text style={styles.rowValue}>{order._id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Date</Text>
          <Text style={styles.rowValue}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total</Text>
          <Text style={styles.rowValue}>${order.total.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Payment</Text>
          <Text style={styles.rowValue}>Cash on delivery</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <Text style={[styles.rowValue, styles.status]}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Profile', { screen: 'Orders' })}
      >
        <Text style={styles.primaryButtonText}>View My Orders</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Continue shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', alignItems: 'center', padding: 24 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2CDD0D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#F1FAC0', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 30 },
  card: { width: '100%', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 18, marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  rowLabel: { color: '#888', fontSize: 14 },
  rowValue: { color: '#F1FAC0', fontSize: 14, fontWeight: '600' },
  status: { color: '#F1C40F' },
  primaryButton: { backgroundColor: '#2CDD0D', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  secondaryButton: { padding: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#aaa', fontSize: 14 },
});

export default OrderConfirmationScreen;
