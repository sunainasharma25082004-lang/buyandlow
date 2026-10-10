import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import RemoteImage from '../../components/RemoteImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import storage from '../../utils/storage';
import { Colors, Shadows } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { formatINR, getDiscountPercent, getProducts, getCategories } from '../../services/api';
import type { Category, Product } from '../../types/api';

const SORT_OPTIONS = [
  { label: 'Popular', value: 'Popular' },
  { label: 'Price: Low to High', value: 'Price: Low to High' },
  { label: 'Price: High to Low', value: 'Price: High to Low' },
  { label: 'Newest', value: 'Newest' },
];

export default function SearchScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [keyword, setKeyword] = useState('');
  const [selectedSort, setSelectedSort] = useState('Popular');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
    }, [])
  );

  useEffect(() => {
    getCategories(true)
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await storage.getItem('recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveRecentSearch = async (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    try {
      const stored = await storage.getItem('recent_searches');
      let recent: string[] = stored ? JSON.parse(stored) : [];
      recent = recent.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      recent.unshift(clean);
      if (recent.length > 8) recent.pop();
      await storage.setItem('recent_searches', JSON.stringify(recent));
      setRecentSearches(recent);
    } catch (e) {
      console.error(e);
    }
  };

  const clearRecentSearches = async () => {
    await storage.removeItem('recent_searches');
    setRecentSearches([]);
  };

  // Perform search
  const performSearch = useCallback(
    (term: string, sortVal: string, catVal: string) => {
      const trimmed = term.trim();
      if (!trimmed && catVal === 'All') {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      getProducts({
        keyword: trimmed || undefined,
        category: catVal !== 'All' ? catVal : undefined,
        sort: sortVal,
        limit: 30,
      })
        .then((res) => {
          setProducts(res.products || []);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    },
    [],
  );

  // Debounced search on input change
  useEffect(() => {
    if (!keyword.trim() && selectedCategory === 'All') {
      setProducts([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(keyword, selectedSort, selectedCategory);
    }, 450);

    return () => clearTimeout(timer);
  }, [keyword, selectedSort, selectedCategory, performSearch]);

  const handleSubmit = () => {
    if (keyword.trim()) {
      saveRecentSearch(keyword);
      performSearch(keyword, selectedSort, selectedCategory);
    }
  };

  const handleSelectRecent = (term: string) => {
    setKeyword(term);
    saveRecentSearch(term);
    performSearch(term, selectedSort, selectedCategory);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      setAddedIds((prev) => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product._id]: false }));
      }, 1600);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search Input Bar */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.inputContainer}>
            <Feather name="search" size={19} color={Colors.primary} style={styles.searchIcon} />
            <TextInput
              placeholder="Search products, brands, essentials..."
              placeholderTextColor={Colors.textLight}
              style={styles.input}
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={handleSubmit}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {keyword.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setKeyword('');
                  setProducts([]);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={19} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters Bar */}
        {(keyword.trim().length > 0 || products.length > 0) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {/* Sort Chips */}
            {SORT_OPTIONS.map((opt) => {
              const active = selectedSort === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedSort(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Category Chips */}
            {categories.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(active ? 'All' : cat.name)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.stateSub}>Searching best prices for you...</Text>
        </View>
      ) : !keyword.trim() && selectedCategory === 'All' ? (
        <ScrollView style={styles.recentContainer} showsVerticalScrollIndicator={false}>
          {recentSearches.length > 0 ? (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <View style={styles.recentTitleWrap}>
                  <Feather name="clock" size={16} color={Colors.primary} />
                  <Text style={styles.recentTitle}>Recent Searches</Text>
                </View>
                <TouchableOpacity onPress={clearRecentSearches} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentTags}>
                {recentSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentTag}
                    onPress={() => handleSelectRecent(term)}
                    activeOpacity={0.75}
                  >
                    <Feather name="search" size={13} color={Colors.textLight} />
                    <Text style={styles.recentTagText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Popular Categories Explore */}
          {categories.length > 0 ? (
            <View style={styles.exploreSection}>
              <Text style={styles.sectionTitle}>Popular Categories</Text>
              <View style={styles.catGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat._id}
                    style={styles.catCard}
                    onPress={() => {
                      setSelectedCategory(cat.name);
                      performSearch('', selectedSort, cat.name);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.catIconWrap}>
                      <RemoteImage uri={cat.image} style={styles.catImage} contentFit="cover" />
                    </View>
                    <Text style={styles.catName} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      ) : products.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons name="search-outline" size={54} color={Colors.border} style={{ marginBottom: 12 }} />
          <Text style={styles.stateTitle}>No products found</Text>
          <Text style={styles.stateSub}>
            We couldn&apos;t find anything for &ldquo;{keyword || selectedCategory}&rdquo;. Try another search keyword or filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                Found <Text style={{ fontWeight: '800', color: Colors.text }}>{products.length}</Text> items
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const discount = getDiscountPercent(item.price, item.oldPrice);
            const isAdded = addedIds[item._id];
            const rating = Number(item.rating) || 4.5;

            return (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => router.push(`/product/${item._id}`)}
                activeOpacity={0.9}
              >
                <View style={styles.imageWrap}>
                  <RemoteImage uri={item.image} style={styles.resultImage} contentFit="contain" />
                  {discount ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>-{discount}%</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.resultBody}>
                  <Text style={styles.resultBrand} numberOfLines={1}>
                    {item.brand || item.category || 'BuyLow'}
                  </Text>
                  <Text style={styles.resultTitle} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <View style={styles.ratingRow}>
                    <View style={styles.starBadge}>
                      <FontAwesome name="star" size={10} color="#F59E0B" />
                      <Text style={styles.ratingVal}>{rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.freeDeliv}>Free Delivery</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <View style={styles.priceCol}>
                      <Text style={styles.resultPrice}>₹{formatINR(item.price)}</Text>
                      {item.oldPrice && item.oldPrice > item.price ? (
                        <Text style={styles.resultOldPrice}>₹{formatINR(item.oldPrice)}</Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
                      onPress={() => handleAddToCart(item)}
                      activeOpacity={0.85}
                    >
                      <Feather name={isAdded ? 'check' : 'shopping-bag'} size={12} color={Colors.white} />
                      <Text style={styles.addBtnText}>{isAdded ? 'Added' : 'Add'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...Shadows.small,
  },
  searchRow: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4FC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#D3E3F5',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  filterScroll: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  recentContainer: {
    flex: 1,
    padding: 16,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  clearText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  recentTagText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  exploreSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catCard: {
    width: '30%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  catIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#EDF5FD',
    marginBottom: 6,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  resultsHeader: {
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  resultsCount: {
    fontSize: 12,
    color: Colors.textLight,
  },
  list: {
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  resultCard: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1EDF8',
    gap: 12,
    ...Shadows.small,
  },
  imageWrap: {
    width: 95,
    height: 105,
    backgroundColor: '#F7FAFD',
    borderRadius: 10,
    padding: 6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  resultBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultBrand: {
    fontSize: 10,
    color: Colors.textLight,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 17,
    marginTop: 2,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#FDE68A',
  },
  ratingVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  freeDeliv: {
    fontSize: 9.5,
    color: '#16A34A',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  resultOldPrice: {
    fontSize: 11,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnSuccess: {
    backgroundColor: Colors.success,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  stateBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  stateSub: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 19,
  },
});