import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { getProducts } from '../../services/api';
import { Product } from '../../types/api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import ProductGridCard from '../../components/home/ProductGridCard';

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'rating';

export default function CategoryProductsScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { cartCount } = useCart();
  const categoryName = decodeURIComponent(Array.isArray(name) ? name[0] : (name || ''));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const fetchCategoryProducts = useCallback(async () => {
    if (!categoryName) {
      setLoading(false);
      return;
    }
    try {
      const res = await getProducts({ category: categoryName });
      setProducts(res.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [fetchCategoryProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategoryProducts();
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return list;
    }
  }, [products, sortBy]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
          <Text style={styles.itemCountText}>{products.length} {products.length === 1 ? 'item' : 'items'}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={20} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/cart')}
            activeOpacity={0.7}
          >
            <Feather name="shopping-bag" size={20} color={Colors.text} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Chips Bar */}
      {products.length > 0 ? (
        <View style={styles.sortBar}>
          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'default' && styles.sortChipActive]}
            onPress={() => setSortBy('default')}
          >
            <Text style={[styles.sortChipText, sortBy === 'default' && styles.sortChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_asc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_asc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_asc' && styles.sortChipTextActive]}>
              Price: Low to High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'price_desc' && styles.sortChipActive]}
            onPress={() => setSortBy('price_desc')}
          >
            <Text style={[styles.sortChipText, sortBy === 'price_desc' && styles.sortChipTextActive]}>
              Price: High to Low
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortBy === 'rating' && styles.sortChipActive]}
            onPress={() => setSortBy('rating')}
          >
            <Text style={[styles.sortChipText, sortBy === 'rating' && styles.sortChipTextActive]}>
              Rating ★
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cube-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptyText}>{t('categories.noProductsInCategory')}</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Explore Other Categories</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <ProductGridCard product={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  itemCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.accent,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  sortBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  sortChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 28,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  backBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
