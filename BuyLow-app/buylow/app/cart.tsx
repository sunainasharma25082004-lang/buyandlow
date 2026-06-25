import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl, formatINR } from '../services/api';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login to proceed to checkout',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>{"Looks like you haven't added anything yet."}</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item, index) => item._id || String(index)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const product = typeof item.product === 'string' ? null : item.product;
          if (!product) return null;

          return (
            <View style={styles.cartItem}>
              <Image source={{ uri: resolveMediaUrl(product.image) }} style={styles.image} contentFit="contain" />
              
              <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.price}>₹{formatINR(product.price)}</Text>
                
                <View style={styles.actions}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.qtyButton} 
                      onPress={() => updateQuantity(product._id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyButton} 
                      onPress={() => updateQuantity(product._id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity onPress={() => removeFromCart(product._id)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₹{formatINR(cartTotal)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
  },
  qtyButton: {
    padding: 4,
    paddingHorizontal: 8,
  },
  qtyText: {
    paddingHorizontal: 12,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: Colors.textLight,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
