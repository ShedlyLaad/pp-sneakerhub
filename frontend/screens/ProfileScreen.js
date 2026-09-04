import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { LoginRequired } from '../components/ScreenState';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { favorites } = useFavorites();
  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const insets = useSafeAreaInsets();
  const containerStyle = [styles.container, { paddingTop: insets.top + 24 }];

  if (!isAuthenticated) {
    return (
      <View style={containerStyle}>
        <LoginRequired navigation={navigation} message="Log in to see your profile." />
      </View>
    );
  }

  const openEdit = () => {
    setName(user.name);
    setEditError(null);
    setEditVisible(true);
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setEditError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    setEditError(null);
    const result = await updateProfile({ name: name.trim() });
    setSaving(false);
    if (result.success) {
      setEditVisible(false);
    } else {
      setEditError(result.error);
    }
  };

  return (
    <View style={containerStyle}>
      <View style={styles.avatar}>
        <Feather name="user" size={40} color="#000" />
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <TouchableOpacity style={styles.row} onPress={openEdit}>
        <Feather name="edit-2" size={20} color="#F1FAC0" />
        <Text style={styles.rowText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Orders')}>
        <Feather name="package" size={20} color="#F1FAC0" />
        <Text style={styles.rowText}>My Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Addresses')}>
        <Feather name="map-pin" size={20} color="#F1FAC0" />
        <Text style={styles.rowText}>Manage Addresses</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Favorites')}>
        <Feather name="heart" size={20} color="#F1FAC0" />
        <Text style={styles.rowText}>Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#888" value={name} onChangeText={setName} />
            {editError && <Text style={styles.editError}>{editError}</Text>}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveName} disabled={saving}>
              {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2CDD0D',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    color: '#F1FAC0',
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rowText: {
    color: '#F1FAC0',
    fontSize: 16,
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#2CDD0D',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButton: {
    backgroundColor: '#ff5c5c',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#F1FAC0',
    marginBottom: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#fff',
  },
  editError: {
    color: '#ff5c5c',
    marginBottom: 12,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2CDD0D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#aaa',
  },
});

export default ProfileScreen;
