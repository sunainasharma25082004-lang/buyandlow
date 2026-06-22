import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import API_URL from '../config/api';

export const CartContext = createContext();

const getProductId = (item) => {
  if (!item) return null;
  if (typeof item === 'string' || typeof item === 'number') return item;
  return item._id || item.id || null;
};

const sameProductId = (a, b) => {
  const idA = getProductId(a);
  const idB = getProductId(b);
  if (idA == null || idB == null) return false;
  return String(idA) === String(idB);
};

const isProductObject = (item) => item && typeof item === 'object' && (item.name || item.image);

const mergeWishlistProducts = (localList, dbList) => {
  const merged = [...(localList || []).filter(isProductObject)];

  (dbList || []).forEach((item) => {
    const id = getProductId(item);
    if (!id) return;
    const exists = merged.some((m) => sameProductId(m, id));
    if (!exists) {
      merged.push(isProductObject(item) ? item : { _id: id });
    } else if (isProductObject(item)) {
      const idx = merged.findIndex((m) => sameProductId(m, id));
      if (idx > -1 && !isProductObject(merged[idx])) {
        merged[idx] = item;
      }
    }
  });

  return merged;
};

const readLocalWishlist = () => {
  try {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const wishlistHydratedRef = useRef(false);
  const cartMergedRef = useRef(false);
  const wishlistRef = useRef(wishlist);

  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  useEffect(() => {
    const localCart = localStorage.getItem('cart');
    const localWishlist = localStorage.getItem('wishlist');

    if (localCart) {
      try {
        setCartItems(JSON.parse(localCart));
      } catch (e) {
        console.error('Failed to parse local cart');
      }
    }
    if (localWishlist) {
      try {
        setWishlist(JSON.parse(localWishlist));
      } catch (e) {
        console.error('Failed to parse local wishlist');
      }
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (!user) {
      wishlistHydratedRef.current = false;
      cartMergedRef.current = false;
    }
  }, [user]);

  const syncWishlistToServer = useCallback(async (list) => {
    const ids = list.map(getProductId).filter(Boolean);
    const res = await axios.put(`${API_URL}/auth/wishlist`, { wishlist: ids });
    if (Array.isArray(res.data) && res.data.length && isProductObject(res.data[0])) {
      return mergeWishlistProducts(list, res.data);
    }
    return list;
  }, []);

  useEffect(() => {
    if (!user || isInitializing || wishlistHydratedRef.current) return;

    const hydrateWishlist = async () => {
      const localList = readLocalWishlist();
      const merged = mergeWishlistProducts(
        mergeWishlistProducts(localList, wishlistRef.current),
        user.wishlist || []
      );

      try {
        if (merged.length > 0) {
          const synced = await syncWishlistToServer(merged);
          setWishlist(synced);
        } else if (user.wishlist?.length) {
          setWishlist(mergeWishlistProducts([], user.wishlist));
        }
        localStorage.removeItem('wishlist');
      } catch (err) {
        console.error('Failed to hydrate wishlist:', err);
        if (merged.length > 0) {
          setWishlist(merged);
        }
      } finally {
        wishlistHydratedRef.current = true;
      }
    };

    hydrateWishlist();
  }, [user?._id, isInitializing, syncWishlistToServer]);

  useEffect(() => {
    if (!user || isInitializing || cartMergedRef.current) return;

    const mergeCartOnLogin = async () => {
      cartMergedRef.current = true;

      try {
        const dbCart = user.cart || [];
        const localCart = [...cartItems];
        let merged = [...dbCart];

        localCart.forEach((localItem) => {
          const dbIndex = merged.findIndex(
            (dbItem) =>
              sameProductId(dbItem.product, localItem.product) &&
              dbItem.color === localItem.color
          );

          if (dbIndex > -1) {
            merged[dbIndex].quantity += localItem.quantity;
          } else {
            merged.push({
              product: getProductId(localItem.product),
              quantity: localItem.quantity,
              color: localItem.color,
            });
          }
        });

        const formattedCart = merged.map((item) => ({
          product: getProductId(item.product),
          quantity: item.quantity,
          color: item.color,
        }));

        const res = await axios.put(`${API_URL}/auth/cart`, { cart: formattedCart });
        setCartItems(res.data);
        localStorage.removeItem('cart');
      } catch (err) {
        console.error('Failed to merge cart on login:', err);
      }
    };

    mergeCartOnLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, isInitializing]);

  useEffect(() => {
    if (isInitializing) return;

    if (user) {
      const syncCartToDB = async () => {
        try {
          const formattedCart = cartItems.map((item) => ({
            product: getProductId(item.product),
            quantity: item.quantity,
            color: item.color,
          }));
          await axios.put(`${API_URL}/auth/cart`, { cart: formattedCart });
        } catch (err) {
          console.error('Failed to sync cart to database:', err);
        }
      };

      const delay = setTimeout(syncCartToDB, 500);
      return () => clearTimeout(delay);
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems, user, isInitializing]);

  useEffect(() => {
    if (isInitializing) return;

    if (user) {
      if (!wishlistHydratedRef.current) return;

      const syncWish = async () => {
        try {
          await syncWishlistToServer(wishlist);
        } catch (err) {
          console.error('Failed to sync wishlist to database:', err);
        }
      };

      const delay = setTimeout(syncWish, 500);
      return () => clearTimeout(delay);
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist, user, isInitializing, syncWishlistToServer]);

  const addToCart = (product, quantity = 1, color = '') => {
    const prodId = getProductId(product);
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => sameProductId(item.product, prodId) && item.color === color
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }
      return [...prevItems, { product, quantity, color }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId, color = '') => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(sameProductId(item.product, productId) && item.color === color)
      )
    );
  };

  const updateCartQuantity = (productId, color = '', quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        sameProductId(item.product, productId) && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const toggleWishlist = (product) => {
    const prodId = getProductId(product);
    if (!prodId) return;

    setWishlist((prev) => {
      const exists = prev.some((item) => sameProductId(item, prodId));
      if (exists) {
        return prev.filter((item) => !sameProductId(item, prodId));
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => !sameProductId(item, productId)));
  };

  const isWishlisted = (productId) =>
    wishlist.some((item) => sameProductId(item, productId));

  const getCartTotal = () =>
    cartItems.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0);

  const getCartCount = () =>
    cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const getWishlistCount = () => wishlist.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlist,
        cartOpen,
        authModalOpen,
        setCartOpen,
        setAuthModalOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
        getCartTotal,
        getCartCount,
        getWishlistCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};