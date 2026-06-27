import React, { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getProduct } from '../../services/api';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';

export default function WishlistProducts() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!user?.wishlist?.length) {
          if (active) {
            setProducts([]);
            setLoading(false);
          }
          return;
        }

        setLoading(true);
        try {
          const resolved: Product[] = [];
          for (const item of user.wishlist) {
            if (typeof item === 'object' && item?._id) {
              resolved.push(item);
            } else if (typeof item === 'string') {
              try {
                const p = await getProduct(item);
                resolved.push(p);
              } catch {
                // skip missing
              }
            }
          }
          if (active) setProducts(resolved);
        } finally {
          if (active) setLoading(false);
        }
      };

      load();
      return () => {
        active = false;
      };
    }, [user?.wishlist]),
  );

  const wishlistCount = user?.wishlist?.length ?? 0;
  if (wishlistCount <= 6) return null;

  return (
    <ProductRail
      title="My Favourites"
      subtitle="Products you saved"
      icon="heart"
      products={products}
      loading={loading}
      emptyText={user ? 'Tap ♥ on products to add favourites' : 'Login to see your favourites'}
      onViewAll={user ? () => router.push('/wishlist') : undefined}
    />
  );
}