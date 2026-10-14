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
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { getCategories } from '../../services/api';
import RemoteImage from '../RemoteImage';
import { PLACEHOLDER_CATEGORY } from '../../constants/images';
import type { Category } from '../../types/api';
import { useLanguage } from '../../context/LanguageContext';

type CategoriesProps = {
  homeOnly?: boolean;
  showHeader?: boolean;
};

export default function Categories({ homeOnly = false, showHeader = true }: CategoriesProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getCategories(homeOnly)
      .then((res) => {
        if (!active) return;
        const list = (res.categories || []).filter((c) => c.isActive !== false);
        setCategories(list);
        setError('');
      })
      .catch((err: Error) => {
        if (!active) return;
        setCategories([]);
        setError(err.message || 'Could not load categories.');
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
            <Text style={styles.title}>{t('categories.allCategories') || 'Shop by Category'}</Text>
            <Text style={styles.subtitle}>Curated collections at guaranteed low prices</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => router.push('/(tabs)/categories')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>{t('common.viewAll') || 'View All'}</Text>
            <Feather name="chevron-right" size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.stateText}>Loading categories...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons name="grid-outline" size={24} color={Colors.textLight} />
          <Text style={styles.stateText}>
            {error || 'Categories will appear here once added.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {categories.map((item) => {
            const label = getLabel(item);

            return (
              <TouchableOpacity
                key={item._id || item.name}
                style={styles.item}
                onPress={() => router.push(`/category/${encodeURIComponent(item.name)}`)}
                activeOpacity={0.82}
              >
                <View style={styles.imageCard}>
                  <RemoteImage
                    uri={item.image}
                    style={styles.image}
                    fallback={PLACEHOLDER_CATEGORY}
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.name} numberOfLines={2}>
                  {label}
                </Text>
                {item.productCount ? (
                  <Text style={styles.countText}>
                    {item.productCount} items
                  </Text>
                ) : null}
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
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  item: {
    alignItems: 'center',
    width: 82,
  },
  imageCard: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 6,
    ...Shadows.small,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 15,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  stateBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateText: {
    fontSize: 12,
    color: '#64748B',
  },
});