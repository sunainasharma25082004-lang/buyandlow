import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { FREE_SHIPPING_MIN } from '../../constants/shop';

export default function BestOffers() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Shopping Benefits & Assurances</Text>
          <Text style={styles.subtitle}>Verified service promises for every order</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Card 1: Free Shipping on ₹999+ */}
        <View style={[styles.offerCard, styles.cardGreen]}>
          <View style={styles.topBadgeRow}>
            <View style={[styles.pillTag, styles.pillTagGreen]}>
              <Text style={[styles.pillTagText, styles.pillTagTextGreen]}>FREE SHIPPING</Text>
            </View>
            <Feather name="truck" size={18} color="#059669" />
          </View>

          <Text style={styles.cardTitle}>Zero Delivery Charges</Text>
          <Text style={styles.cardSubtitle}>
            Enjoy free doorstep shipping on all orders of ₹{FREE_SHIPPING_MIN} and above automatically.
          </Text>

          <TouchableOpacity
            style={styles.actionBtnGreen}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnTextGreen}>Shop Catalog</Text>
            <Feather name="arrow-right" size={12} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* Card 2: 100% Genuine Direct Sourcing */}
        <View style={[styles.offerCard, styles.cardBlue]}>
          <View style={styles.topBadgeRow}>
            <View style={styles.pillTag}>
              <Text style={styles.pillTagText}>DIRECT SOURCED</Text>
            </View>
            <Ionicons name="shield-checkmark" size={19} color="#2563EB" />
          </View>

          <Text style={styles.cardTitle}>151+ Verified Products</Text>
          <Text style={styles.cardSubtitle}>
            Every product is directly sourced from manufacturers with genuine quality verification.
          </Text>

          <TouchableOpacity
            style={styles.actionBtnBlue}
            onPress={() => router.push('/(tabs)/categories')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnTextBlue}>Explore Categories</Text>
            <Feather name="arrow-right" size={12} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Card 3: Secure Payments & COD */}
        <View style={[styles.offerCard, styles.cardAmber]}>
          <View style={styles.topBadgeRow}>
            <View style={[styles.pillTag, styles.pillTagAmber]}>
              <Text style={[styles.pillTagText, styles.pillTagTextAmber]}>SECURE PAYMENTS</Text>
            </View>
            <Feather name="lock" size={18} color="#D97706" />
          </View>

          <Text style={styles.cardTitle}>UPI, Cards & COD</Text>
          <Text style={styles.cardSubtitle}>
            Pay securely with Razorpay UPI, Debit/Credit Cards, or choose Cash on Delivery at doorstep.
          </Text>

          <TouchableOpacity
            style={styles.actionBtnAmber}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnTextAmber}>View Deals</Text>
            <Feather name="arrow-right" size={12} color="#D97706" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  offerCard: {
    width: 250,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    ...Shadows.small,
  },
  cardGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cardBlue: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DBEAFE',
  },
  cardAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pillTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  pillTagGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  pillTagTextGreen: {
    color: '#15803D',
  },
  pillTagAmber: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  pillTagTextAmber: {
    color: '#B45309',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 14,
  },
  actionBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  actionBtnTextGreen: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  actionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionBtnTextBlue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionBtnAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  actionBtnTextAmber: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
  },
});
