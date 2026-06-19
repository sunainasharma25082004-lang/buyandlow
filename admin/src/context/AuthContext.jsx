import React, { createContext, useState, useEffect } from 'react';
import { loginAdmin } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('adminInfo');
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem('adminInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginAdmin(email, password);
    if (data.role !== 'admin') {
      throw new Error('Access denied. Admin credentials required.');
    }
    const adminData = { ...data };
    localStorage.setItem('adminInfo', JSON.stringify(adminData));
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('adminInfo');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};