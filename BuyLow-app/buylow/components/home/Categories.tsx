import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { getCategories } from '../../services/api';
import RemoteImage from '../RemoteImage';
import { PLACEHOLDER_CATEGORY } from '../../constants/images';
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
      .catch((err: Error) => {
        if (active) {
          setCategories([]);
          setError(err.message || 'Could not load categories.');
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
          <View style={styles.headerLeft}>
            <View style={styles.iconWrap}>
              <Feather name="grid" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>Top Categories</Text>
              <Text style={styles.subtitle}>Explore curated collections</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => router.push('/(tabs)/categories')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Feather name="chevron-right" size={13} color={Colors.primary} />
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {categories.map((item, index) => {
            const ringColors =
              index % 3 === 0
                ? ['#1E88E5', '#1565C0']
                : index % 3 === 1
                ? ['#F59E0B', '#FBBF24']
                : ['#10B981', '#059669'];

            return (
              <TouchableOpacity
                key={item._id}
                style={styles.item}
                onPress={() => router.push(`/category/${encodeURIComponent(item.name)}`)}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={ringColors as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.imageRing}
                >
                  <View style={styles.imageCircle}>
                    <RemoteImage
                      uri={item.image}
                      style={styles.image}
                      fallback={PLACEHOLDER_CATEGORY}
                      contentFit="cover"
                    />
                  </View>
                </LinearGradient>
                <Text style={styles.name} numberOfLines={2}>
                  {getLabel(item)}
                </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16.5,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 11.5,
    color: Colors.textLight,
    marginTop: 1,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 11.5,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 14,
    gap: 14,
    paddingBottom: 2,
  },
  item: {
    alignItems: 'center',
    width: 78,
  },
  imageRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2.5,
    marginBottom: 6,
    ...Shadows.small,
  },
  imageCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 15,
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