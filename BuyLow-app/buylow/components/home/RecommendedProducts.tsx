import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { getProducts, formatINR, getDiscountPercent } from '../../services/api';
import type { Product } from '../../types/api';
import RemoteImage from '../RemoteImage';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function RecommendedProducts() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProducts({ sort: 'Best Rating', limit: 8 })
      .then((res) => {
        if (!active) return;
        setProducts(res.products || []);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  const handleAdd = async (product: Product) => {
    try {
      await addToCart(product, 1);
      setAddedId(product._id);
      setTimeout(() => setAddedId(null), 1500);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <Ionicons name="sparkles" size={12} color="#D97706" />
            <Text style={styles.badgeText}>FEATURED PICKS</Text>
          </View>
          <Text style={styles.title}>Curated Recommendations</Text>
          <Text style={styles.subtitle}>Handpicked selections from our verified catalog</Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Feather name="chevron-right" size={13} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.loadingText}>Finding best recommendations...</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {products.map((item) => {
            const isWish = isInWishlist(item._id);
            const discount = getDiscountPercent(item.price, item.oldPrice);
            const isAdded = addedId === item._id;

            return (
              <TouchableOpacity
                key={`rec-${item._id}`}
                style={styles.card}
                onPress={() => router.push(`/product/${item._id}`)}
                activeOpacity={0.9}
              >
                <View style={styles.imageWrap}>
                  <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
                  {discount ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{discount}%</Text>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={styles.wishBtn}
                    onPress={() => toggleWishlist(item._id)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={isWish ? 'heart' : 'heart-outline'}
                      size={15}
                      color={isWish ? '#EF4444' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.body}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

                  <View style={styles.ratingRow}>
                    <View style={styles.starBadge}>
                      <FontAwesome name="star" size={9} color="#F59E0B" />
                      <Text style={styles.ratingText}>
                        {Number(item.rating || 4.8).toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.brandText} numberOfLines={1}>
                      {item.brand || item.category || 'BuyLow'}
                    </Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{formatINR(item.price)}</Text>
                    {item.oldPrice && item.oldPrice > item.price ? (
                      <Text style={styles.oldPrice}>₹{formatINR(item.oldPrice)}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={[styles.addBtn, isAdded && styles.addBtnDone]}
                    onPress={() => handleAdd(item)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={isAdded ? 'check' : 'shopping-bag'}
                      size={12}
                      color={isAdded ? '#FFFFFF' : Colors.primary}
                    />
                    <Text style={[styles.addBtnText, isAdded && styles.addBtnTextDone]}>
                      {isAdded ? 'Added' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 154,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageWrap: {
    height: 120,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: Colors.white,
    fontSize: 9.5,
    fontWeight: '800',
  },
  wishBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
    minHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  brandText: {
    fontSize: 10.5,
    color: '#64748B',
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  oldPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnDone: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  addBtnTextDone: {
    color: Colors.white,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
});
