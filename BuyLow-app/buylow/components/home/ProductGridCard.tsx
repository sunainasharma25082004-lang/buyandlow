import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { formatINR, getDiscountPercent } from '../../services/api';
import RemoteImage from '../RemoteImage';
import type { Product } from '../../types/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

type Props = {
  product: Product;
};

export default function ProductGridCard({ product }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = getDiscountPercent(product.price, product.oldPrice);
  const isWish = isInWishlist(product._id);
  const rating = Number(product.rating) || 4.5;
  const reviews = product.reviews || 0;

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    try {
      await toggleWishlist(product._id);
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product._id}`)}
      activeOpacity={0.92}
    >
      {/* Top Media Wrap */}
      <View style={styles.imageWrap}>
        <RemoteImage uri={product.image} style={styles.image} contentFit="contain" />

        {/* Badges / Discount */}
        {discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        ) : product.badge ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{product.badge}</Text>
          </View>
        ) : null}

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishButton}
          onPress={handleWishlist}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Wishlist"
        >
          <Ionicons
            name={isWish ? 'heart' : 'heart-outline'}
            size={16}
            color={isWish ? '#EF4444' : Colors.textLight}
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Brand / Category */}
        <View style={styles.brandRow}>
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand || product.category || 'BuyLow'}
          </Text>
          <View style={styles.assuredTag}>
            <Ionicons name="checkmark-circle" size={10} color="#059669" />
            <Text style={styles.assuredText}>Assured</Text>
          </View>
        </View>

        {/* Product Title - 2 lines max */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating row */}
        <View style={styles.ratingRow}>
          <View style={styles.starBadge}>
            <FontAwesome name="star" size={9.5} color="#F59E0B" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          {reviews > 0 ? (
            <Text style={styles.reviewsText}>({reviews})</Text>
          ) : (
            <Text style={styles.freeDeliv}>Free Deliv.</Text>
          )}
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{formatINR(product.price)}</Text>
          {product.oldPrice && product.oldPrice > product.price ? (
            <Text style={styles.oldPrice}>₹{formatINR(product.oldPrice)}</Text>
          ) : null}
        </View>

        {/* Tactile Add to Cart Button */}
        <TouchableOpacity
          style={[styles.addButton, added && styles.addedButton]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
          disabled={adding}
        >
          <Feather
            name={added ? 'check' : 'shopping-bag'}
            size={13}
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 12,
    ...Shadows.small,
  },
  imageWrap: {
    height: 152,
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
    top: 8,
    left: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    zIndex: 2,
    ...Shadows.small,
  },
  discountText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    zIndex: 2,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  wishButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
    zIndex: 2,
  },
  body: {
    padding: 10,
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
    letterSpacing: 0.4,
    flex: 1,
  },
  assuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  assuredText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  name: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.text,
    height: 34,
    lineHeight: 17,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  reviewsText: {
    fontSize: 10,
    color: Colors.textLight,
  },
  freeDeliv: {
    fontSize: 9.5,
    color: '#16A34A',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 15.5,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  oldPrice: {
    fontSize: 11.5,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingVertical: 7.5,
    borderRadius: 9,
    ...Shadows.small,
  },
  addedButton: {
    backgroundColor: Colors.success,
  },
  addButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.white,
  },
});