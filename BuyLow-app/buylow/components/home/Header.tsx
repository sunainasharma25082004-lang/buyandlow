import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Shadows, Gradients } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SideDrawer from '../SideDrawer';

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const wishlistCount = Array.isArray(user?.wishlist) ? user.wishlist.length : 0;
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const deliveryCity = defaultAddress?.city ? `${defaultAddress.city} ${defaultAddress.postalCode || ''}` : 'India';

  return (
    <>
      <LinearGradient
        colors={Gradients.primaryHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
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
            activeOpacity={0.88}
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
              <Feather name="shopping-bag" size={20} color={Colors.white} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Ticker Row (Amazon / Flipkart Style) */}
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => router.push(user ? '/(tabs)/account/addresses' as any : '/(auth)/login')}
          activeOpacity={0.8}
        >
          <Ionicons name="location-sharp" size={13} color={Colors.accent} />
          <Text style={styles.locationLabel}>Deliver to:</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {user ? `${user.name?.split(' ')[0]} - ${deliveryCity}` : 'Select your delivery location'}
          </Text>
          <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Integrated Quick Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.92}
        >
          <View style={styles.searchInner}>
            <Feather name="search" size={18} color={Colors.primary} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              Search for products, brands & more...
            </Text>
          </View>
          <View style={styles.searchPill}>
            <Text style={styles.searchPillText}>Search</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* Side Drawer */}
      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    ...Shadows.medium,
    elevation: 8,
    zIndex: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoWrapper: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  logo: {
    height: 28,
    width: 125,
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
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
  },
  wishlistBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryDark,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  wishlistBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.white,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  locationText: {
    fontSize: 11.5,
    color: Colors.white,
    fontWeight: '700',
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    height: 44,
    ...Shadows.small,
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
    fontWeight: '500',
  },
  searchPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  searchPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
});