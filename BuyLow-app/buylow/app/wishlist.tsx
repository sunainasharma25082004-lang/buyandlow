import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import RemoteImage from '../components/RemoteImage';
import { formatINR, getDiscountPercent, getProduct } from '../services/api';
import type { Product } from '../types/api';

export default function WishlistScreen() {
  const router = useRouter();
  const { user, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadWishlist = async () => {
        if (!user?.wishlist || user.wishlist.length === 0) {
          if (active) {
            setItems([]);
            setLoading(false);
          }
          return;
        }

        setLoading(true);
        const resolved: Product[] = [];

        for (const rawItem of user.wishlist) {
          if (!rawItem) continue;
          if (typeof rawItem === 'object' && rawItem._id) {
            resolved.push(rawItem);
          } else if (typeof rawItem === 'string') {
            try {
              const fetched = await getProduct(rawItem);
              if (fetched && fetched._id) {
                resolved.push(fetched);
              }
            } catch {
              // skip unresolvable product
            }
          }
        }

        if (active) {
          setItems(resolved);
          setLoading(false);
        }
      };

      loadWishlist();

      return () => {
        active = false;
      };
    }, [user?.wishlist]),
  );

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      setAddedIds((prev) => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product._id]: false }));
      }, 1800);
    } catch (e) {
      console.error('Failed to add to cart from wishlist', e);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      setItems((prev) => prev.filter((p) => p._id !== productId));
      await toggleWishlist(productId);
    } catch (e) {
      console.error('Failed to remove from wishlist', e);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('wishlist.title')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('wishlist.loginToSee')}</Text>
          <Text style={styles.emptySub}>Sign in to view and save products to your personal wishlist</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>{t('common.login')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('wishlist.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {items.length === 1 ? '1 item' : `${items.length} items`} saved
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push('/cart')}
          activeOpacity={0.7}
        >
          <Feather name="shopping-bag" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-dislike-outline" size={52} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>{t('wishlist.emptyAlt')}</Text>
          <Text style={styles.emptySub}>{t('wishlist.emptySubAlt')}</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Feather name="shopping-bag" size={16} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>{t('cart.startShopping')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const discount = getDiscountPercent(item.price, item.oldPrice);
            const isAdded = addedIds[item._id];
            const rating = Number(item.rating) || 4.5;

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/product/${item._id}`)}
                activeOpacity={0.9}
              >
                {/* Product Thumbnail */}
                <View style={styles.imageWrap}>
                  <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
                  {discount ? (
                    <View style={styles.discountPill}>
                      <Text style={styles.discountPillText}>-{discount}%</Text>
                    </View>
                  ) : null}
                </View>

                {/* Details */}
                <View style={styles.info}>
                  <View style={styles.topInfo}>
                    <Text style={styles.brand} numberOfLines={1}>
                      {item.brand || item.category || 'BuyLow'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemove(item._id)}
                      style={styles.removeBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {/* Rating Badge */}
                  <View style={styles.ratingRow}>
                    <View style={styles.starBadge}>
                      <FontAwesome name="star" size={10} color="#F59E0B" />
                      <Text style={styles.ratingVal}>{rating.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.assuredText}>Assured Quality</Text>
                  </View>

                  {/* Price & Actions */}
                  <View style={styles.bottomRow}>
                    <View style={styles.priceCol}>
                      <Text style={styles.price}>₹{formatINR(item.price)}</Text>
                      {item.oldPrice && item.oldPrice > item.price ? (
                        <Text style={styles.oldPrice}>₹{formatINR(item.oldPrice)}</Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={[styles.cartBtn, isAdded && styles.cartBtnAdded]}
                      onPress={() => handleAddToCart(item)}
                      activeOpacity={0.85}
                    >
                      <Feather
                        name={isAdded ? 'check' : 'shopping-bag'}
                        size={13}
                        color={Colors.white}
                      />
                      <Text style={styles.cartBtnText}>
                        {isAdded ? 'Added' : 'Add to Cart'}
                      </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    ...Shadows.medium,
    elevation: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '600',
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
  },
  list: {
    padding: 14,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E1EDF8',
    ...Shadows.small,
  },
  imageWrap: {
    width: 105,
    height: 115,
    borderRadius: 12,
    backgroundColor: '#F6F9FD',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#FDE68A',
  },
  ratingVal: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
  },
  assuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  oldPrice: {
    fontSize: 11.5,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    ...Shadows.small,
  },
  cartBtnAdded: {
    backgroundColor: Colors.success,
  },
  cartBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 11.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 24,
    ...Shadows.medium,
  },
  actionBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
});