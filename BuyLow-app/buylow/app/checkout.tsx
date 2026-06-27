import React, { useEffect, useState } from 'react';
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
import { createOrder, verifyPayment, formatINR } from '../services/api';
import { FREE_SHIPPING_MIN, getShippingPrice } from '../constants/shop';
import { Feather, Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { openRazorpayOnWeb, RazorpaySuccess, supportsWebRazorpay } from '../utils/razorpay';
import type { SavedAddress } from '../types/api';
import LocationSelectCard, { CURRENT_LOCATION_ID } from '../components/LocationSelectCard';
import type { GeocodedAddress } from '../utils/location';

type PaymentMethod = 'razorpay' | 'cod';

const applyAddress = (
  addr: SavedAddress,
  setters: {
    setAddress: (v: string) => void;
    setCity: (v: string) => void;
    setPostalCode: (v: string) => void;
    setPhone: (v: string) => void;
  },
) => {
  setters.setAddress(addr.address);
  setters.setCity(addr.city);
  setters.setPostalCode(addr.postalCode);
  setters.setPhone(addr.phone);
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const country = 'India';
  const [phone, setPhone] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [locationPreview, setLocationPreview] = useState<GeocodedAddress | null>(null);

  const savedAddresses = user?.addresses || [];

  const handleSelectCurrentLocation = (loc: GeocodedAddress) => {
    setSelectedAddressId(CURRENT_LOCATION_ID);
    setLocationPreview(loc);
    setAddress(loc.address);
    setCity(loc.city);
    setPostalCode(loc.postalCode);
    if (!phone && user?.phone) {
      setPhone(user.phone);
    }
  };

  useEffect(() => {
    if (user?.paymentPreference) {
      setPaymentMethod(user.paymentPreference);
    }
  }, [user?.paymentPreference]);

  useEffect(() => {
    if (savedAddresses.length === 0) {
      if (user?.phone && !phone) {
        setPhone(user.phone);
      }
      return;
    }

    const defaultAddr = savedAddresses.find((item) => item.isDefault) || savedAddresses[0];
    if (defaultAddr && !selectedAddressId) {
      setSelectedAddressId(defaultAddr._id || null);
      applyAddress(defaultAddr, { setAddress, setCity, setPostalCode, setPhone });
    }
  }, [savedAddresses, user?.phone]);

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

    return {
      orderItems,
      shippingAddress: {
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country,
        phone: phone.trim(),
      },
      paymentMethod: paymentMethod === 'cod' ? 'Cash On Delivery' : 'Razorpay',
      itemsPrice: cartTotal,
      shippingPrice,
      totalPrice: grandTotal,
    };
  };

  const finishOrder = async () => {
    await clearCart();
    Alert.alert('Order Confirmed!', 'Your order has been placed successfully.', [
      { text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') },
    ]);
  };

  const handleRazorpaySuccess = async (payload: RazorpaySuccess) => {
    setShowRazorpay(false);
    setLoading(true);
    try {
      if (!token) throw new Error('Session expired. Please login again.');
      const res = await verifyPayment(
        {
          razorpayOrderId: payload.razorpay_order_id,
          razorpayPaymentId: payload.razorpay_payment_id,
          razorpaySignature: payload.razorpay_signature,
        },
        token,
      );
      if (!res.success) throw new Error(res.message || 'Payment verification failed');
      await finishOrder();
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Could not verify payment');
    } finally {
      setLoading(false);
      setPaymentSession(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim() || !city.trim() || !postalCode.trim() || !phone.trim()) {
      Alert.alert('Details Missing', 'Please fill in all shipping details.');
      return;
    }
    if (!token) {
      Alert.alert('Login Required', 'Please login to place your order.', [
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await createOrder(buildOrderPayload(), token);

      if (paymentMethod === 'cod') {
        await finishOrder();
        return;
      }

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
        throw new Error('Razorpay is not configured on the server. Try Cash on Delivery.');
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
          userPhone: phone,
          onSuccess: handleRazorpaySuccess,
          onDismiss: () => setPaymentSession(null),
          onError: (message) => {
            Alert.alert('Payment Failed', message);
            setPaymentSession(null);
          },
        });
        return;
      }

      setPaymentSession(res);
      setShowRazorpay(true);
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            {savedAddresses.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/account/addresses' as any)}>
                <Text style={styles.manageLink}>Manage</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.chooseHint}>
            Saved address choose karo ya apni current location select karo
          </Text>

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
                >
                  <Text style={styles.savedLabel}>{addr.label}</Text>
                  <Text style={styles.savedText} numberOfLines={2}>{addr.address}</Text>
                  <Text style={styles.savedMeta}>{addr.city} · {addr.postalCode}</Text>
                  {addr.isDefault && <Text style={styles.savedDefault}>Default</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Full Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="House No, Street, Area"
              placeholderTextColor={Colors.textLight}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
              </View>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>PIN Code</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="110001"
                  keyboardType="numeric"
                  maxLength={6}
                  value={postalCode}
                  onChangeText={setPostalCode}
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Phone</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{formatINR(cartTotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, shippingPrice === 0 && { color: Colors.success }]}>
                {shippingPrice === 0 ? 'FREE' : `₹${formatINR(shippingPrice)}`}
              </Text>
            </View>
            {cartTotal < FREE_SHIPPING_MIN && (
              <Text style={styles.shippingHint}>
                Add ₹{formatINR(FREE_SHIPPING_MIN - cartTotal)} more for free shipping
              </Text>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{formatINR(grandTotal)}</Text>
            </View>
          </View>

          <Text style={styles.payTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'razorpay' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('razorpay')}
          >
            <Ionicons name="card-outline" size={22} color={Colors.primary} />
            <View style={styles.payTextWrap}>
              <Text style={styles.payOptionTitle}>Razorpay (UPI / Card / NetBanking)</Text>
              <Text style={styles.payOptionDesc}>Same secure checkout as website</Text>
            </View>
            {paymentMethod === 'razorpay' && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'cod' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Ionicons name="cash-outline" size={22} color={Colors.primary} />
            <View style={styles.payTextWrap}>
              <Text style={styles.payOptionTitle}>Cash on Delivery</Text>
              <Text style={styles.payOptionDesc}>Pay when your order arrives</Text>
            </View>
            {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handlePlaceOrder} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {paymentMethod === 'razorpay' ? 'Pay with Razorpay' : 'Place COD Order'}
                </Text>
                <Feather name="lock" size={16} color={Colors.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
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
  root: { flex: 1, backgroundColor: Colors.background },
  keyboardView: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.text },
  manageLink: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  savedScroll: { marginBottom: 14, marginHorizontal: -4 },
  savedScrollContent: { gap: 10, paddingHorizontal: 4 },
  savedCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
  },
  savedCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightBlue,
  },
  savedLabel: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  savedText: { fontSize: 12, color: Colors.textLight, lineHeight: 16 },
  savedMeta: { fontSize: 11, color: Colors.textLight, marginTop: 4 },
  savedDefault: { fontSize: 10, fontWeight: '700', color: Colors.primary, marginTop: 6 },
  chooseHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 10,
    lineHeight: 17,
  },
  label: { fontSize: 12, fontWeight: '700', color: Colors.text, marginBottom: 8, textTransform: 'uppercase' },
  inputContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  input: { fontSize: 16, color: Colors.text, paddingVertical: Platform.OS === 'android' ? 8 : 10 },
  row: { flexDirection: 'row' },
  summaryContainer: {
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: Colors.textLight },
  summaryValue: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  shippingHint: { fontSize: 11, color: Colors.primary, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  totalValue: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  payTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 20, marginBottom: 10 },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  payOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.lightBlue },
  payTextWrap: { flex: 1 },
  payOptionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  payOptionDesc: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  button: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...Shadows.medium,
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});