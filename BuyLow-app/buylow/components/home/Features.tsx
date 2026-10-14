import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useLanguage } from '../../context/LanguageContext';

export default function Features() {
  const { t } = useLanguage();

  const trustBadges = [
    {
      id: 'genuine',
      icon: <Ionicons name="shield-checkmark" size={18} color="#059669" />,
      bg: '#D1FAE5',
      title: '100% Genuine',
      sub: 'Direct Sourced',
    },
    {
      id: 'shipping',
      icon: <Feather name="truck" size={18} color="#2563EB" />,
      bg: '#DBEAFE',
      title: 'Free Shipping',
      sub: 'Orders ₹999+',
    },
    {
      id: 'dispatch',
      icon: <Feather name="box" size={18} color="#D97706" />,
      bg: '#FEF3C7',
      title: 'Fast Dispatch',
      sub: 'Direct Warehouse',
    },
    {
      id: 'payments',
      icon: <Feather name="lock" size={17} color="#7C3AED" />,
      bg: '#EDE9FE',
      title: 'Safe Payments',
      sub: 'UPI, Cards & COD',
    },
    {
      id: 'support',
      icon: <Feather name="headphones" size={18} color="#BE123C" />,
      bg: '#FFE4E6',
      title: 'Customer Care',
      sub: 'Dedicated Support',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {trustBadges.map((item) => (
          <View key={item.id} style={styles.badgeItem}>
            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
              {item.icon}
            </View>
            <Text style={styles.badgeTitle}>{item.title}</Text>
            <Text style={styles.badgeSub}>{item.sub}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    width: 96,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 14,
  },
  badgeSub: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
});