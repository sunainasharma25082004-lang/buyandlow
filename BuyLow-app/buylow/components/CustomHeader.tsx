import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/colors';
import { useCart } from '../context/CartContext';
import SideDrawer from './SideDrawer';

export default function CustomHeader() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setDrawerOpen(true)}>
          <Feather name="menu" size={22} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.logoWrapper}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/search')}>
            <Feather name="search" size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
            <Feather name="shopping-cart" size={20} color={Colors.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    ...Shadows.medium,
    elevation: 6,
    zIndex: 10,
  },
  logoWrapper: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  logo: {
    height: 30,
    width: 120,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cartBadge: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    top: 2,
    right: 2,
    backgroundColor: Colors.accent,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.primary,
  }
});
