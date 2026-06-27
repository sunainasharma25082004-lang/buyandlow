import React, { useCallback, useMemo, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getProduct } from '../../services/api';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';
import { useLanguage } from '../../context/LanguageContext';

const MIN_ITEMS = 6;

export default function SavedPicks() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart } = useCart();
  const { t } = useLanguage();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const cartProducts = useMemo(
    () =>
      cart
        .map((item) => (typeof item.product === 'string' ? null : item.product))
        .filter(Boolean) as Product[],
    [cart],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!user?.wishlist?.length) {
          if (active) {
            setWishlistProducts([]);
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
                resolved.push(await getProduct(item));
              } catch {
                // skip missing product
              }
            }
          }
          if (active) setWishlistProducts(resolved);
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

  const combined = useMemo(() => {
    const map = new Map<string, Product>();
    wishlistProducts.forEach((p) => map.set(p._id, p));
    cartProducts.forEach((p) => map.set(p._id, p));
    return Array.from(map.values());
  }, [wishlistProducts, cartProducts]);

  if (!loading && combined.length <= MIN_ITEMS) return null;

  const hasFavourites = wishlistProducts.length > 0;
  const hasCart = cartProducts.length > 0;
  const subtitle = hasFavourites && hasCart
    ? t('home.yourPicksFromBoth')
    : hasFavourites
      ? t('home.myFavouritesSub')
      : t('home.yourPicksCart');

  return (
    <ProductRail
      title={t('home.yourPicks')}
      subtitle={subtitle}
      icon="heart"
      products={combined}
      loading={loading}
      emptyText={t('home.yourPicksEmpty')}
      onViewAll={() => router.push(hasFavourites ? '/wishlist' : '/cart')}
      showDiscount
    />
  );
}