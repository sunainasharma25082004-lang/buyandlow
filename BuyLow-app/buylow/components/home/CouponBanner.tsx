import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function CouponBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.iconContainer}>
          <Feather name="credit-card" size={24} color={Colors.secondary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Extra 10% Off</Text>
          <Text style={styles.subtitle}>on all Prepaid Orders</Text>
        </View>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Use Code:</Text>
          <Text style={styles.code}>BUYLOW10</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 2,
  },
  codeContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  codeLabel: {
    color: Colors.white,
    fontSize: 10,
  },
  code: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  }
});