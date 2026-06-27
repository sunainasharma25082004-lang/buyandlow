import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';
import { useLanguage } from '../../context/LanguageContext';

export default function CartProducts() {
  const router = useRouter();
  const { cart } = useCart();
  const { t } = useLanguage();

  const products = useMemo(
    () =>
      cart
        .map((item) => (typeof item.product === 'string' ? null : item.product))
        .filter(Boolean) as Product[],
    [cart],
  );

  if (cart.length <= 6) return null;

  return (
    <ProductRail
      title={t('home.inYourCart')}
      subtitle={t('home.inYourCartSub')}
      icon="shopping-cart"
      products={products}
      emptyText={t('home.inYourCartEmpty')}
      onViewAll={products.length > 0 ? () => router.push('/cart') : undefined}
    />
  );
}