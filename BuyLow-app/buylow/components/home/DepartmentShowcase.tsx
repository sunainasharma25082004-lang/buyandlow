import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getCategories, getProducts } from '../../services/api';
import type { Category, Product } from '../../types/api';
import ProductGridCard from './ProductGridCard';

export default function DepartmentShowcase() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [departments, setDepartments] = useState<Category[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real active categories from backend
  useEffect(() => {
    let active = true;
    getCategories(false)
      .then((res) => {
        if (!active) return;
        const valid = (res.categories || []).filter((c) => c.isActive !== false);
        setDepartments(valid);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch products whenever selected department changes
  useEffect(() => {
    let active = true;
    setLoading(true);

    const query: any = { limit: 4, sort: 'Popular' };
    if (selectedDept !== 'All') {
      query.category = selectedDept;
    }

    getProducts(query)
      .then((res) => {
        if (!active) return;
        setProducts(res.products || []);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDept]);

  const containerPadding = 16;
  const gap = 12;
  const isTablet = width >= 768;
  const numColumns = isTablet ? 4 : 2;
  const totalGaps = gap * (numColumns - 1);
  const availableWidth = Math.min(width, 1100) - (containerPadding * 2) - totalGaps;
  const cardWidth = Math.floor(availableWidth / numColumns);

  const getLabel = (dept: Category) => dept.title || dept.displayName || dept.name;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Shop by Department</Text>
          <Text style={styles.subtitle}>Explore curated departments with guaranteed genuine products</Text>
        </View>

        {selectedDept !== 'All' ? (
          <TouchableOpacity
            style={styles.viewDeptBtn}
            onPress={() => router.push(`/category/${encodeURIComponent(selectedDept)}`)}
            activeOpacity={0.75}
          >
            <Text style={styles.viewDeptText}>View All</Text>
            <Feather name="arrow-right" size={12} color={Colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Department Tabs Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroll}
      >
        <TouchableOpacity
          style={[styles.tabChip, selectedDept === 'All' && styles.tabChipActive]}
          onPress={() => setSelectedDept('All')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabChipText, selectedDept === 'All' && styles.tabChipTextActive]}
          >
            All Departments
          </Text>
        </TouchableOpacity>

        {departments.map((dept) => {
          const isSelected = selectedDept === dept.name;
          const label = getLabel(dept);

          return (
            <TouchableOpacity
              key={dept._id || dept.name}
              style={[styles.tabChip, isSelected && styles.tabChipActive]}
              onPress={() => setSelectedDept(dept.name)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}
              >
                {label}
              </Text>
              {dept.productCount ? (
                <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isSelected && styles.countTextActive]}>
                    {dept.productCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Department Products Showcase Grid */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading department products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No products available in this department yet.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {products.map((item) => (
            <View key={`dept-${item._id}`} style={{ width: cardWidth }}>
              <ProductGridCard product={item} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingTop: 16,
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
    paddingRight: 8,
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
  viewDeptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  viewDeptText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 14,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  tabChipTextActive: {
    color: Colors.white,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  countTextActive: {
    color: Colors.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
  },
});
