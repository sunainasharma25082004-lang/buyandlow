import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { getProducts, resolveMediaUrl, formatINR } from '../../services/api';
import type { Product } from '../../types/api';

export default function TrendyProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Fetching trendy items (e.g. sorted by rating)
    getProducts({ sort: 'Best Rating', limit: 8 })
      .then((res) => {
        if (active) setProducts(res.products || []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trendy Products</Text>
        <Feather name="trending-up" size={18} color={Colors.secondary} />
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {products.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={styles.card}
              onPress={() => router.push(`/product/${item._id}`)}
            >
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: resolveMediaUrl(item.image) }}
                  style={styles.image}
                  contentFit="contain"
                />
              </View>
              <View style={styles.details}>
                <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{formatINR(item.price)}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={12} color={Colors.secondary} />
                  <Text style={styles.ratingText}>{item.rating ?? 0} ({item.reviews ?? 0})</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: Colors.white,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageWrap: {
    height: 140,
    backgroundColor: Colors.lightBlue,
    padding: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 12,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
    height: 34,
  },
  priceRow: {
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.textLight,
  },
  stateBox: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
