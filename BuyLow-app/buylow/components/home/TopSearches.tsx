import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import storage from '../../utils/storage';
import { getProducts } from '../../services/api';
import type { Product } from '../../types/api';
import ProductRail from './ProductRail';

export default function TopSearches() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          const stored = await storage.getItem('recent_searches');
          if (!stored) {
            if (active) setProducts([]);
            return;
          }
          const searches: string[] = JSON.parse(stored);
          if (!searches.length) {
            if (active) setProducts([]);
            return;
          }

          const term = searches[0];
          if (active) {
            setSearchTerm(term);
            setLoading(true);
          }

          const res = await getProducts({ keyword: term, limit: 10 });
          if (active) setProducts(res.products || []);
        } catch {
          if (active) setProducts([]);
        } finally {
          if (active) setLoading(false);
        }
      };

      load();
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <ProductRail
      title="Top Searches"
      subtitle={searchTerm ? `Based on "${searchTerm}"` : 'Popular search results'}
      icon="search"
      products={products}
      loading={loading}
      emptyText="Search products in the Search tab — results show here"
    />
  );
}