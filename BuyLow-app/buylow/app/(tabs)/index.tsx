import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { bottomTabPadding } from '../../utils/responsive';
import Screen from '../../components/Screen';
import { getProducts } from '../../services/api';
import type { Product } from '../../types/api';
import ProductCardSkeleton from '../../components/ui/ProductCardSkeleton';

import Header from '../../components/home/Header';
import FestiveBentoGrid from '../../components/home/FestiveBentoGrid';
import QuickPicksRail from '../../components/home/QuickPicksRail';
import BannerSlider from '../../components/home/BannerSlider';
import PastelCategoryGrid from '../../components/home/PastelCategoryGrid';
import FeaturedDeals from '../../components/home/FeaturedDeals';
import BestsellerCollage from '../../components/home/BestsellerCollage';
import RecommendedProducts from '../../components/home/RecommendedProducts';
import BestOffers from '../../components/home/BestOffers';
import Features from '../../components/home/Features';
import ProductGridCard from '../../components/home/ProductGridCard';
import FloatingCartBar from '../../components/home/FloatingCartBar';
import { useLanguage } from '../../context/LanguageContext';

const PAGE_SIZE = 20;
const INITIAL_SKELETON_ROWS = 3;

export default function HomeScreen() {
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Responsive 2-column calculation
  const isTablet = width >= 768;
  const numColumns = isTablet ? 3 : 2;
  const containerPadding = 16;
  const cardGap = 12;
  const totalGaps = cardGap * (numColumns - 1);
  const maxWidth = Math.min(width, 1100);
  const availableWidth = maxWidth - (containerPadding * 2) - totalGaps;
  const cardWidth = Math.floor(availableWidth / numColumns);

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await getProducts({ page: pageNum, limit: PAGE_SIZE, sort: 'Newest' });
      setProducts((prev) => {
        if (!append) return res.products || [];
        const existingIds = new Set(prev.map((p) => String(p._id || p.id)));
        const newItems = (res.products || []).filter((p) => {
          const id = String(p._id || p.id);
          return id && !existingIds.has(id);
        });
        return [...prev, ...newItems];
      });
      setPage(pageNum);
      setTotalPages(res.pages || 1);
      setError('');
    } catch (err: any) {
      if (!append) {
        setProducts([]);
        setError(err?.message || 'Could not load products. Please check your connection.');
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
    <View style={styles.headerStack}>
      {/* 1. Festive / Savings Bento Grid (Screenshot 4) */}
      <FestiveBentoGrid />

      {/* 2. Quick Picks Circular Story Avatars (Screenshot 4) */}
      <QuickPicksRail />

      {/* 3. Hero Promotional Carousel */}
      <BannerSlider />

      {/* 4. 4-Column Soft Pastel Category Grid (Screenshots 1 & 2) */}
      <PastelCategoryGrid />

      {/* 5. Top Deals Rail with Instant + ADD */}
      <FeaturedDeals />

      {/* 6. Bestsellers 4-in-1 Collage Showcase (Screenshot 3) */}
      <BestsellerCollage />

      {/* 7. Curated Recommendations */}
      <RecommendedProducts />

      {/* 8. Trust Guarantees & Values */}
      <BestOffers />
      <Features />

      {/* 9. Popular Products Catalog Header */}
      <View style={styles.catalogHeader}>
        <View style={styles.catalogBadge}>
          <Feather name="shopping-bag" size={11} color={Colors.primary} />
          <Text style={styles.catalogBadgeText}>EXPLORE ALL PRODUCTS</Text>
        </View>
        <Text style={styles.catalogTitle}>
          {t('home.trending') || 'Popular Products'}
        </Text>
        <Text style={styles.catalogSubtitle}>
          Complete collection with verified quality and direct mill prices
        </Text>
      </View>

      {/* Skeleton Loading State for Catalog */}
      {loading && products.length === 0 ? (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: INITIAL_SKELETON_ROWS }).map((_, rowIndex) => (
            <View key={`skeleton-row-${rowIndex}`} style={[styles.columnWrapper, { gap: cardGap }]}>
              <View style={{ width: cardWidth }}>
                <ProductCardSkeleton />
              </View>
              <View style={{ width: cardWidth }}>
                <ProductCardSkeleton />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* Error Retry Banner */}
      {error && products.length === 0 ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={20} color="#DC2626" />
          <View style={styles.errorTextWrap}>
            <Text style={styles.errorTitle}>Could not load catalog</Text>
            <Text style={styles.errorSub}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPage(1, false)} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerWrap}>
      {loadingMore ? (
        <View style={styles.footerSkeletonWrap}>
          <Text style={styles.loadingHint}>Loading more products...</Text>
          <View style={[styles.columnWrapper, { gap: cardGap }]}>
            <View style={{ width: cardWidth }}>
              <ProductCardSkeleton />
            </View>
            <View style={{ width: cardWidth }}>
              <ProductCardSkeleton />
            </View>
          </View>
        </View>
      ) : page >= totalPages && products.length > 0 ? (
        <View style={styles.endBadge}>
          <Feather name="check-circle" size={13} color="#059669" />
          <Text style={styles.endBadgeText}>
            You have reached the end of the catalog ({products.length} products)
          </Text>
        </View>
      ) : null}
      <View style={styles.bottomSpacer} />
    </View>
  );

  return (
    <Screen edges={['top', 'left', 'right']}>
      {/* Modern Quick Commerce Elevated Header */}
      <Header />

      {/* Main Continuous Scroll */}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item._id || item.id)}
        numColumns={numColumns}
        key={`home-grid-cols-${numColumns}`}
        columnWrapperStyle={[styles.columnWrapper, { gap: cardGap, paddingHorizontal: containerPadding }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ProductGridCard product={item} />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
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

      {/* Floating Quick Commerce Cart Pill Overlay (Screenshots 1, 2, 4) */}
      <FloatingCartBar />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    backgroundColor: '#F8FAFC',
    paddingBottom: 24,
  },
  headerStack: {
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  catalogHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catalogBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  catalogBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  catalogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  catalogSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  skeletonWrap: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  errorBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorTextWrap: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorSub: {
    fontSize: 11.5,
    color: '#B91C1C',
    marginTop: 1,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.white,
  },
  footerWrap: {
    paddingTop: 8,
    alignItems: 'center',
  },
  footerSkeletonWrap: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingHint: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: '600',
  },
  endBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  endBadgeText: {
    fontSize: 11.5,
    color: '#065F46',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: bottomTabPadding + 40,
  },
});