import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as productsApi from '../services/api/productsApi';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/ScreenState';

const AddProductScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <EmptyState message="Log in to add a product." />
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission to access photos was denied.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    if (!name.trim() || !price) {
      setError('Product name and price are required.');
      return;
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setError('Price must be a valid positive number.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await productsApi.createProduct({
        name: name.trim(),
        price: numericPrice,
        description: description.trim(),
        image,
        storeLocation: storeName.trim(),
      });
      navigation.navigate('Store');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#000000']} style={styles.container}>
      <Text style={styles.title}>Add Product</Text>
      <Text style={styles.subtitle}>Enter the details of your product.</Text>
      <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
        {image ? <Image source={{ uri: image }} style={styles.photo} /> : <Text style={styles.photoButtonText}>Add Photo</Text>}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#888"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Store Name"
        placeholderTextColor="#888"
        value={storeName}
        onChangeText={setStoreName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleAddProduct} disabled={submitting}>
        <LinearGradient colors={['#00ff00', '#004800']} style={styles.buttonGradient}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Product</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 32,
    marginBottom: 10,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#888',
  },
  photoButton: {
    width: 100,
    height: 100,
    backgroundColor: '#333333',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoButtonText: {
    color: '#888',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 5,
    backgroundColor: '#333333',
    color: '#ddd',
  },
  errorText: {
    color: '#ff5c5c',
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    borderRadius: 5,
    width: '100%',
  },
  buttonGradient: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default AddProductScreen;
