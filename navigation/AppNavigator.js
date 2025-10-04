import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ProductDetails from '../screens/ProductDetails';
import CartScreen from '../screens/CartScreen';
import BoutiqueScreen from '../screens/BoutiqueScreen';
import AddProductScreen from '../screens/AddProductScreen';
import StoreScreen from '../screens/StoreScreen';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ title: 'Product Details' }} />
    </Stack.Navigator>
  );
}

function CartStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
    </Stack.Navigator>
  );
}

function BoutiqueStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BoutiqueScreen" component={BoutiqueScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
    </Stack.Navigator>
  );
}

function StoreStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoreScreen" component={StoreScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ title: 'Product Details' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') {
              return <Feather name="home" size={size} color={color} />;
            } else if (route.name === 'Store') {
              return <FontAwesome5 name="store" size={size} color={color} />;
            } else if (route.name === 'Cart') {
              return <Feather name="shopping-cart" size={size} color={color} />;
            } else if (route.name === 'Boutique') {
              return <EvilIcons name="plus" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: '#2CDD0D',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#000000', paddingBottom: 5 },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Store" component={StoreStackScreen} />
        <Tab.Screen name="Cart" component={CartStackScreen} />
        <Tab.Screen name="Boutique" component={BoutiqueStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
