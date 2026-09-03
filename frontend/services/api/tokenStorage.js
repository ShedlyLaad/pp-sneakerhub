// Native (iOS/Android) token storage, backed by the OS Keychain/Keystore.
// Metro picks tokenStorage.web.js instead of this file when bundling for web,
// since expo-secure-store has no native module to back it in a browser.
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'snaekershub_auth_token';

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (err) {
    console.warn('[api] Failed to read token from SecureStore', err);
    return null;
  }
}

export async function setToken(token) {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('[api] Failed to persist token in SecureStore', err);
  }
}
