import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { formatINR } from '../../services/api';
import RemoteImage from '../RemoteImage';
import type { Product } from '../../types/api';

type Props = {
  product: Product;
};

export default function ProductGridCard({ product }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product._id}`)}
      activeOpacity={0.88}
    >
      <View style={styles.imageWrap}>
        <RemoteImage uri={product.image} style={styles.image} contentFit="contain" />
        {product.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        {product.brand ? <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text> : null}
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>₹{formatINR(product.price)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
    ...Shadows.small,
  },
  imageWrap: {
    height: 140,
    backgroundColor: Colors.lightBlue,
    padding: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  body: {
    padding: 10,
  },
  brand: {
    fontSize: 10,
    color: Colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    minHeight: 32,
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primary,
  },
});