import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { resolveMediaUrl } from '../../config/api';
import { getCategories } from '../../services/api';
import type { Category } from '../../types/api';

import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getCategories(false)
      .then((res) => {
        if (active) {
          setCategories(res.categories || []);
          setError('');
        }
      })
      .catch(() => {
        if (active) {
          setCategories([]);
          setError('Could not load categories. Make sure the backend server is running.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const getLabel = (cat: Category) => cat.title || cat.displayName || cat.name;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>Uploaded from admin panel</Text>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.stateText}>Loading categories...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No categories yet</Text>
          <Text style={styles.stateText}>
            {error || 'Add categories from the admin panel and they will show up here automatically.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/category/${encodeURIComponent(item.name)}`)}
            >
              <Image
                source={{ uri: resolveMediaUrl(item.image) }}
                style={styles.cardImage}
                contentFit="cover"
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {getLabel(item)}
                </Text>
                <Text style={styles.cardCount}>
                  {item.productCount
                    ? `${item.productCount} product${item.productCount > 1 ? 's' : ''}`
                    : 'Explore collection'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  list: {
    padding: 12,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardBody: {
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  cardCount: {
    fontSize: 12,
    color: Colors.textLight,
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  stateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});