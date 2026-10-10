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
    const initCart = async () => {
      try {
        const stored = await storage.getItem('localCart');
        const localItems: CartItem[] = stored ? JSON.parse(stored) : [];

        if (user) {
          const userItems = user.cart || [];
          if (localItems.length > 0) {
            // Merge guest items with user cart without duplicate product IDs
            const merged = [...userItems];
            for (const loc of localItems) {
              const locId = typeof loc.product === 'string' ? loc.product : loc.product?._id;
              const exists = merged.some((u) => {
                const uId = typeof u.product === 'string' ? u.product : u.product?._id;
                return uId === locId;
              });
              if (!exists) {
                merged.push(loc);
              }
            }
            setCart(merged);
            if (token) {
              await api.syncCart(merged, token).catch(() => {});
            }
            await storage.removeItem('localCart');
          } else {
            setCart(userItems);
          }
        } else {
          setCart(localItems);
        }
      } catch (e) {
        console.error('Failed to init cart', e);
        if (user?.cart) {
          setCart(user.cart);
        }
      }
    };

    initCart();
  }, [user, token]);

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
    if (!product?._id) return;
    const existing = cart.find((item) => {
      const id = typeof item.product === 'string' ? item.product : item.product?._id;
      return id === product._id;
    });

    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((item) => {
        const id = typeof item.product === 'string' ? item.product : item.product?._id;
        return id === product._id
          ? { ...item, quantity: item.quantity + quantity, color: color || item.color }
          : item;
      });
    } else {
      newCart = [...cart, { product, quantity, color }];
    }
    await saveCart(newCart);
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter((item) => {
      const id = typeof item.product === 'string' ? item.product : item.product?._id;
      return id !== productId;
    });
    await saveCart(newCart);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }
    const newCart = cart.map((item) => {
      const id = typeof item.product === 'string' ? item.product : item.product?._id;
      return id === productId ? { ...item, quantity } : item;
    });
    await saveCart(newCart);
  };

  const clearCart = async () => {
    await saveCart([]);
  };

  const cartTotal = cart.reduce((total, item) => {
    if (!item?.product || typeof item.product === 'string') return total;
    const price = Number(item.product.price) || 0;
    const qty = Number(item.quantity) || 1;
    return total + price * qty;
  }, 0);

  const cartCount = cart.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);

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
