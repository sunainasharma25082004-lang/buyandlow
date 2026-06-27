import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import { CartItem, Product } from '../types/api';
import { useAuth } from './AuthContext';
import * as api from '../services/api';


type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user?.cart) {
      setCart(user.cart);
    } else {
      loadLocalCart();
    }
  }, [user]);

  const loadLocalCart = async () => {
    try {
      const stored = await storage.getItem('localCart');
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const saveCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    if (token) {
      try {
        const syncedCart = await api.syncCart(newCart, token);
        if (Array.isArray(syncedCart)) {
          setCart(syncedCart);
        }
      } catch (e) {
        console.error('Failed to sync cart', e);
      }
    } else {
      await storage.setItem('localCart', JSON.stringify(newCart));
    }
  };

  const addToCart = async (product: Product, quantity = 1, color?: string) => {
    const existing = cart.find(item => 
      (typeof item.product === 'string' ? item.product : item.product._id) === product._id
    );

    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        (typeof item.product === 'string' ? item.product : item.product._id) === product._id
          ? { ...item, quantity: item.quantity + quantity, color: color || item.color }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity, color }];
    }
    await saveCart(newCart);
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter(item => 
      (typeof item.product === 'string' ? item.product : item.product._id) !== productId
    );
    await saveCart(newCart);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      (typeof item.product === 'string' ? item.product : item.product._id) === productId
        ? { ...item, quantity }
        : item
    );
    await saveCart(newCart);
  };

  const clearCart = async () => {
    await saveCart([]);
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = typeof item.product === 'string' ? 0 : item.product.price;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
