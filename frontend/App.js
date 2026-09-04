import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';

// Waits for the stored session token to be validated against the API before
// mounting the rest of the app. Without this gate, CartProvider would run its
// first refreshCart() while isAuthenticated is still momentarily false (even
// for an already-logged-in user), and screens would briefly render as if
// signed out.
function Root() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#2CDD0D" size="large" />
      </View>
    );
  }

  return (
    <CartProvider>
      <FavoritesProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </FavoritesProvider>
    </CartProvider>
  );
}

const styles = {
  splash: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
};

export default function App() {
  return (
    // Makes safe-area insets (status bar height, notch, home indicator)
    // available to every screen via useSafeAreaInsets()/SafeAreaView, so
    // headerless screens (Home, Store, Cart, Favorites, Profile...) can push
    // their content below the status bar instead of rendering under it.
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
