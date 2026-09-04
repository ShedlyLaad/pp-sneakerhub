import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authApi from '../services/api/authApi';
import { getToken, setToken, onUnauthorized } from '../services/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // restoring session on app start
  const [authError, setAuthError] = useState(null);

  // Restore session on app start: if a token is stored, validate it against the API.
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.fetchMe();
        setUser(res.data.user);
      } catch (err) {
        // Token invalid/expired: clear it silently and fall back to logged-out state.
        await setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.login({ email, password });
      await setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.register({ name, email, password });
      await setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    await setToken(null);
    setUser(null);
  }, []);

  // If any authenticated request comes back 401 (session expired, or the
  // account was deleted), sign the user out immediately instead of leaving
  // the app stuck on a screen that keeps failing silently.
  useEffect(() => {
    onUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  const updateProfile = useCallback(async (payload) => {
    try {
      const res = await authApi.updateMe(payload);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      authError,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading, authError, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
