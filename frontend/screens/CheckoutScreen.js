import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import * as addressesApi from '../services/api/addressesApi';
import * as ordersApi from '../services/api/ordersApi';
import { LoadingState, ErrorState } from '../components/ScreenState';

const STEPS = ['Address', 'Summary', 'Payment'];

// Three-step checkout, all inside one screen so the shipping address and
// order summary the user already reviewed stay on screen instead of
// disappearing behind separate navigator pushes. Ends by creating a real
// order against the backend and handing off to OrderConfirmation.
const CheckoutScreen = ({ navigation, route }) => {
  const { cart, refreshCart } = useCart();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState(null);

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    setAddressError(null);
    try {
      const res = await addressesApi.fetchAddresses();
      setAddresses(res.data);
      setSelectedAddress((prev) => prev || res.data.find((a) => a.isDefault) || res.data[0] || null);
    } catch (err) {
      setAddressError(err.message);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // AddressesScreen (in picker mode) hands the chosen/created address back here.
  useEffect(() => {
    if (route.params?.selectedAddress) {
      setSelectedAddress(route.params.selectedAddress);
      navigation.setParams({ selectedAddress: undefined });
    }
  }, [route.params?.selectedAddress, navigation]);

  const goToAddressPicker = () => {
    navigation.navigate('Addresses', { selectMode: true, returnTo: 'Checkout' });
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await ordersApi.createOrder({ addressId: selectedAddress.id });
      await refreshCart();
      navigation.replace('OrderConfirmation', { order: res.data });
    } catch (err) {
      setPlaceError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <ErrorState message="Your cart is empty." onRetry={() => navigation.navigate('CartScreen')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepper}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepDotText, i <= step && styles.stepDotTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {step === 0 && (
          <View>
            <Text style={styles.sectionTitle}>Shipping address</Text>
            {loadingAddresses ? (
              <LoadingState label="Loading addresses…" />
            ) : addressError ? (
              <ErrorState message={addressError} onRetry={loadAddresses} />
            ) : selectedAddress ? (
              <View style={styles.addressCard}>
                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                <Text style={styles.addressLine}>{selectedAddress.line1}</Text>
                <Text style={styles.addressLine}>
                  {selectedAddress.city}
                  {selectedAddress.postalCode ? `, ${selectedAddress.postalCode}` : ''} - {selectedAddress.country}
                </Text>
              </View>
            ) : (
              <Text style={styles.helperText}>No saved address yet. Add one to continue.</Text>
            )}
            <TouchableOpacity style={styles.secondaryButton} onPress={goToAddressPicker}>
              <Feather name={addresses.length ? 'edit-2' : 'plus'} size={16} color="#F1FAC0" />
              <Text style={styles.secondaryButtonText}>
                {addresses.length ? 'Change address' : 'Add address'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Order summary</Text>
            {cart.items.map((item) => (
              <View key={item.product.id} style={styles.summaryRow}>
                {item.product.image ? (
                  <Image source={{ uri: item.product.image }} style={styles.summaryImage} />
                ) : (
                  <View style={[styles.summaryImage, styles.summaryImagePlaceholder]}>
                    <Feather name="image" size={16} color="#666" />
                  </View>
                )}
                <View style={styles.summaryDetails}>
                  <Text style={styles.summaryName} numberOfLines={1}>{item.product.name}</Text>
                  <Text style={styles.summaryQty}>Qty {item.quantity} × ${item.product.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.summaryLineTotal}>${item.lineTotal.toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>${cart.total.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Shipping</Text>
              <Text style={styles.totalsValue}>Free</Text>
            </View>
            <View style={[styles.totalsRow, styles.totalsRowFinal]}>
              <Text style={styles.totalsLabelFinal}>Total</Text>
              <Text style={styles.totalsValueFinal}>${cart.total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.paymentOption}>
              <Feather name="check-circle" size={20} color="#2CDD0D" />
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>Cash on delivery</Text>
                <Text style={styles.paymentSubtitle}>Pay in cash when your order arrives or in store.</Text>
              </View>
            </View>
            <Text style={styles.helperText}>Card payment is not available yet.</Text>
            {placeError && <Text style={styles.errorText}>{placeError}</Text>}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.footerBackButton} onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.footerBackText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.footerNextButton, !selectedAddress && step === 0 && styles.footerNextButtonDisabled]}
            disabled={!selectedAddress && step === 0}
            onPress={() => setStep((s) => s + 1)}
          >
            <Text style={styles.footerNextText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.footerNextButton} onPress={handlePlaceOrder} disabled={placing}>
            {placing ? <ActivityIndicator color="#000" /> : <Text style={styles.footerNextText}>Place order</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  stepper: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 16, paddingBottom: 8 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: '#2CDD0D' },
  stepDotText: { color: '#888', fontWeight: '700', fontSize: 12 },
  stepDotTextActive: { color: '#000' },
  stepLabel: { color: '#888', fontSize: 12 },
  stepLabelActive: { color: '#F1FAC0', fontWeight: '600' },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  sectionTitle: { color: '#F1FAC0', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  addressCard: { backgroundColor: '#333', borderRadius: 10, padding: 14 },
  addressLabel: { color: '#F1FAC0', fontWeight: '700', marginBottom: 4 },
  addressLine: { color: '#ccc', fontSize: 14, marginTop: 2 },
  helperText: { color: '#888', fontSize: 13, marginTop: 12 },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  secondaryButtonText: { color: '#F1FAC0', fontSize: 14, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  summaryImage: { width: 44, height: 44, borderRadius: 8 },
  summaryImagePlaceholder: { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  summaryDetails: { flex: 1, marginLeft: 10 },
  summaryName: { color: '#F1FAC0', fontSize: 14 },
  summaryQty: { color: '#888', fontSize: 12, marginTop: 2 },
  summaryLineTotal: { color: '#2CDD0D', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 10 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalsRowFinal: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  totalsLabel: { color: '#888', fontSize: 14 },
  totalsValue: { color: '#ccc', fontSize: 14 },
  totalsLabelFinal: { color: '#F1FAC0', fontSize: 18, fontWeight: '700' },
  totalsValueFinal: { color: '#2CDD0D', fontSize: 18, fontWeight: '700' },
  paymentOption: { flexDirection: 'row', backgroundColor: '#333', borderRadius: 10, padding: 14, alignItems: 'center' },
  paymentDetails: { marginLeft: 12, flex: 1 },
  paymentTitle: { color: '#F1FAC0', fontSize: 15, fontWeight: '700' },
  paymentSubtitle: { color: '#888', fontSize: 12, marginTop: 2 },
  errorText: { color: '#ff5c5c', marginTop: 14, textAlign: 'center' },
  footer: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#222' },
  footerBackButton: { paddingVertical: 15, paddingHorizontal: 20 },
  footerBackText: { color: '#aaa', fontSize: 16 },
  footerNextButton: { flex: 1, backgroundColor: '#2CDD0D', padding: 15, borderRadius: 8, alignItems: 'center' },
  footerNextButtonDisabled: { opacity: 0.4 },
  footerNextText: { color: '#000', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
