import React from 'react';
import { View, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Shadows } from '../../constants/colors';
import Skeleton from './Skeleton';
import {
  horizontalPadding,
  productCardWidth,
  productImageHeight,
} from '../../utils/responsive';

type Props = {
  count?: number;
};

export default function ProductRailSkeleton({ count = 4 }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={`rail-skeleton-${index}`} style={[styles.card, { width: productCardWidth }]}>
          <View style={[styles.imageWrap, { height: productImageHeight }]}>
            <Skeleton borderRadius={0} style={StyleSheet.absoluteFillObject as ViewStyle} />
          </View>
          <View style={styles.body}>
            <Skeleton width="40%" height={8} borderRadius={4} />
            <Skeleton width="90%" height={11} borderRadius={5} style={styles.gap} />
            <Skeleton width="55%" height={14} borderRadius={5} style={styles.gapLg} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  imageWrap: {
    backgroundColor: Colors.lightBlue,
    overflow: 'hidden',
    position: 'relative',
  },
  body: {
    padding: 10,
  },
  gap: {
    marginTop: 8,
  },
  gapLg: {
    marginTop: 10,
  },
});