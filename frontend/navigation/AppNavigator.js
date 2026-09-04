import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ProductDetails from '../screens/ProductDetails';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import StoreScreen from '../screens/StoreScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import OrdersScreen from '../screens/OrdersScreen';
import AddressesScreen from '../screens/AddressesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const RootStack = createNativeStackNavigator();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: true, title: 'Product Details' }} />
    </Stack.Navigator>
  );
}

function CartStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout' }} />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ headerShown: true, title: 'Select Address' }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

function StoreStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoreScreen" component={StoreScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: true, title: 'Product Details' }} />
    </Stack.Navigator>
  );
}

function FavoritesStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: true, title: 'Product Details' }} />
    </Stack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: true, title: 'My Orders' }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ headerShown: true, title: 'My Addresses' }} />
    </Stack.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Feather name="home" size={size} color={color} />;
          } else if (route.name === 'Store') {
            return <FontAwesome5 name="store" size={size} color={color} />;
          } else if (route.name === 'Favorites') {
            return <Feather name="heart" size={size} color={color} />;
          } else if (route.name === 'Cart') {
            return <Feather name="shopping-cart" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Feather name="user" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#2CDD0D',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#000000', paddingBottom: 5 },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Store" component={StoreStackScreen} />
      <Tab.Screen name="Favorites" component={FavoritesStackScreen} />
      <Tab.Screen name="Cart" component={CartStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/*
        Login/Register live as siblings of the Tabs screen in one root stack,
        so any nested screen can call navigation.navigate('Login') and have it
        bubble up correctly, while browsing (Home/Store) stays open to guests.
      */}
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={Tabs} />
        <RootStack.Group screenOptions={{ presentation: 'modal', headerShown: true }}>
          <RootStack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
          <RootStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Sign Up' }} />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
