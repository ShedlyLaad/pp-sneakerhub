import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as addressesApi from '../services/api/addressesApi';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';

const EMPTY_FORM = { label: '', line1: '', city: '', postalCode: '', country: '' };

// Used both as a standalone "Manage Addresses" profile screen and, via the
// `selectMode` param, as the address picker inside Checkout - selecting an
// address there returns it to the previous screen instead of just editing it.
const AddressesScreen = ({ navigation, route }) => {
  const selectMode = !!route?.params?.selectMode;

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addressesApi.fetchAddresses();
      setAddresses(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormVisible(true);
  };

  const openEdit = (address) => {
    setEditingId(address.id);
    setForm({ label: address.label, line1: address.line1, city: address.city, postalCode: address.postalCode, country: address.country });
    setFormError(null);
    setFormVisible(true);
  };

  const handleSave = async () => {
    if (!form.line1.trim() || !form.city.trim() || !form.country.trim()) {
      setFormError('Address, city and country are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await addressesApi.updateAddress(editingId, form);
        setFormVisible(false);
        await load();
      } else {
        const res = await addressesApi.createAddress(form);
        setFormVisible(false);
        await load();
        // In picker mode, a freshly created address is exactly what the user
        // came here for - hand it straight back instead of making them tap it again.
        if (selectMode) {
          navigation.navigate({
            name: route.params.returnTo || 'Checkout',
            params: { selectedAddress: res.data },
            merge: true,
          });
        }
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (address) => {
    Alert.alert('Delete address', `Remove "${address.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await addressesApi.deleteAddress(address.id);
            await load();
          } catch (err) {
            Alert.alert('Could not delete address', err.message);
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (address) => {
    try {
      await addressesApi.updateAddress(address.id, { isDefault: true });
      await load();
    } catch (err) {
      Alert.alert('Could not update address', err.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState label="Loading your addresses…" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState message={error} onRetry={load} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {addresses.length === 0 ? (
        <EmptyState message="No saved addresses yet." />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              disabled={!selectMode}
              onPress={() => {
                if (selectMode) {
                  navigation.navigate({
                    name: route.params.returnTo || 'Checkout',
                    params: { selectedAddress: item },
                    merge: true,
                  });
                }
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.label}>{item.label}</Text>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.line}>{item.line1}</Text>
              <Text style={styles.line}>
                {item.city}
                {item.postalCode ? `, ${item.postalCode}` : ''} - {item.country}
              </Text>

              {!selectMode && (
                <View style={styles.actions}>
                  {!item.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefault(item)} style={styles.actionButton}>
                      <Text style={styles.actionText}>Set as default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionButton}>
                    <Feather name="edit-2" size={14} color="#F1FAC0" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
                    <Feather name="trash-2" size={14} color="#ff5c5c" />
                    <Text style={[styles.actionText, { color: '#ff5c5c' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={openCreate}>
        <Feather name="plus" size={18} color="#000" />
        <Text style={styles.addButtonText}>Add new address</Text>
      </TouchableOpacity>

      <Modal visible={formVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit address' : 'New address'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Label (e.g. Home, Work)"
              placeholderTextColor="#888"
              value={form.label}
              onChangeText={(v) => setForm((f) => ({ ...f, label: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Address line"
              placeholderTextColor="#888"
              value={form.line1}
              onChangeText={(v) => setForm((f) => ({ ...f, line1: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#888"
              value={form.city}
              onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Postal code"
              placeholderTextColor="#888"
              value={form.postalCode}
              onChangeText={(v) => setForm((f) => ({ ...f, postalCode: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Country"
              placeholderTextColor="#888"
              value={form.country}
              onChangeText={(v) => setForm((f) => ({ ...f, country: v }))}
            />
            {formError && <Text style={styles.formError}>{formError}</Text>}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFormVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000000' },
  list: { paddingBottom: 12 },
  card: { backgroundColor: '#333', borderRadius: 10, padding: 14, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { color: '#F1FAC0', fontSize: 16, fontWeight: '700' },
  defaultBadge: { backgroundColor: '#2CDD0D', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  defaultBadgeText: { color: '#000', fontSize: 10, fontWeight: '700' },
  line: { color: '#ccc', fontSize: 14, marginTop: 2 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: '#F1FAC0', fontSize: 13 },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2CDD0D',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: { color: '#000', fontWeight: '700', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalContainer: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, color: '#F1FAC0', marginBottom: 16, fontWeight: '600' },
  input: { backgroundColor: '#333', borderRadius: 8, padding: 12, marginBottom: 12, color: '#fff' },
  formError: { color: '#ff5c5c', marginBottom: 12, textAlign: 'center' },
  saveButton: { backgroundColor: '#2CDD0D', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  cancelButton: { marginTop: 12, alignItems: 'center' },
  cancelText: { color: '#aaa' },
});

export default AddressesScreen;
