import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { bottomTabPadding, horizontalPadding } from '../../utils/responsive';
import Screen from '../../components/Screen';
import { getProducts } from '../../services/api';
import type { Product } from '../../types/api';
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton';

import Header from '../../components/home/Header';
import BannerSlider from '../../components/home/BannerSlider';
import Categories from '../../components/home/Categories';
import CouponBanner from '../../components/home/CouponBanner';
import TrendyProducts from '../../components/home/TrendyProducts';
import Deals from '../../components/home/Deals';
import NewArrivals from '../../components/home/NewArrivals';
import TopSearches from '../../components/home/TopSearches';
import SavedPicks from '../../components/home/SavedPicks';
import Features from '../../components/home/Features';
import ProductGridCard from '../../components/home/ProductGridCard';

const PAGE_SIZE = 12;
const INITIAL_SKELETON_ROWS = 4;

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || refreshing || page >= totalPages) return;
    fetchPage(page + 1, true);
  }, [fetchPage, loading, loadingMore, refreshing, page, totalPages]);

  const renderHeader = () => (
    <View>
      <BannerSlider />
      <Categories />
      <CouponBanner />
      <TrendyProducts />
      <Deals />
      <NewArrivals />
      <TopSearches />
      <SavedPicks />
      <Features />

      {/* All Products Section Title */}
      <View style={styles.allHeader}>
        <View style={styles.allHeaderLeft}>
          <View style={styles.sectionBadge}>
            <Feather name="shopping-bag" size={12} color={Colors.primary} />
            <Text style={styles.sectionBadgeText}>EXPLORE ALL</Text>
          </View>
          <Text style={styles.allTitle}>All Products</Text>
          <Text style={styles.allSubtitle}>
            Hand-picked collection with guaranteed low prices
          </Text>
        </View>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.skeletonSection}>
          <Text style={styles.loadingHint}>Loading catalog...</Text>
          {Array.from({ length: INITIAL_SKELETON_ROWS }).map((_, rowIndex) => (
            <View key={`product-skeleton-row-${rowIndex}`} style={styles.column}>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      ) : null}

      {error && products.length === 0 ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={18} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {loadingMore ? (
        <View style={styles.footerSkeletonWrap}>
          <Text style={styles.loadingHint}>Loading more products...</Text>
          <View style={styles.column}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        </View>
      ) : page >= totalPages && products.length > 0 ? (
        <View style={styles.endBadge}>
          <Feather name="check" size={14} color="#059669" />
          <Text style={styles.endText}>{"You've seen all available products"}</Text>
        </View>
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
        onEndReachedThreshold={0.4}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 8,
    backgroundColor: '#F3F6FB',
  },
  column: {
    paddingHorizontal: horizontalPadding - 6,
    gap: 12,
  },
  allHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: horizontalPadding,
    paddingTop: 18,
    paddingBottom: 14,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  allHeaderLeft: {
    flex: 1,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  allTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  allSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 3,
  },
  skeletonSection: {
    backgroundColor: Colors.white,
    paddingTop: 4,
    paddingBottom: 8,
  },
  loadingHint: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: 10,
    fontWeight: '600',
  },
  footerSkeletonWrap: {
    width: '100%',
    paddingBottom: 4,
  },
  errorBox: {
    marginHorizontal: horizontalPadding,
    marginVertical: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingTop: 12,
    alignItems: 'center',
  },
  endBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  endText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  bottomPadding: {
    height: bottomTabPadding,
  },
});