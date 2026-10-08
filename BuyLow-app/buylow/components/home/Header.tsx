import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SideDrawer from '../SideDrawer';

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const wishlistCount = Array.isArray(user?.wishlist) ? user.wishlist.length : 0;

  return (
    <>
      <View style={styles.container}>
        {/* Top Navigation Row */}
        <View style={styles.topRow}>
          {/* Hamburger Menu */}
          <TouchableOpacity
            onPress={() => setDrawerOpen(true)}
            style={styles.iconButton}
            accessibilityLabel="Open Menu"
            activeOpacity={0.7}
          >
            <Feather name="menu" size={22} color={Colors.white} />
          </TouchableOpacity>

          {/* Logo */}
          <TouchableOpacity
            style={styles.logoWrapper}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
          >
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </TouchableOpacity>

          {/* Right Action Icons: Wishlist & Cart */}
          <View style={styles.iconGroup}>
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
              accessibilityLabel="Shopping Cart"
              activeOpacity={0.7}
            >
              <Feather name="shopping-cart" size={20} color={Colors.white} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Integrated Quick Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.9}
        >
          <View style={styles.searchInner}>
            <Feather name="search" size={17} color={Colors.primary} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              Search products, electronics, kitchenware...
            </Text>
          </View>
          <View style={styles.searchPill}>
            <Text style={styles.searchPillText}>Search</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Side Drawer */}
      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    ...Shadows.medium,
    elevation: 6,
    zIndex: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoWrapper: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logo: {
    height: 30,
    width: 124,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  wishlistBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  wishlistBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: Colors.textLight,
    flex: 1,
  },
  searchPill: {
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});