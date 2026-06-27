import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RemoteImage from '../../components/RemoteImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { getProducts, formatINR } from '../../services/api';
import { Product } from '../../types/api';
import { useLanguage } from '../../context/LanguageContext';

export default function CategoryProductsScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const categoryName = decodeURIComponent(Array.isArray(name) ? name[0] : (name || ''));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryName) {
      setLoading(false);
      return;
    }
    let active = true;
    getProducts({ category: categoryName })
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
  }, [categoryName]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('categories.noProductsInCategory')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/product/${item._id}`)}>
            <View style={styles.imageContainer}>
              <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.brand}>{item.brand}</Text>
              <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.price}>₹{formatINR(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  row: {
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 150,
    backgroundColor: Colors.background,
    padding: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: 12,
  },
  brand: {
    fontSize: 10,
    color: Colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
    height: 34,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textLight,
  },
});
