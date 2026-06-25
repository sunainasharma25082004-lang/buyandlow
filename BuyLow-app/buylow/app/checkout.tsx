import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, formatINR } from '../services/api';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const country = 'India';
  const [phone, setPhone] = useState('');

  const handlePlaceOrder = async () => {
    if (!address || !city || !postalCode || !phone) {
      Alert.alert('Error', 'Please fill in all shipping details');
      return;
    }

    setLoading(true);
    try {
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

      const orderData = {
        orderItems,
        shippingAddress: { address, city, postalCode, country, phone },
        paymentMethod: 'Cash On Delivery', // Simplified for the Expo app as Razorpay might need native modules setup
        itemsPrice: cartTotal,
        shippingPrice: 0,
        totalPrice: cartTotal,
      };

      if (token) {
        await createOrder(orderData, token);
        await clearCart();
        Alert.alert('Success', 'Order placed successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/orders') }
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Address"
        value={address}
        onChangeText={setAddress}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />
        <View style={{ width: 12 }} />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Postal Code"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Total</Text>
          <Text style={styles.summaryValue}>₹{formatINR(cartTotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total to Pay</Text>
          <Text style={styles.totalValue}>₹{formatINR(cartTotal)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePlaceOrder} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>Place Order (COD)</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
