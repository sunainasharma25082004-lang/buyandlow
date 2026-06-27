import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/api';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';
import { useLanguage } from '../../context/LanguageContext';

export default function TrendyProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getProducts({ sort: 'Popular', limit: 12 })
      .then((res) => {
        if (active) {
          setProducts(res.products || []);
          setError('');
        }
      })
      .catch((err: Error) => {
        if (active) {
          setProducts([]);
          setError(err.message);
        }
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
      title={t('home.trending')}
      subtitle={t('home.trendingSub')}
      icon="trending-up"
      products={products}
      loading={loading}
      emptyText={error || t('home.trendingEmpty')}
    />
  );
}