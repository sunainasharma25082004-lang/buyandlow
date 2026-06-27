import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import RemoteImage from '../RemoteImage';
import storage from '../../utils/storage';

import { Colors, Shadows } from '../../constants/colors';
import { formatINR } from '../../services/api';
import type { Product } from '../../types/api';

export default function RecentlyViewed() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadRecent = async () => {
        try {
          const stored = await storage.getItem('recently_viewed');
          if (stored && active) {
            setProducts(JSON.parse(stored));
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoading(false);
        }
      };
      loadRecent();
      return () => { active = false; };
    }, [])
  );

  if (loading) return null;
  if (!loading && products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recently Viewed</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {products.map((item) => (
          <TouchableOpacity 
            key={item._id} 
            style={styles.card}
            onPress={() => router.push(`/product/${item._id}`)}
          >
            <View style={styles.imageWrap}>
              <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
            </View>
            <View style={styles.details}>
              <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.price}>₹{formatINR(item.price)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 120,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageWrap: {
    height: 100,
    backgroundColor: Colors.lightBlue,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 8,
  },
  productTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
    height: 30,
  },
  price: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
