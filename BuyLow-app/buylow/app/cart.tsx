import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../services/api';
import RemoteImage from '../components/RemoteImage';
import { FREE_SHIPPING_MIN, getShippingPrice } from '../constants/shop';

function CartHeader({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerBtn} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="arrow-back" size={22} color={Colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('cart.title')}</Text>
      <View style={styles.headerBtn} />
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const shipping = getShippingPrice(cartTotal);
  const grandTotal = cartTotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(t('auth.loginRequired'), t('auth.loginToCheckout'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.login'), onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <CartHeader onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Feather name="shopping-bag" size={64} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>{t('cart.emptyTitle')}</Text>
          <Text style={styles.emptyText}>{t('cart.emptyText')}</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopButtonText}>{t('cart.startShopping')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CartHeader onBack={() => router.back()} />

      <View style={styles.container}>
        <FlatList
          data={cart}
          keyExtractor={(item, index) => item.product && typeof item.product === 'object' ? item.product._id : String(index)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const product = typeof item.product === 'string' ? null : item.product;
            if (!product) return null;

            return (
              <View style={styles.cartItem}>
                <View style={styles.imageWrap}>
                  <RemoteImage uri={product.image} style={styles.image} contentFit="contain" />
                </View>

                <View style={styles.details}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.brand}>{product.brand}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(product._id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.title} numberOfLines={2}>{product.name}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{formatINR(product.price)}</Text>

                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(product._id, item.quantity - 1)}
                      >
                        <Feather name="minus" size={14} color={Colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(product._id, item.quantity + 1)}
                      >
                        <Feather name="plus" size={14} color={Colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />

        <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
          <View style={styles.footer}>
            <View style={styles.summaryBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('cart.subtotal')}</Text>
                <Text style={styles.totalValue}>₹{formatINR(cartTotal)}</Text>
              </View>
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>{t('cart.delivery')}</Text>
                <Text style={[styles.deliveryValue, shipping === 0 && { color: Colors.success }]}>
                  {shipping === 0 ? t('common.free') : `₹${formatINR(shipping)}`}
                </Text>
              </View>
              {cartTotal < FREE_SHIPPING_MIN && (
                <Text style={styles.shipHint}>
                  {t('cart.freeDeliveryHint', { amount: formatINR(FREE_SHIPPING_MIN - cartTotal) })}
                </Text>
              )}
              <View style={styles.divider} />
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>{t('cart.grandTotal')}</Text>
                <Text style={styles.grandTotalValue}>₹{formatINR(grandTotal)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>{t('cart.proceedCheckout')}</Text>
              <Feather name="arrow-right" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 16,
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  imageWrap: {
    width: 90,
    height: 90,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 8,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  qtyButton: {
    padding: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  footerSafe: {
    backgroundColor: Colors.white,
  },
  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.large,
  },
  summaryBox: {
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deliveryLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  shipHint: {
    fontSize: 11,
    color: Colors.primary,
    marginBottom: 4,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
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
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
    ...Shadows.small,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});