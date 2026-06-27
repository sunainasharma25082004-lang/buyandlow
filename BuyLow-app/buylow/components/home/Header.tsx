import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import SideDrawer from '../SideDrawer';

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <View style={styles.container}>
        {/* Hamburger Menu */}
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.iconButton}>
          <Feather name="menu" size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
        </View>

        {/* Right Actions */}
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/search')}>
            <Feather name="search" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
            <Feather name="shopping-cart" size={22} color={Colors.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Drawer */}
      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logo: {
    height: 32,
    width: 130,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 18,
    height: 18,
    borderRadius: 9,
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
  },
});