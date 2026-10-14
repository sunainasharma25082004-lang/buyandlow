import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getSaleProducts } from '../../services/api';
import type { Product } from '../../types/api';
import ProductGridCard from './ProductGridCard';
import { useLanguage } from '../../context/LanguageContext';

export default function FeaturedDeals() {
  const router = useRouter();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealExpiry, setDealExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    let active = true;
    getSaleProducts(4)
      .then((res) => {
        if (!active) return;
        const list = res.products || [];
        setProducts(list);

        // Check if any product has a valid future expiry timestamp from backend
        const itemWithExpiry = list.find((p: any) => p.dealExpiresAt || p.expiryDate);
        if (itemWithExpiry) {
          const expTime = new Date((itemWithExpiry as any).dealExpiresAt || (itemWithExpiry as any).expiryDate).getTime();
          if (!isNaN(expTime) && expTime > Date.now()) {
            setDealExpiry(expTime);
          }
        }
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
  }, []);

  // Update timer only if a valid backend dealExpiry exists
  useEffect(() => {
    if (!dealExpiry) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = dealExpiry - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dealExpiry]);

  if (!loading && products.length === 0) {
    return null;
  }

  // Calculate card width for 2-column grid
  const containerPadding = 16;
  const gap = 12;
  const isTablet = width >= 768;
  const numColumns = isTablet ? 4 : 2;
  const totalGaps = gap * (numColumns - 1);
  const availableWidth = Math.min(width, 1100) - (containerPadding * 2) - totalGaps;
  const cardWidth = Math.floor(availableWidth / numColumns);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Deals Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <View style={styles.flashBadge}>
              <Feather name="zap" size={11} color="#DC2626" />
              <Text style={styles.flashBadgeText}>FEATURED DEALS</Text>
            </View>
            {timeLeft ? (
              <View style={styles.timerWrap}>
                <Feather name="clock" size={10} color="#64748B" />
                <Text style={styles.timerText}>
                  {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.title}>{t('home.topDeals') || 'Featured Deals'}</Text>
          <Text style={styles.subtitle}>Verified discounts on catalog products</Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>{t('common.viewAll') || 'View All'}</Text>
          <Feather name="chevron-right" size={13} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.loadingText}>{"Loading today's deals..."}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {products.map((item) => (
            <View key={`deal-${item._id}`} style={{ width: cardWidth }}>
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  flashBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  flashBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    fontVariant: ['tabular-nums'],
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
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
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
});
