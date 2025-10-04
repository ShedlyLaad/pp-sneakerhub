import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const AddProductScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const handleAddProduct = () => {
    // Logic to add product
    console.log({
      name,
      price,
      image,
      storeName,
      location,
    });

    // Navigate to the Store screen after adding the product
    navigation.navigate('Store');
  };

  return (
    <LinearGradient
      colors={['#000000', '#000000']}
      style={styles.container}
    >
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
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#888"
        value={price}
        onChangeText={(text) => setPrice(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Store Name"
        placeholderTextColor="#888"
        value={storeName}
        onChangeText={(text) => setStoreName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor="#888"
        value={location}
        onChangeText={(text) => setLocation(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
        <LinearGradient colors={['#00ff00', '#004800']} style={styles.button}>
          <Text style={styles.buttonText}>Add Product</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default AddProductScreen;
