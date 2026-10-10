import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/colors';
import { getCategories } from '../../services/api';
import RemoteImage from '../../components/RemoteImage';
import { PLACEHOLDER_CATEGORY } from '../../constants/images';
import type { Category } from '../../types/api';
import CustomHeader from '../../components/CustomHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
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
          setError(t('categories.loadError'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  const getLabel = (cat: Category) => cat.title || cat.displayName || cat.name;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader />
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Feather name="grid" size={13} color={Colors.primary} />
          <Text style={styles.badgeText}>BROWSE CATALOG</Text>
        </View>
        <Text style={styles.title}>{t('categories.allCategories')}</Text>
        <Text style={styles.subtitle}>{t('categories.browseAdmin')}</Text>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.stateText}>{t('categories.loadingCategories')}</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons name="grid-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>{t('categories.noCategoriesYet')}</Text>
          <Text style={styles.stateText}>{error || t('categories.adminHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/category/${encodeURIComponent(item.name)}`)}
              activeOpacity={0.88}
            >
              <View style={styles.cardMediaWrap}>
                <RemoteImage
                  uri={item.image}
                  style={styles.cardImage}
                  fallback={PLACEHOLDER_CATEGORY}
                  contentFit="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(15,23,42,0.65)']}
                  style={styles.imageOverlay}
                />
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>
                    {item.productCount ? `${item.productCount} items` : 'Explore'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {getLabel(item)}
                </Text>
                <Feather name="arrow-right" size={14} color={Colors.primary} />
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
    backgroundColor: '#F3F6FB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.textLight,
    marginTop: 2,
  },
  list: {
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  cardMediaWrap: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#EDF5FD',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  countPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  cardBody: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  stateText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 19,
  },
});