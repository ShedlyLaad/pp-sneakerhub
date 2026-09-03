import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/ScreenState';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <EmptyState message="Log in to see your profile." />
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Feather name="user" size={40} color="#000" />
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Orders')}>
        <Feather name="package" size={20} color="#F1FAC0" />
        <Text style={styles.rowText}>My Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
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
});

export default ProfileScreen;
