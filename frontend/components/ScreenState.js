import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

// Shared loading / error / empty placeholder used across data-driven screens,
// so every screen presents these states the same way.
export function LoadingState({ label = 'Loading…' }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2CDD0D" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{message || 'Something went wrong.'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyState({ message }) {
  return (
    <View style={styles.center}>
      <Text style={styles.label}>{message}</Text>
    </View>
  );
}

// Shown whenever a guest attempts an action that requires an account
// (favorites, cart, checkout, orders, profile) - consistent wording and a
// direct path to Login, per the "protected action" rule in the app spec.
export function LoginRequired({ navigation, message = 'Please login to continue.' }) {
  return (
    <View style={styles.center}>
      <Text style={styles.label}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.retryText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  label: {
    color: '#F1FAC0',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff5c5c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2CDD0D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: '600',
  },
});
