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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { resolveMediaUrl } from '../../config/api';
import { getCategories } from '../../services/api';
import type { Category } from '../../types/api';

type CategoriesProps = {
  homeOnly?: boolean;
  showHeader?: boolean;
};

export default function Categories({ homeOnly = true, showHeader = true }: CategoriesProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getCategories(homeOnly)
      .then((res) => {
        if (active) {
          setCategories(res.categories || []);
          setError('');
        }
      })
      .catch(() => {
        if (active) {
          setCategories([]);
          setError('Could not load categories. Check backend connection.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [homeOnly]);

  const getLabel = (cat: Category) => cat.title || cat.displayName || cat.name;

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Top Categories</Text>
          <TouchableOpacity style={styles.viewAll} onPress={() => router.push('/(tabs)/categories')}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Loading categories...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons name="grid-outline" size={28} color={Colors.textLight} />
          <Text style={styles.stateText}>
            {error || 'Categories will appear here once added from the admin panel.'}
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {categories.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={styles.item}
              onPress={() => router.push(`/category/${encodeURIComponent(item.name)}`)}
            >
              <View style={styles.imageCircle}>
                <Image
                  source={{ uri: resolveMediaUrl(item.image) }}
                  style={styles.image}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {getLabel(item)}
              </Text>
            </TouchableOpacity>
          ))}
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
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  imageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  stateBox: {
    minHeight: 90,
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