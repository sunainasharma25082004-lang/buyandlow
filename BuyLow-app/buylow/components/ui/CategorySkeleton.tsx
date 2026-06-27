import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

type Props = {
  count?: number;
};

export default function CategorySkeleton({ count = 6 }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={`cat-skeleton-${index}`} style={styles.item}>
          <Skeleton width={60} height={60} borderRadius={30} />
          <Skeleton width={52} height={10} borderRadius={5} style={styles.label} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  label: {
    marginTop: 8,
  },
});