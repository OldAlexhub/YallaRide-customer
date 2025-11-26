import React from 'react';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAuth } from '../context/AuthContext';

const AppNavigator = () => {
  const { token, loading } = useAuth();

  console.log('[AppNavigator] render', { loading, hasToken: Boolean(token) });

  if (loading) {
    return null;
  }

  if (!token) {
    return <AuthNavigator />;
  }

  return <MainNavigator />;
};

export default AppNavigator;
