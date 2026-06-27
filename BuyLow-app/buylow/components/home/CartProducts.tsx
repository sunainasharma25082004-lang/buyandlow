import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';

export default function CartProducts() {
  const router = useRouter();
  const { cart } = useCart();

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
      title="In Your Cart"
      subtitle="Ready to checkout"
      icon="shopping-cart"
      products={products}
      emptyText="Add products to cart — they will show here"
      onViewAll={products.length > 0 ? () => router.push('/cart') : undefined}
    />
  );
}