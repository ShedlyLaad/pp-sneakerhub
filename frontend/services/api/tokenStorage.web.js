// Web token storage. expo-secure-store has no browser implementation
// (there is no OS Keychain/Keystore to back it), so on web we fall back to
// localStorage. This is only used when running `expo start --web`; the real
// mobile app (Expo Go / native build) uses tokenStorage.js instead.
const TOKEN_KEY = 'snaekershub_auth_token';

export async function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.warn('[api] Failed to read token from localStorage', err);
    return null;
  }
}

export async function setToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('[api] Failed to persist token in localStorage', err);
  }
}
