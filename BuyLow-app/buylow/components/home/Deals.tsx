import React, { useEffect, useState } from 'react';
import { getSaleProducts } from '../../services/api';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';

export default function Deals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSaleProducts(12)
      .then((res) => {
        if (active) setProducts(res.products || []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ProductRail
      title="Top Deals"
      subtitle="Limited time offers"
      icon="tag"
      products={products}
      loading={loading}
      showDiscount
      emptyText="Sale products from admin panel show here"
    />
  );
}