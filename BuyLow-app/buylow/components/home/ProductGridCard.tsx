import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const [busy, setBusy] = useState(false);

  // Check if item is in cart and get quantity
  const cartItem = cart.find((item) => {
    const pId = typeof item.product === 'string' ? item.product : item.product?._id;
    return pId === product._id;
  });
  const quantity = cartItem?.quantity || 0;

  const discount = getDiscountPercent(product.price, product.oldPrice);
  const isWish = isInWishlist(product._id);
  const rating = product.rating != null && Number(product.rating) > 0 ? Number(product.rating) : null;
  const reviews = product.reviews || 0;

  const handleAdd = async (e?: any) => {
    if (busy) return;
    setBusy(true);
    try {
      await addToCart(product, 1);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setBusy(false);
    }
  };

  const handleIncrement = async (e?: any) => {
    if (busy) return;
    setBusy(true);
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      console.error('Failed to update quantity', err);
    } finally {
      setBusy(false);
    }
  };

  const handleDecrement = async (e?: any) => {
    if (busy) return;
    setBusy(true);
    try {
      if (quantity <= 1) {
        await removeFromCart(product._id);
      } else {
        await updateQuantity(product._id, quantity - 1);
      }
    } catch (err) {
      console.error('Failed to update quantity', err);
    } finally {
      setBusy(false);
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
            <Text style={styles.discountText}>{discount}% OFF</Text>
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
            color={isWish ? '#EF4444' : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Brand / Unit / Assured */}
        <View style={styles.brandRow}>
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand || product.category || 'BuyLow'}
          </Text>
          <View style={styles.assuredTag}>
            <Ionicons name="shield-checkmark" size={10} color="#059669" />
            <Text style={styles.assuredText}>Assured</Text>
          </View>
        </View>

        {/* Product Title - 2 lines max */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating row or Stock indication */}
        <View style={styles.metaRow}>
          {rating ? (
            <View style={styles.starBadge}>
              <FontAwesome name="star" size={9} color="#D97706" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          ) : (
            <View style={styles.unitBadge}>
              <Text style={styles.unitText}>1 Unit</Text>
            </View>
          )}
          {reviews > 0 ? (
            <Text style={styles.reviewsText}>({reviews})</Text>
          ) : (
            <Text style={styles.inStockText}>In Stock</Text>
          )}
        </View>

        {/* Price & Modern Quick ADD / Stepper Row (Flipkart / Blinkit Style) */}
        <View style={styles.bottomRow}>
          {/* Price Block */}
          <View style={styles.priceBlock}>
            <Text style={styles.price}>₹{formatINR(product.price)}</Text>
            {product.oldPrice && product.oldPrice > product.price ? (
              <Text style={styles.oldPrice}>₹{formatINR(product.oldPrice)}</Text>
            ) : null}
          </View>

          {/* Quick Commerce ADD Button or Stepper */}
          {quantity > 0 ? (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={handleDecrement}
                disabled={busy}
                activeOpacity={0.7}
              >
                <Feather name="minus" size={12} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.stepperQty}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={handleIncrement}
                disabled={busy}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAdd}
              disabled={busy}
              activeOpacity={0.8}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <>
                  <Text style={styles.addButtonText}>ADD</Text>
                  <Feather name="plus" size={12} color="#059669" style={styles.addPlus} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
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
    height: 144,
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
    backgroundColor: '#2563EB', // Vibrant royal blue discount tag
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
    ...Shadows.small,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 2,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  wishButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
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
    marginBottom: 3,
  },
  brand: {
    fontSize: 9.5,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.4,
    flex: 1,
  },
  assuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  assuredText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#059669',
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    height: 32,
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  unitBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  unitText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewsText: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  inStockText: {
    fontSize: 9.5,
    color: '#16A34A',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBlock: {
    flex: 1,
  },
  price: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  oldPrice: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4', // Light green tint
    borderWidth: 1,
    borderColor: '#059669', // Emerald border
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 64,
  },
  addButtonText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#059669',
  },
  addPlus: {
    marginLeft: 3,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669', // Solid green stepper
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 24,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
    paddingHorizontal: 5,
  },
});