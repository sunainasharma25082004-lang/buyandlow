import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Gradients } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SideDrawer from './SideDrawer';

export default function CustomHeader() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const wishlistCount = Array.isArray(user?.wishlist) ? user.wishlist.length : 0;

  return (
    <>
      <LinearGradient
        colors={Gradients.primaryHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setDrawerOpen(true)}
          accessibilityLabel="Open Menu"
          activeOpacity={0.7}
        >
          <Feather name="menu" size={22} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoWrapper}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.88}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/search')}
            accessibilityLabel="Search"
            activeOpacity={0.7}
          >
            <Feather name="search" size={20} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/wishlist')}
            accessibilityLabel="Wishlist"
            activeOpacity={0.7}
          >
            <Feather name="heart" size={20} color={Colors.white} />
            {wishlistCount > 0 && (
              <View style={styles.wishlistBadge}>
                <Text style={styles.wishlistBadgeText}>{wishlistCount > 9 ? '9+' : wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/cart')}
            accessibilityLabel="Cart"
            activeOpacity={0.7}
          >
            <Feather name="shopping-bag" size={20} color={Colors.white} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

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
    ...Shadows.medium,
    elevation: 6,
    zIndex: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  logoWrapper: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  logo: {
    height: 28,
    width: 120,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
  },
  wishlistBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  wishlistBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.white,
  },
});
