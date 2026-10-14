import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ProductRailSkeleton from '../ui/ProductRailSkeleton';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import { formatINR, getDiscountPercent } from '../../services/api';
import RemoteImage from '../RemoteImage';
import type { Product } from '../../types/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  horizontalPadding,
  productCardWidth,
  productImageHeight,
  sectionTitleSize,
} from '../../utils/responsive';

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
  products: Product[];
  loading?: boolean;
  emptyText?: string;
  onViewAll?: () => void;
  showDiscount?: boolean;
};

function RailCard({
  item,
  discount,
}: {
  item: Product;
  discount: number | null;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const isWish = isInWishlist(item._id);
  const rating = item.rating != null && Number(item.rating) > 0 ? Number(item.rating) : null;
  const reviews = item.reviews || 0;

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await addToCart(item, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    try {
      await toggleWishlist(item._id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: productCardWidth }]}
      onPress={() => router.push(`/product/${item._id}`)}
      activeOpacity={0.9}
    >
      <View style={[styles.imageWrap, { height: productImageHeight }]}>
        <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />

        {discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        ) : item.badge ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{item.badge}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.wishButton}
          onPress={handleWishlist}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Wishlist"
        >
          <Ionicons
            name={isWish ? 'heart' : 'heart-outline'}
            size={15}
            color={isWish ? '#EF4444' : Colors.textLight}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.brandRow}>
          <Text style={styles.brand} numberOfLines={1}>
            {item.brand || item.category || 'BuyLow'}
          </Text>
          <View style={styles.assuredTag}>
            <Ionicons name="checkmark-circle" size={9} color="#059669" />
            <Text style={styles.assuredText}>Assured</Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.ratingRow}>
          {rating ? (
            <View style={styles.starBadge}>
              <FontAwesome name="star" size={9} color="#F59E0B" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          ) : null}
          {reviews > 0 ? (
            <Text style={styles.reviewsText}>({reviews})</Text>
          ) : (
            <Text style={styles.freeDeliv}>In Stock</Text>
          )}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{formatINR(item.price)}</Text>
          {item.oldPrice && item.oldPrice > item.price ? (
            <Text style={styles.oldPrice}>₹{formatINR(item.oldPrice)}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.addButton, added && styles.addedButton]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
          disabled={adding}
        >
          <Feather
            name={added ? 'check' : 'shopping-bag'}
            size={12}
            color={Colors.white}
          />
          <Text style={styles.addButtonText}>
            {added ? 'Added!' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductRail({
  title,
  subtitle,
  icon = 'shopping-bag',
  products,
  loading = false,
  emptyText,
  onViewAll,
  showDiscount = true,
}: Props) {
  if (!loading && products.length === 0 && !emptyText) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <Feather name={icon} size={16} color={Colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { fontSize: sectionTitleSize }]}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {onViewAll ? (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAll} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={14} color={Colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ProductRailSkeleton />
      ) : products.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
        >
          {products.map((item) => {
            const discount = showDiscount ? getDiscountPercent(item.price, item.oldPrice) : null;
            return (
              <RailCard
                key={item._id}
                item={item}
                discount={discount}
              />
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
    paddingVertical: 14,
    marginTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 11.5,
    color: Colors.textLight,
    marginTop: 1,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  scroll: {
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageWrap: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    zIndex: 2,
    backgroundColor: Colors.accent,
    paddingHorizontal: 5.5,
    paddingVertical: 2,
    borderRadius: 5,
    ...Shadows.small,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  statusBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    zIndex: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: 5.5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  wishButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
    zIndex: 2,
  },
  body: {
    padding: 9,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  brand: {
    fontSize: 9.5,
    color: Colors.textLight,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
  },
  assuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  assuredText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#059669',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    height: 32,
    lineHeight: 16,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#FDE68A',
  },
  ratingText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B45309',
  },
  reviewsText: {
    fontSize: 9.5,
    color: Colors.textLight,
  },
  freeDeliv: {
    fontSize: 9,
    color: '#16A34A',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginBottom: 6,
  },
  price: {
    fontSize: 14.5,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  oldPrice: {
    fontSize: 11,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingVertical: 6.5,
    borderRadius: 8,
    ...Shadows.small,
  },
  addedButton: {
    backgroundColor: Colors.success,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  stateBox: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalPadding,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});