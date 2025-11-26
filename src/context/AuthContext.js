import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import customerApi from '../api/customerApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const applyToken = (value) => {
    setToken(value);
    global.authToken = value || null;
  };

  const restoreSession = useCallback(async () => {
    // TODO: load token + user from AsyncStorage if desired
    setLoading(false);
  }, []);

  const login = useCallback(async (phone, password) => {
    setLoading(true);
    try {
      const data = await customerApi.login(phone, password);
      if (data?.token) {
        applyToken(data.token);
      }
          if (data?.customer) {
        const customer = data.customer;
        // attach loyalty/discount info (best-effort)
        try {
          const loyaltyRes = await customerApi.getLoyaltyStatus();
              setUser({
                ...customer,
                isFounder: customer.founder,
                loyalty: loyaltyRes.loyalty,
                discountPercent: loyaltyRes.discountPercent,
                totalSaved: loyaltyRes.totalSaved ?? 0,
              });
        } catch (e) {
          setUser({
            ...customer,
            isFounder: customer.founder,
          });
        }
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const data = await customerApi.getLoyaltyStatus();
      // store discountPercent on the user (convenience) and loyalty details
      setUser((prev) =>
        prev
          ? { ...prev, founder: data?.founder, isFounder: data?.founder, loyalty: data?.loyalty, discountPercent: data?.discountPercent, totalSaved: data?.totalSaved ?? 0 }
          : { founder: data?.founder, isFounder: data?.founder, loyalty: data?.loyalty, discountPercent: data?.discountPercent, totalSaved: data?.totalSaved ?? 0 }
      );
      return data;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    applyToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    loading,
    login,
    loadProfile,
    restoreSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
