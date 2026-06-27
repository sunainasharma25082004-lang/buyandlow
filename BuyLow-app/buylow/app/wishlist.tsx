import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RemoteImage from '../components/RemoteImage';
import { formatINR } from '../services/api';
import type { Product } from '../types/api';

export default function WishlistScreen() {
  const router = useRouter();
  const { user, token, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user?.wishlist) {
        setItems([]);
        setLoading(false);
        return;
      }
      const products = user.wishlist
        .map((item) => (typeof item === 'string' ? null : item))
        .filter(Boolean) as Product[];
      setItems(products);
      setLoading(false);
    }, [user?.wishlist]),
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={Colors.border} />
          <Text style={styles.emptyTitle}>Login to see wishlist</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={Colors.border} />
          <Text style={styles.emptyTitle}>Wishlist is empty</Text>
          <Text style={styles.emptySub}>Save products you love from product pages</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.btnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/product/${item._id}`)}
            >
              <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₹{formatINR(item.price)}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() => addToCart(item, 1)}
                  >
                    <Feather name="shopping-cart" size={14} color={Colors.white} />
                    <Text style={styles.cartBtnText}>Add</Text>
                  </TouchableOpacity>
                  {token && (
                    <TouchableOpacity
                      onPress={() => toggleWishlist(item._id)}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  image: { width: 90, height: 90, borderRadius: 10, backgroundColor: Colors.lightBlue },
  info: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: '600', color: Colors.text },
  price: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginVertical: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cartBtnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  removeBtn: { padding: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textLight, textAlign: 'center' },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: { color: Colors.white, fontWeight: '700' },
});