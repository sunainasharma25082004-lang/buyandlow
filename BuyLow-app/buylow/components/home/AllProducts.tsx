import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import { API_URL } from '../../config/api';
import { getProducts, formatINR } from '../../services/api';
import RemoteImage from '../RemoteImage';
import type { Product } from '../../types/api';

export default function AllProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getProducts({ sort: 'Newest', limit: 50 })
      .then((res) => {
        if (active) {
          setProducts(res.products || []);
          setError('');
        }
      })
      .catch((err: Error) => {
        if (active) {
          setProducts([]);
          setError(err.message || 'Could not load products');
        }
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
        <Text style={styles.title}>All Products</Text>
        <Text style={styles.subtitle}>From admin panel</Text>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.stateText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Feather name="wifi-off" size={32} color={Colors.error} />
          <Text style={styles.errorTitle}>Backend connect nahi ho raha</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.apiHint}>API: {API_URL}</Text>
          <Text style={styles.errorHint}>
            Server chalao (port 5000), phone + PC same WiFi pe rakho, phir expo start --clear
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.stateBox}>
          <Feather name="package" size={32} color={Colors.textLight} />
          <Text style={styles.stateText}>Admin panel se products add karo — yahan dikhenge</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {products.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => router.push(`/product/${item._id}`)}
            >
              <View style={styles.imageWrap}>
                <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.body}>
                {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₹{formatINR(item.price)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: '47%',
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
  stateBox: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
    gap: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.error,
  },
  errorText: {
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
  },
  apiHint: {
    fontSize: 11,
    color: Colors.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorHint: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});