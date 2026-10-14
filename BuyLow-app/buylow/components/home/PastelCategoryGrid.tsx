import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import RemoteImage from '../RemoteImage';

type CategoryItem = {
  id: string;
  name: string;
  bgColor: string;
  image: string;
  route: string;
};

const ITEMS: CategoryItem[] = [
  {
    id: 'kettles',
    name: 'Electric Kettles',
    bgColor: '#E0F2FE', // Soft sky blue
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300',
    route: '/category/Electronics',
  },
  {
    id: 'crockery',
    name: 'Table Crockery',
    bgColor: '#FEF3C7', // Soft warm amber
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=300',
    route: '/category/crockry',
  },
  {
    id: 'kitchenware',
    name: 'Mixers & Choppers',
    bgColor: '#FFE4E6', // Soft rose pink
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=300',
    route: '/category/crockry',
  },
  {
    id: 'audio',
    name: 'Sound & Audio',
    bgColor: '#CCFBF1', // Soft mint teal
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300',
    route: '/category/Electronics',
  },
  {
    id: 'stands',
    name: 'Napkin Stands',
    bgColor: '#FFEDD5', // Soft warm peach
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300',
    route: '/category/crockry',
  },
  {
    id: 'storage',
    name: 'Cutlery & Storage',
    bgColor: '#F3E8FF', // Soft lavender
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300',
    route: '/category/crockry',
  },
  {
    id: 'glassware',
    name: 'Dining Glassware',
    bgColor: '#DBEAFE', // Soft indigo blue
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300',
    route: '/category/crockry',
  },
  {
    id: 'appliances',
    name: 'Home Utility',
    bgColor: '#DCFCE7', // Soft emerald green
    image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=300',
    route: '/category/Electronics',
  },
];

export default function PastelCategoryGrid() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // 4 items per row layout
  const numColumns = 4;
  const containerPadding = 16;
  const gap = 10;
  const availableWidth = Math.min(width, 1100) - (containerPadding * 2) - (gap * (numColumns - 1));
  const cardWidth = Math.floor(availableWidth / numColumns);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Household & Kitchen Essentials</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/categories')} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.grid, { gap }]}>
        {ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemWrap, { width: cardWidth }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.82}
          >
            {/* Pastel rounded background card */}
            <View style={[styles.card, { backgroundColor: item.bgColor }]}>
              <RemoteImage uri={item.image} style={styles.image} contentFit="contain" />
            </View>

            {/* Label below */}
            <Text style={styles.label} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  card: {
    width: '100%',
    height: 78,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Shadows.small,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 14,
  },
});
