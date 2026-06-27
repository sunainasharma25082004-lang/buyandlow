import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/api';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';
import { useLanguage } from '../../context/LanguageContext';

export default function NewArrivals() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProducts({ sort: 'Newest', limit: 12 })
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
      title={t('home.newArrivals')}
      subtitle={t('home.newArrivalsSub')}
      icon="zap"
      products={products}
      loading={loading}
      emptyText={t('home.newArrivalsEmpty')}
    />
  );
}