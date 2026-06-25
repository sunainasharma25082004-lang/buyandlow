import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/colors';

export default function CustomHeader() {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/search')}>
          <Feather name="search" size={20} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
          <Feather name="shopping-cart" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
    elevation: 4, // for android shadow below header
    zIndex: 10,
  },
  logo: {
    height: 32,
    width: 140,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
});
