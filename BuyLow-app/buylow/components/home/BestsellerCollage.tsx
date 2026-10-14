import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import RemoteImage from '../RemoteImage';

type CollageCard = {
  id: string;
  title: string;
  countBadge: string;
  route: string;
  images: [string, string, string, string];
};

const BESTSELLERS: CollageCard[] = [
  {
    id: 'crockery',
    title: 'Crockery & Dining',
    countBadge: '+56 more',
    route: '/category/crockry',
    images: [
      'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=200',
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=200',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200',
    ],
  },
  {
    id: 'electronics',
    title: 'Electronics & Audio',
    countBadge: '+93 more',
    route: '/category/Electronics',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200',
      'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=200',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    ],
  },
  {
    id: 'kitchen',
    title: 'Kitchen Essentials',
    countBadge: '+15 more',
    route: '/category/crockry',
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=200',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200',
    ],
  },
];

export default function BestsellerCollage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Bestsellers</Text>
          <Text style={styles.subtitle}>Most popular across India</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={() => router.push('/(tabs)/categories')}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Explore</Text>
          <Feather name="chevron-right" size={13} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BESTSELLERS.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => router.push(card.route as any)}
            activeOpacity={0.88}
          >
            {/* 2x2 Collage Container */}
            <View style={styles.collageGrid}>
              <View style={styles.collageRow}>
                <View style={styles.miniBox}>
                  <RemoteImage uri={card.images[0]} style={styles.miniImage} contentFit="contain" />
                </View>
                <View style={styles.miniBox}>
                  <RemoteImage uri={card.images[1]} style={styles.miniImage} contentFit="contain" />
                </View>
              </View>
              <View style={styles.collageRow}>
                <View style={styles.miniBox}>
                  <RemoteImage uri={card.images[2]} style={styles.miniImage} contentFit="contain" />
                </View>
                <View style={styles.miniBox}>
                  <RemoteImage uri={card.images[3]} style={styles.miniImage} contentFit="contain" />
                </View>
              </View>

              {/* Count Overlay Badge */}
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{card.countBadge}</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.cardTitle} numberOfLines={1}>
              {card.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
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
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    width: 142,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  collageGrid: {
    width: 124,
    height: 124,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  collageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
  },
  miniBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniImage: {
    width: '100%',
    height: '100%',
  },
  countBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  countText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.white,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
});
