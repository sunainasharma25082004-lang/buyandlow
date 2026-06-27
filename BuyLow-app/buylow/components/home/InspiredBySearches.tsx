import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import RemoteImage from '../RemoteImage';
import storage from '../../utils/storage';

import { Colors, Shadows } from '../../constants/colors';
import { getProducts, formatINR } from '../../services/api';
import type { Product } from '../../types/api';
import { Feather } from '@expo/vector-icons';

export default function InspiredBySearches() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadInspiredProducts = async () => {
        try {
          const stored = await storage.getItem('recent_searches');
          if (stored) {
            const searches: string[] = JSON.parse(stored);
            if (searches.length > 0) {
              const latestSearch = searches[0];
              if (active) {
                setSearchTerm(latestSearch);
                setLoading(true);
              }
              const res = await getProducts({ keyword: latestSearch, limit: 8 });
              if (active && res.products && res.products.length > 0) {
                setProducts(res.products);
              } else if (active) {
                setProducts([]);
              }
            } else if (active) {
              setProducts([]);
            }
          } else if (active) {
            setProducts([]);
          }
        } catch (e) {
          console.error('Failed to load inspired products', e);
        } finally {
          if (active) setLoading(false);
        }
      };

      loadInspiredProducts();
      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Inspired by your Searches</Text>
        </View>
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </View>
    );
  }
  
  

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Based on &quot;{searchTerm}&quot;</Text>
        <Feather name="search" size={16} color={Colors.textLight} />
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
    gap: 12,
  },
  card: {
    width: 130,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageWrap: {
    height: 120,
    backgroundColor: Colors.lightBlue,
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 10,
  },
  productTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 6,
    height: 32,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  stateBox: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
