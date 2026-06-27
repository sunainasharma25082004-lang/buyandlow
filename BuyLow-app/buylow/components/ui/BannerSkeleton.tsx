import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Shadows } from '../../constants/colors';
import Skeleton from './Skeleton';
import { SCREEN_WIDTH, horizontalPadding, isTablet } from '../../utils/responsive';

const bannerHeight = isTablet ? 220 : Math.min(SCREEN_WIDTH * 0.48, 200);

export default function BannerSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Skeleton borderRadius={18} style={StyleSheet.absoluteFillObject as ViewStyle} />
        <View style={styles.content}>
          <Skeleton width={90} height={10} borderRadius={5} />
          <Skeleton width={160} height={22} borderRadius={8} style={styles.gap} />
          <Skeleton width={120} height={22} borderRadius={8} style={styles.gapSm} />
          <Skeleton width={140} height={11} borderRadius={5} style={styles.gapMd} />
          <Skeleton width={96} height={30} borderRadius={20} style={styles.gapLg} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalPadding,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  banner: {
    width: SCREEN_WIDTH - horizontalPadding * 2,
    height: bannerHeight,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.medium,
  },
  content: {
    position: 'absolute',
    left: 22,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    width: '62%',
  },
  gap: {
    marginTop: 10,
  },
  gapSm: {
    marginTop: 6,
  },
  gapMd: {
    marginTop: 10,
  },
  gapLg: {
    marginTop: 14,
  },
});