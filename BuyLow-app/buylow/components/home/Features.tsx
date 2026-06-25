import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const features = [
  { icon: 'award', text: 'Lowest\nPrices' },
  { icon: 'check-circle', text: '100%\nOriginal' },
  { icon: 'truck', text: 'Fast & Free\nDelivery' },
  { icon: 'refresh-ccw', text: 'Easy\nReturns' },
  { icon: 'headphones', text: '24x7\nSupport' },
];

export default function Features() {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {features.map((item, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Feather name={item.icon as any} size={24} color={Colors.primary} />
            </View>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    marginTop: 8,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 20,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  featureItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    textAlign: 'center',
    color: Colors.text,
    fontWeight: '500',
  }
});