import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createOrder, verifyPayment, formatINR } from '../services/api';
import { FREE_SHIPPING_MIN, getShippingPrice } from '../constants/shop';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { openRazorpayOnWeb, RazorpaySuccess, supportsWebRazorpay } from '../utils/razorpay';
import type { SavedAddress } from '../types/api';
import LocationSelectCard, { CURRENT_LOCATION_ID } from '../components/LocationSelectCard';
import type { GeocodedAddress } from '../utils/location';
import { isDeliveryAllowed, DELIVERY_CONFIG } from '../constants/delivery';

type PaymentMethod = 'razorpay';

const applyAddress = (
  addr: SavedAddress,
  setters: {
    setAddress: (v: string) => void;
    setCity: (v: string) => void;
    setPostalCode: (v: string) => void;
    setPhone: (v: string) => void;
  },
) => {
  setters.setAddress(addr.address || '');
  setters.setCity(addr.city || '');
  setters.setPostalCode(addr.postalCode || '');
  setters.setPhone(addr.phone || '');
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Zirakpur');
  const [postalCode, setPostalCode] = useState('');
  const country = t('checkout.country');
  const [phone, setPhone] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [locationPreview, setLocationPreview] = useState<GeocodedAddress | null>(null);

  const savedAddresses = useMemo(() => user?.addresses || [], [user?.addresses]);

  const handleSelectCurrentLocation = (loc: GeocodedAddress) => {
    setSelectedAddressId(CURRENT_LOCATION_ID);
    setLocationPreview(loc);
    setAddress(loc.address || '');
    setCity(loc.city || '');
    setPostalCode(loc.postalCode || '');
    if (!phone && user?.phone) {
      setPhone(user.phone);
    }
  };

  useEffect(() => {
    // Only razorpay is supported
    setPaymentMethod('razorpay');
  }, [user?.paymentPreference]);

  useEffect(() => {
    if (savedAddresses.length === 0) {
      if (user?.phone) {
        setPhone((prev) => prev || user.phone || '');
      }
      return;
    }

    if (!selectedAddressId) {
      const defaultAddr = savedAddresses.find((item) => item.isDefault) || savedAddresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id || null);
        applyAddress(defaultAddr, { setAddress, setCity, setPostalCode, setPhone });
      }
    }
  }, [savedAddresses, user?.phone, selectedAddressId]);

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr._id || null);
    setLocationPreview(null);
    applyAddress(addr, { setAddress, setCity, setPostalCode, setPhone });
  };

  const shippingPrice = getShippingPrice(cartTotal);
  const grandTotal = cartTotal + shippingPrice;

  const buildOrderPayload = () => {
    const orderItems = cart
      .map((item) => {
        const p = typeof item.product === 'string' ? null : item.product;
        if (!p?._id) return null;
        return {
          product: p._id,
          name: p.name,
          image: p.image,
          price: p.price,
          quantity: item.quantity,
          color: item.color,
        };
      })
      .filter(Boolean);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    return {
      orderItems,
      shippingAddress: {
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country || 'India',
        phone: cleanPhone,
      },
      paymentMethod: 'Razorpay',
      itemsPrice: cartTotal,
      shippingPrice,
      totalPrice: grandTotal,
    };
  };

  const finishOrder = async () => {
    await clearCart();
    Alert.alert(t('checkout.orderConfirmed'), t('checkout.orderConfirmedMsg'), [
      { text: t('common.viewOrders'), onPress: () => router.replace('/(tabs)/orders') },
    ]);
  };

  const handleRazorpaySuccess = async (payload: RazorpaySuccess) => {
    setShowRazorpay(false);
    setLoading(true);
    try {
      if (!token) throw new Error(t('checkout.sessionExpired'));
      const res = await verifyPayment(
        {
          razorpayOrderId: payload.razorpay_order_id,
          razorpayPaymentId: payload.razorpay_payment_id,
          razorpaySignature: payload.razorpay_signature,
        },
        token,
      );
      if (!res.success) throw new Error(res.message || t('checkout.paymentVerificationFailed'));
      await finishOrder();
    } catch (err: any) {
      Alert.alert(t('checkout.paymentFailed'), err.message || t('checkout.paymentVerificationFailed'));
    } finally {
      setLoading(false);
      setPaymentSession(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (loading) return;
    if (cart.length === 0) {
      Alert.alert(t('common.error'), 'Your cart is empty.');
      router.replace('/cart');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanPostal = postalCode.trim();
    if (!address.trim() || !city.trim() || cleanPostal.length !== 6 || !/^\d{6}$/.test(cleanPostal) || cleanPhone.length < 10) {
      Alert.alert(t('common.error'), 'Please fill in a valid full address, a 6-digit PIN code, and a 10-digit mobile number.');
      return;
    }
    if (!isDeliveryAllowed(city, cleanPostal)) {
      Alert.alert('Delivery Restricted', DELIVERY_CONFIG.errorMessage);
      return;
    }
    if (!token) {
      Alert.alert(t('auth.loginRequired'), t('auth.loginToOrder'), [
        { text: t('common.login'), onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await createOrder(buildOrderPayload(), token);

      if (res.simulated) {
        const verifyRes = await verifyPayment(
          { razorpayOrderId: res.razorpayOrderId, simulated: true },
          token,
        );
        if (!verifyRes.success) throw new Error('Simulated payment failed');
        await finishOrder();
        return;
      }

      if (!res.key_id && !res.simulated) {
        throw new Error(t('checkout.razorpayNotConfigured'));
      }

      if (supportsWebRazorpay) {
        setPaymentSession(res);
        setLoading(false);
        await openRazorpayOnWeb({
          keyId: res.key_id,
          amount: res.amount,
          currency: res.currency || 'INR',
          razorpayOrderId: res.razorpayOrderId,
          userName: user?.name,
          userEmail: user?.email,
          userPhone: cleanPhone,
          onSuccess: handleRazorpaySuccess,
          onDismiss: () => setPaymentSession(null),
          onError: (message) => {
            Alert.alert(t('checkout.paymentFailed'), message);
            setPaymentSession(null);
          },
        });
        return;
      }

      setPaymentSession(res);
      setShowRazorpay(true);
    } catch (err: any) {
      Alert.alert(t('checkout.checkoutFailed'), err.message || t('checkout.checkoutFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Checkout Steps Header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumberActive}>1</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Address</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCircleActive]}>
            <Text style={styles.stepNumberActive}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Payment</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirm</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Shipping Address Section */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Feather name="map-pin" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>{t('checkout.shippingAddress')}</Text>
              {savedAddresses.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/account/addresses' as any)}>
                  <Text style={styles.manageLink}>{t('common.manage')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.chooseHint}>{t('checkout.chooseAddress')}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.savedScroll}
              contentContainerStyle={styles.savedScrollContent}
            >
              <LocationSelectCard
                selected={selectedAddressId === CURRENT_LOCATION_ID}
                preview={locationPreview}
                onSelect={handleSelectCurrentLocation}
              />
              {savedAddresses.map((addr) => {
                const active = selectedAddressId === addr._id;
                return (
                  <TouchableOpacity
                    key={addr._id || addr.address}
                    style={[styles.savedCard, active && styles.savedCardActive]}
                    onPress={() => handleSelectAddress(addr)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.savedCardTop}>
                      <Text style={styles.savedLabel}>{addr.label}</Text>
                      {active ? (
                        <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                      ) : null}
                    </View>
                    <Text style={styles.savedText} numberOfLines={2}>
                      {addr.address}
                    </Text>
                    <Text style={styles.savedMeta}>
                      {addr.city} · {addr.postalCode}
                    </Text>
                    {addr.isDefault && <Text style={styles.savedDefault}>{t('common.default')}</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.label}>{t('checkout.fullAddress')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('checkout.addressPlaceholder')}
                placeholderTextColor={Colors.textLight}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('checkout.city')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Zirakpur"
                    placeholderTextColor={Colors.textLight}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <Text style={{ fontSize: 11, color: Colors.primary, marginTop: 4 }}>
                  📍 Delivery available in Zirakpur only
                </Text>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('checkout.pinCode')}</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="140603 or 140604"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    maxLength={6}
                    value={postalCode}
                    onChangeText={setPostalCode}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>{t('common.phone')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('checkout.phonePlaceholder')}
                placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Payment Method Section */}
          <View style={styles.cardSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
            </View>

            <View
              style={[styles.payOption, styles.payOptionActive]}
            >
              <View style={styles.payIconBox}>
                <Ionicons name="card-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.payTextWrap}>
                <Text style={styles.payOptionTitle}>Razorpay Online (UPI, Cards, NetBanking)</Text>
                <Text style={styles.payOptionDesc}>Instant & 100% secure encrypted payment</Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.primary}
              />
            </View>
          </View>

          {/* Price Summary Section */}
          <View style={styles.cardSection}>
            <Text style={styles.summaryTitle}>{t('checkout.orderSummary')}</Text>
            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.subtotal')}</Text>
              <Text style={styles.summaryValue}>₹{formatINR(cartTotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.shipping')}</Text>
              <Text style={[styles.summaryValue, shippingPrice === 0 && { color: '#16A34A' }]}>
                {shippingPrice === 0 ? t('common.free') : `₹${formatINR(shippingPrice)}`}
              </Text>
            </View>

            {cartTotal < FREE_SHIPPING_MIN && (
              <Text style={styles.shippingHint}>
                {t('checkout.freeShippingHint', { amount: formatINR(FREE_SHIPPING_MIN - cartTotal) })}
              </Text>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('checkout.grandTotal')}</Text>
              <Text style={styles.totalValue}>₹{formatINR(grandTotal)}</Text>
            </View>
          </View>

          {/* Place Order CTA Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handlePlaceOrder}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {`Pay ₹${formatINR(grandTotal)} with Razorpay`}
                </Text>
                <Feather name="lock" size={16} color={Colors.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <MaterialIcons name="security" size={16} color="#059669" />
            <Text style={styles.securityNoteText}>
              256-Bit SSL Encrypted & Verified Checkout
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {paymentSession && (
        <RazorpayCheckout
          visible={showRazorpay}
          keyId={paymentSession.key_id}
          amount={paymentSession.amount}
          currency={paymentSession.currency || 'INR'}
          razorpayOrderId={paymentSession.razorpayOrderId}
          userName={user?.name}
          userEmail={user?.email}
          userPhone={phone}
          onSuccess={handleRazorpaySuccess}
          onDismiss={() => {
            setShowRazorpay(false);
            setPaymentSession(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
  },
  stepNumberActive: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
    gap: 14,
  },
  cardSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  manageLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  savedScroll: {
    marginBottom: 14,
    marginHorizontal: -4,
  },
  savedScrollContent: {
    gap: 10,
    paddingHorizontal: 4,
  },
  savedCard: {
    width: 160,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  savedCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  savedCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  savedLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.text,
  },
  savedText: {
    fontSize: 11.5,
    color: Colors.textLight,
    lineHeight: 16,
  },
  savedMeta: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
  },
  savedDefault: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  chooseHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 10,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    minHeight: 46,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: Colors.text,
    paddingVertical: Platform.OS === 'android' ? 6 : 8,
  },
  row: {
    flexDirection: 'row',
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  payOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  payIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  payTextWrap: {
    flex: 1,
  },
  payOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.text,
  },
  payOptionDesc: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 13.5,
    color: Colors.text,
    fontWeight: '700',
  },
  shippingHint: {
    fontSize: 11,
    color: Colors.primary,
    marginBottom: 6,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  button: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    ...Shadows.medium,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  securityNoteText: {
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '600',
  },
});