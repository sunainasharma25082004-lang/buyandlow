import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ProductRailSkeleton from '../ui/ProductRailSkeleton';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import { formatINR, getDiscountPercent } from '../../services/api';
import RemoteImage from '../RemoteImage';
import type { Product } from '../../types/api';
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

export default function ProductRail({
  title,
  subtitle,
  icon = 'shopping-bag',
  products,
  loading = false,
  emptyText,
  onViewAll,
  showDiscount = false,
}: Props) {
  const router = useRouter();

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
          <TouchableOpacity onPress={onViewAll} style={styles.viewAll}>
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
              <TouchableOpacity
                key={item._id}
                style={[styles.card, { width: productCardWidth }]}
                onPress={() => router.push(`/product/${item._id}`)}
                activeOpacity={0.85}
              >
                {discount ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{discount}%</Text>
                  </View>
                ) : null}
                <View style={[styles.imageWrap, { height: productImageHeight }]}>
                  <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
                </View>
                <View style={styles.body}>
                  {item.brand ? (
                    <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
                  ) : null}
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.price}>₹{formatINR(item.price)}</Text>
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
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scroll: {
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  imageWrap: {
    backgroundColor: Colors.lightBlue,
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    padding: 10,
  },
  brand: {
    fontSize: 9,
    color: Colors.textLight,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    minHeight: 32,
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
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