import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import { getCategories } from '../../services/api';
import RemoteImage from '../../components/RemoteImage';
import { PLACEHOLDER_CATEGORY } from '../../constants/images';
import type { Category } from '../../types/api';
import CustomHeader from '../../components/CustomHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Responsive column & width calculation
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  const containerPadding = 16;
  const cardGap = 14;
  const totalGaps = cardGap * (numColumns - 1);
  const maxWidthContainer = Math.min(width, 1100);
  const availableWidth = maxWidthContainer - (containerPadding * 2) - totalGaps;
  const cardWidth = Math.floor(availableWidth / numColumns);
  const cardHeight = 208;

  const fetchCategories = useCallback(async () => {
    try {
      setError('');
      const res = await getCategories(false);
      const list = (res.categories || []).filter((c) => c.isActive !== false);
      setCategories(list);
    } catch (err: any) {
      setCategories([]);
      setError(err?.message || t('categories.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories();
  }, [fetchCategories]);

  const getLabel = (cat: Category) => cat.title || cat.displayName || cat.name;

  const totalProductsInCatalog = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  }, [categories]);

  // Render Category Card with strict equal width & height
  const renderCategoryCard = ({ item }: { item: Category }) => {
    const label = getLabel(item);
    const subcategoriesList = Array.isArray(item.subcategories) ? item.subcategories : [];
    const subSnippet = subcategoriesList.slice(0, 2).join(' • ');

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth, height: cardHeight }]}
        onPress={() => router.push(`/category/${encodeURIComponent(item.name)}`)}
        activeOpacity={0.84}
      >
        {/* Well-proportioned image showcase */}
        <View style={styles.imageWrap}>
          <RemoteImage
            uri={item.image}
            style={styles.cardImage}
            fallback={PLACEHOLDER_CATEGORY}
            contentFit="contain"
          />
        </View>

        {/* Category Details */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {label}
          </Text>

          <Text style={styles.cardCount}>
            {item.productCount ? `${item.productCount} Products` : 'Explore Collection'}
          </Text>

          {subSnippet ? (
            <Text style={styles.cardSubcategories} numberOfLines={1}>
              {subSnippet}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Shimmer Skeleton Grid
  const renderSkeletonGrid = () => (
    <View style={[styles.gridWrap, { paddingHorizontal: containerPadding }]}>
      {Array.from({ length: numColumns * 2 }).map((_, i) => (
        <View
          key={`skeleton-cat-${i}`}
          style={[styles.skeletonCard, { width: cardWidth, height: cardHeight }]}
        >
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLineTiny} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader />

      {/* Premium Page Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{t('categories.allCategories')}</Text>
            <Text style={styles.subtitle}>{t('categories.browseAdmin')}</Text>
          </View>

          {!loading && categories.length > 0 ? (
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {categories.length} Categories
              </Text>
            </View>
          ) : null}
        </View>

        {/* Quick Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.82}
        >
          <Feather name="search" size={16} color="#64748B" />
          <Text style={styles.searchPlaceholder}>Search products in all categories...</Text>
          <View style={styles.searchAction}>
            <Feather name="arrow-right" size={13} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {loading && !refreshing ? (
        renderSkeletonGrid()
      ) : error && categories.length === 0 ? (
        <View style={styles.stateBox}>
          <View style={styles.errorIconCircle}>
            <Feather name="alert-circle" size={32} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Could not load categories</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCategories} activeOpacity={0.8}>
            <Feather name="refresh-cw" size={14} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry Loading</Text>
          </TouchableOpacity>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.stateBox}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="grid-outline" size={36} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>{t('categories.noCategoriesYet')}</Text>
          <Text style={styles.stateText}>{t('categories.adminHint')}</Text>
          <TouchableOpacity
            style={styles.browseAllBtn}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.browseAllBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item._id || item.name)}
          renderItem={renderCategoryCard}
          numColumns={numColumns}
          key={`categories-grid-cols-${numColumns}`}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: containerPadding, gap: cardGap },
          ]}
          columnWrapperStyle={numColumns > 1 ? [styles.columnWrapper, { gap: cardGap }] : undefined}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListFooterComponent={
            <View style={styles.listFooter}>
              <View style={styles.footerBadge}>
                <Feather name="shield" size={12} color="#059669" />
                <Text style={styles.footerBadgeText}>
                  {totalProductsInCatalog} verified products across {categories.length} categories
                </Text>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...Shadows.small,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  metaBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    fontWeight: '500',
  },
  searchAction: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 36,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
    elevation: 2,
  },
  imageWrap: {
    width: '100%',
    height: 124,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
    justifyContent: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  cardCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 3,
  },
  cardSubcategories: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 14,
  },
  skeletonCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: 124,
    backgroundColor: '#E2E8F0',
  },
  skeletonBody: {
    padding: 12,
    gap: 8,
  },
  skeletonLineShort: {
    width: '75%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  skeletonLineTiny: {
    width: '45%',
    height: 11,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
  },
  stateText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  retryBtnText: {
    color: Colors.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
  browseAllBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  browseAllBtnText: {
    color: Colors.white,
    fontSize: 13.5,
    fontWeight: '700',
  },
  listFooter: {
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  footerBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#065F46',
  },
});