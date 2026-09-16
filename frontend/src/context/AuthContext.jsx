import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('darukaa_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('darukaa_token', data.access_token);
    setToken(data.access_token);
    const userData = await authAPI.getMe();
    setUser(userData);
    return userData;
  };

  const register = async (email, password, fullName) => {
    await authAPI.register(email, password, fullName);
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('darukaa_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
