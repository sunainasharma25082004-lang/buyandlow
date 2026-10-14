import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { Colors, Shadows } from '../../constants/colors';
import RemoteImage from '../RemoteImage';
import { formatINR } from '../../services/api';

export default function FloatingCartBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cart, cartCount, cartTotal } = useCart();

  if (!cartCount || cartCount === 0) return null;

  // Get preview images for up to 3 distinct items
  const previewItems = cart.slice(0, 3);

  // Position above the bottom tab bar (tab bar height ~60px + safe area)
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8) + 64;

  return (
    <View style={[styles.floatingWrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.cartPill}
        onPress={() => router.push('/(tabs)/cart')}
        activeOpacity={0.9}
        accessibilityLabel="View Cart"
      >
        {/* Left: Thumbnail collage */}
        <View style={styles.thumbnailGroup}>
          {previewItems.map((item, index) => {
            const product = typeof item.product === 'object' ? item.product : null;
            const uri = product?.image || '';
            return (
              <View
                key={`cart-thumb-${index}`}
                style={[
                  styles.thumbCircle,
                  { marginLeft: index === 0 ? 0 : -10, zIndex: 10 - index },
                ]}
              >
                <RemoteImage uri={uri} style={styles.thumbImage} contentFit="cover" />
              </View>
            );
          })}
        </View>

        {/* Center: Title & Item Count */}
        <View style={styles.centerContent}>
          <Text style={styles.titleText}>View cart</Text>
          <Text style={styles.itemsSubtext}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
            {cartTotal > 0 ? ` • ₹${formatINR(cartTotal)}` : ''}
          </Text>
        </View>

        {/* Right: Action Arrow */}
        <View style={styles.arrowCircle}>
          <Feather name="chevron-right" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  cartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#15803D', // Signature Blinkit / Quick-commerce green
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 480,
    ...Shadows.large,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  thumbnailGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  thumbCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#15803D',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  itemsSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DCFCE7',
    marginTop: 1,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
