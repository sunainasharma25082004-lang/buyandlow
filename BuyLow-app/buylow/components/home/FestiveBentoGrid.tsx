import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import RemoteImage from '../RemoteImage';

export default function FestiveBentoGrid() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive sizing
  const isTablet = width >= 768;
  const containerPadding = 16;
  const gridGap = 10;
  const availableWidth = Math.min(width, 1100) - (containerPadding * 2);

  // Left card takes ~45% on mobile, right 2x2 grid takes ~55%
  const leftWidth = Math.floor((availableWidth - gridGap) * 0.44);
  const rightTotalWidth = availableWidth - gridGap - leftWidth;
  const rightCardWidth = Math.floor((rightTotalWidth - gridGap) / 2);

  return (
    <View style={styles.container}>
      {/* Festive Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.ornamentLine} />
        <View style={styles.headerCenter}>
          <Text style={styles.festiveTag}>✦ BIG SAVINGS FESTIVAL ✦</Text>
          <Text style={styles.sectionTitle}>Celebrate With Direct Mill Deals</Text>
        </View>
        <View style={styles.ornamentLine} />
      </View>

      {/* Bento Grid */}
      <View style={[styles.bentoWrap, { gap: gridGap }]}>
        {/* Left Featured Big Card */}
        <TouchableOpacity
          style={[styles.bigCard, { width: leftWidth }]}
          onPress={() => router.push('/category/Electronics')}
          activeOpacity={0.88}
        >
          <View style={styles.bigCardHeader}>
            <View style={styles.flashTag}>
              <Text style={styles.flashTagText}>UP TO 70% OFF</Text>
            </View>
            <Text style={styles.bigCardSubtitle}>Electric Kettles</Text>
            <Text style={styles.bigCardTitle}>Starting at ₹109</Text>
          </View>

          <View style={styles.bigCardImageWrap}>
            <RemoteImage
              uri="https://images.unsplash.com/photo-1544816155-12df9643f363?w=500"
              style={styles.bigImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.bigCardFooter}>
            <View style={styles.shopNowPill}>
              <Text style={styles.shopNowText}>Shop Deals</Text>
              <Feather name="arrow-right" size={12} color="#92400E" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Right 2x2 Grid */}
        <View style={[styles.rightGrid, { width: rightTotalWidth, gap: gridGap }]}>
          {/* Card 1: Kitchen Tools */}
          <TouchableOpacity
            style={[styles.smallCard, { width: rightCardWidth, backgroundColor: '#EFF6FF' }]}
            onPress={() => router.push('/category/crockry')}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.smallCardTitle}>Kitchen</Text>
              <Text style={styles.smallCardSub}>From ₹99</Text>
            </View>
            <View style={styles.smallImageWrap}>
              <RemoteImage
                uri="https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=300"
                style={styles.smallImage}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>

          {/* Card 2: Crockery & Dining */}
          <TouchableOpacity
            style={[styles.smallCard, { width: rightCardWidth, backgroundColor: '#FEF3C7' }]}
            onPress={() => router.push('/category/crockry')}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.smallCardTitle}>Crockery</Text>
              <Text style={styles.smallCardSub}>From ₹109</Text>
            </View>
            <View style={styles.smallImageWrap}>
              <RemoteImage
                uri="https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=300"
                style={styles.smallImage}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>

          {/* Card 3: Home Audio */}
          <TouchableOpacity
            style={[styles.smallCard, { width: rightCardWidth, backgroundColor: '#F3E8FF' }]}
            onPress={() => router.push('/category/Electronics')}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.smallCardTitle}>Audio</Text>
              <Text style={styles.smallCardSub}>Factory Direct</Text>
            </View>
            <View style={styles.smallImageWrap}>
              <RemoteImage
                uri="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300"
                style={styles.smallImage}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>

          {/* Card 4: Home Utility */}
          <TouchableOpacity
            style={[styles.smallCard, { width: rightCardWidth, backgroundColor: '#ECFDF5' }]}
            onPress={() => router.push('/category/crockry')}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.smallCardTitle}>Storage</Text>
              <Text style={styles.smallCardSub}>From ₹119</Text>
            </View>
            <View style={styles.smallImageWrap}>
              <RemoteImage
                uri="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300"
                style={styles.smallImage}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF9EE', // Warm cream festive background
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 8,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FCD34D',
  },
  headerCenter: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  festiveTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#78350F',
    letterSpacing: -0.2,
  },
  bentoWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  bigCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    justifyContent: 'space-between',
    ...Shadows.small,
  },
  bigCardHeader: {
    marginBottom: 6,
  },
  flashTag: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  flashTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  bigCardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  bigCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#78350F',
    lineHeight: 18,
    marginTop: 2,
  },
  bigCardImageWrap: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  bigImage: {
    width: '100%',
    height: '100%',
  },
  bigCardFooter: {
    alignItems: 'flex-start',
  },
  shopNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#FCD34D',
  },
  shopNowText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  rightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallCard: {
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'space-between',
    height: 125,
    ...Shadows.small,
  },
  smallCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  smallCardSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  smallImageWrap: {
    height: 65,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
});
