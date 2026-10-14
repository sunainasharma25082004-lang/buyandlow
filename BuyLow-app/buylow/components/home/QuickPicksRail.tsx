import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import RemoteImage from '../RemoteImage';

type PickItem = {
  id: string;
  label: string;
  image: string;
  route: string;
};

const PICKS: PickItem[] = [
  {
    id: 'kettles',
    label: 'Kettles',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300',
    route: '/category/Electronics',
  },
  {
    id: 'crockery',
    label: 'Crockery',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=300',
    route: '/category/crockry',
  },
  {
    id: 'mixers',
    label: 'Mixers',
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=300',
    route: '/category/crockry',
  },
  {
    id: 'audio',
    label: 'Sound & Audio',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300',
    route: '/category/Electronics',
  },
  {
    id: 'storage',
    label: 'Storage',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300',
    route: '/category/crockry',
  },
  {
    id: 'dining',
    label: 'Dining Set',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300',
    route: '/category/crockry',
  },
  {
    id: 'holders',
    label: 'Cutlery Stand',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300',
    route: '/category/crockry',
  },
];

export default function QuickPicksRail() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.bulletOrnament} />
        <Text style={styles.title}>Festive Quick Picks</Text>
        <View style={styles.bulletOrnament} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {PICKS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.pickItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <RemoteImage uri={item.image} style={styles.avatarImage} contentFit="cover" />
            </View>
            <Text style={styles.pickLabel} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF9EE',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bulletOrnament: {
    width: 24,
    height: 1,
    backgroundColor: '#F59E0B',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pickItem: {
    alignItems: 'center',
    width: 68,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  pickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78350F',
    textAlign: 'center',
  },
});
