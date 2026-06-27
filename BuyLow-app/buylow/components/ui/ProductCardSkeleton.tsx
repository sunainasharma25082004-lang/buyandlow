import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, Shadows } from '../../constants/colors';
import Skeleton from './Skeleton';

export default function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Skeleton borderRadius={0} style={StyleSheet.absoluteFillObject as ViewStyle} />
      </View>
      <View style={styles.body}>
        <Skeleton width="42%" height={8} borderRadius={4} />
        <Skeleton width="88%" height={12} borderRadius={6} style={styles.gap} />
        <Skeleton width="72%" height={12} borderRadius={6} style={styles.gapSm} />
        <Skeleton width="48%" height={16} borderRadius={6} style={styles.gapLg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 12,
    ...Shadows.small,
  },
  imageWrap: {
    height: 140,
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
  gapSm: {
    marginTop: 6,
  },
  gapLg: {
    marginTop: 10,
  },
});