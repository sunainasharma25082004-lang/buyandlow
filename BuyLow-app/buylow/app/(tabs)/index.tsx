import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { bottomTabPadding, horizontalPadding } from '../../utils/responsive';
import Screen from '../../components/Screen';
import { getProducts } from '../../services/api';
import type { Product } from '../../types/api';

import Header from '../../components/home/Header';
import BannerSlider from '../../components/home/BannerSlider';
import Categories from '../../components/home/Categories';
import TrendyProducts from '../../components/home/TrendyProducts';
import Deals from '../../components/home/Deals';
import NewArrivals from '../../components/home/NewArrivals';
import TopSearches from '../../components/home/TopSearches';
import SavedPicks from '../../components/home/SavedPicks';
import ProductGridCard from '../../components/home/ProductGridCard';

const PAGE_SIZE = 12;

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await getProducts({ page: pageNum, limit: PAGE_SIZE, sort: 'Newest' });
      setProducts((prev) => (append ? [...prev, ...(res.products || [])] : res.products || []));
      setPage(pageNum);
      setTotalPages(res.pages || 1);
      setError('');
    } catch (err: any) {
      if (!append) {
        setProducts([]);
        setError(err?.message || 'Could not load products');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || page >= totalPages) return;
    fetchPage(page + 1, true);
  }, [fetchPage, loading, loadingMore, page, totalPages]);

  const renderHeader = () => (
    <View>
      <BannerSlider />
      <Categories />
      <TrendyProducts />
      <Deals />
      <NewArrivals />
      <TopSearches />
      <SavedPicks />

      <View style={styles.allHeader}>
        <Text style={styles.allTitle}>All Products</Text>
        <Text style={styles.allSubtitle}>Scroll karo — aur products load hote jayenge</Text>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : null}

      {error && products.length === 0 ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {loadingMore ? (
        <ActivityIndicator color={Colors.primary} style={styles.footerLoader} />
      ) : page >= totalPages && products.length > 0 ? (
        <Text style={styles.endText}>Saare products load ho gaye</Text>
      ) : null}
      <View style={styles.bottomPadding} />
    </View>
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      <Header />
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => <ProductGridCard product={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  column: {
    paddingHorizontal: horizontalPadding - 6,
    gap: 12,
  },
  allHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: horizontalPadding,
    paddingTop: 18,
    paddingBottom: 12,
    marginTop: 6,
  },
  allTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  allSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  initialLoader: {
    paddingVertical: 40,
    backgroundColor: Colors.white,
  },
  errorBox: {
    marginHorizontal: horizontalPadding,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    paddingTop: 8,
    alignItems: 'center',
  },
  footerLoader: {
    marginVertical: 16,
  },
  endText: {
    fontSize: 12,
    color: Colors.textLight,
    marginVertical: 16,
  },
  bottomPadding: {
    height: bottomTabPadding,
  },
});