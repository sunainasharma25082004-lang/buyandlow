import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import { User, AuthResponse, Product } from '../types/api';
import * as api from '../services/api';


type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: any) => Promise<AuthResponse>;
  register: (data: { name: string; email: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await storage.getItem('token');
      const storedUser = await storage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        api.getProfile(storedToken).then((res) => {
          if (res.success) {
            setUser(res as User);
            storage.setItem('user', JSON.stringify(res));
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: any) => {
    const res = await api.login(data);
    if (!res.success) {
      throw new Error(res.message || 'Login failed');
    }
    if (res.token) {
      setToken(res.token);
      setUser(res as unknown as User);
      await storage.setItem('token', res.token);
      await storage.setItem('user', JSON.stringify(res));
    }
    return res;
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const res = await api.register(data);
    if (!res?.success) {
      throw new Error(res?.message || 'Registration failed');
    }
    if (!res.token) {
      throw new Error('Account created but sign-in failed. Please log in manually.');
    }
    setToken(res.token);
    setUser(res as unknown as User);
    await storage.setItem('token', res.token);
    await storage.setItem('user', JSON.stringify(res));
    return res as AuthResponse;
  };


  const logout = async () => {
    setToken(null);
    setUser(null);
    await storage.removeItem('token');
    await storage.removeItem('user');
  };

  const toggleWishlist = async (productId: string) => {
    if (!user || !token) throw new Error('Please login to add to wishlist');
    
    // Check if user.wishlist exists
    let currentWishlistIds: string[] = [];
    if (user.wishlist) {
      currentWishlistIds = user.wishlist.map((item) => typeof item === 'string' ? item : item._id);
    }

    const isFaved = currentWishlistIds.includes(productId);
    
    // Optimistic UI update
    const newWishlistIds = isFaved
      ? currentWishlistIds.filter(id => id !== productId)
      : [...currentWishlistIds, productId];

    setUser({ ...user, wishlist: newWishlistIds });

    try {
      await api.syncWishlist(newWishlistIds, token);
      const res = await api.getProfile(token);
      if (res.success) {
         setUser(res as User);
         storage.setItem('user', JSON.stringify(res));
      }
    } catch (e) {
      // Revert if API fails
      setUser({ ...user, wishlist: currentWishlistIds });
      throw e;
    }
  };

  const isInWishlist = (productId: string) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some(item => (typeof item === 'string' ? item : item._id) === productId);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, toggleWishlist, isInWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
