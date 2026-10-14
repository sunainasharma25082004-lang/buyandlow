import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../constants/colors';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SideDrawer from '../SideDrawer';
import QuickCategoryNav from './QuickCategoryNav';

export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const addressLabel = defaultAddress?.label || 'HOME';
  const addressDetail = defaultAddress?.city
    ? `${defaultAddress.city}${defaultAddress.postalCode ? `, ${defaultAddress.postalCode}` : ''}`
    : 'Select your pincode for fast delivery';

  return (
    <>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 12 : 8) }]}>
        {/* Row 1: Delivery ETA, Location & Profile/Rewards */}
        <View style={styles.topBar}>
          {/* Left: Express Delivery Tag & Address Picker */}
          <TouchableOpacity
            style={styles.locationBlock}
            onPress={() => router.push(user ? ('/(tabs)/account/addresses' as any) : '/(auth)/login')}
            activeOpacity={0.8}
          >
            <View style={styles.etaRow}>
              <View style={styles.lightningWrap}>
                <Ionicons name="flash" size={11} color="#FFFFFF" />
              </View>
              <Text style={styles.etaBrand}>BuyLow Express</Text>
              <View style={styles.etaPill}>
                <Text style={styles.etaPillText}>15-25 Mins</Text>
              </View>
            </View>

            <View style={styles.addressRow}>
              <Text style={styles.addressType}>{addressLabel} -</Text>
              <Text style={styles.addressText} numberOfLines={1}>
                {addressDetail}
              </Text>
              <Feather name="chevron-down" size={13} color="#0F172A" />
            </View>
          </TouchableOpacity>

          {/* Right: Rewards Coins & Profile Avatar */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.rewardsPill}
              onPress={() => router.push('/(tabs)/account' as any)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bitcoin" size={15} color="#D97706" />
              <Text style={styles.rewardsText}>50</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={() => setDrawerOpen(true)}
              activeOpacity={0.8}
              accessibilityLabel="Account Menu"
            >
              {user?.name ? (
                <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
              ) : (
                <Feather name="user" size={16} color="#0F172A" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Flipkart / Blinkit Style Search Pill with Voice Mic */}
        <View style={styles.searchWrapper}>
          <TouchableOpacity
            style={styles.searchPill}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.92}
          >
            <Feather name="search" size={17} color="#475569" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              Search for kettles, crockery, iron and more
            </Text>
            <TouchableOpacity
              style={styles.micBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.7}
            >
              <Feather name="mic" size={16} color="#0F172A" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Row 3: Horizontal Category Sub-Nav Icon Strip */}
        <QuickCategoryNav />
      </View>

      {/* Side Drawer Modal */}
      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBEB', // Light warm festive tint matching screenshot 4
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    ...Shadows.small,
    elevation: 3,
    zIndex: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  locationBlock: {
    flex: 1,
    paddingRight: 10,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  lightningWrap: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#059669', // Express green
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaBrand: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  etaPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  etaPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  addressText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    maxWidth: 160,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  rewardsText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#92400E',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  avatarInitial: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.primary,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 12.5,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
  },
  micBtn: {
    padding: 6,
    marginLeft: 4,
  },
});