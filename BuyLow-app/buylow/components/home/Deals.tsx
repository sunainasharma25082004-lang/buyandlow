import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { resolveMediaUrl } from '../../config/api';
import { formatINR, getDiscountPercent, getSaleProducts } from '../../services/api';
import type { Product } from '../../types/api';

import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function Deals() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSaleProducts(10)
      .then((res) => {
        if (active) setProducts(res.products || []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deals of the Day</Text>
        <View style={styles.timerContainer}>
          <Feather name="clock" size={14} color={Colors.text} />
          <Text style={styles.timerText}>Limited time offers</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Loading deals...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.stateBox}>
          <Feather name="tag" size={28} color={Colors.textLight} />
          <Text style={styles.stateText}>
            Sale products will appear here once added from the admin panel.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {products.map((item) => {
            const discount = getDiscountPercent(item.price, item.oldPrice);

            return (
              <TouchableOpacity 
                key={item._id} 
                style={styles.card}
                onPress={() => router.push(`/product/${item._id}`)}
              >
                {discount ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{discount}%</Text>
                  </View>
                ) : null}

                <View style={styles.imageWrap}>
                  <Image
                    source={{ uri: resolveMediaUrl(item.image) }}
                    style={styles.image}
                    contentFit="contain"
                  />
                </View>

                <View style={styles.details}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{formatINR(item.price)}</Text>
                    {item.oldPrice ? (
                      <Text style={styles.originalPrice}>₹{formatINR(item.oldPrice)}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => {
                      addToCart(item, 1);
                      alert('Added to cart!');
                    }}
                  >
                    <Feather name="shopping-cart" size={14} color={Colors.text} />
                    <Text style={styles.addButtonText}>Add to Cart</Text>
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
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 150,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.white,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
  imageWrap: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    gap: 6,
  },
  productTitle: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    height: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
    gap: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  stateBox: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});