import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows, Gradients } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR, getDiscountPercent } from '../services/api';
import RemoteImage from '../components/RemoteImage';
import { FREE_SHIPPING_MIN, getShippingPrice } from '../constants/shop';

function CartHeader({ onBack, itemCount }: { onBack: () => void; itemCount: number }) {
  const { t } = useLanguage();
  return (
    <LinearGradient
      colors={Gradients.primaryHeader}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={Colors.white} />
      </TouchableOpacity>
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>{t('cart.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {itemCount === 1 ? '1 item' : `${itemCount} items`}
        </Text>
      </View>
      <View style={styles.headerBtn} />
    </LinearGradient>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const shipping = getShippingPrice(cartTotal);
  const grandTotal = cartTotal + shipping;

  // Calculate total original MRP to show savings
  const totalMrp = cart.reduce((acc, item) => {
    if (!item?.product || typeof item.product === 'string') return acc;
    const oldP = item.product.oldPrice || item.product.price;
    return acc + oldP * (item.quantity || 1);
  }, 0);
  const totalSavings = Math.max(0, totalMrp - cartTotal);

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
        <CartHeader onBack={() => router.back()} itemCount={0} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Feather name="shopping-bag" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('cart.emptyTitle')}</Text>
          <Text style={styles.emptyText}>{t('cart.emptyText')}</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.88}
          >
            <Feather name="shopping-cart" size={16} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.shopButtonText}>{t('cart.startShopping')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const freeShippingProgress = Math.min(1, cartTotal / FREE_SHIPPING_MIN);
  const needMore = Math.max(0, FREE_SHIPPING_MIN - cartTotal);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <CartHeader onBack={() => router.back()} itemCount={cartCount} />

      <View style={styles.container}>
        <FlatList
          data={cart}
          keyExtractor={(item, index) =>
            item.product && typeof item.product === 'object' ? item.product._id : String(index)
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* Delivery Progress Bar */}
              <View style={styles.deliveryProgressCard}>
                <View style={styles.deliveryProgressTop}>
                  <Ionicons
                    name={needMore === 0 ? 'checkmark-circle' : 'flash'}
                    size={16}
                    color={needMore === 0 ? '#16A34A' : Colors.primary}
                  />
                  <Text style={styles.deliveryProgressText}>
                    {needMore === 0
                      ? 'Congratulations! You unlocked FREE Delivery'
                      : `Add ₹${formatINR(needMore)} more for FREE Delivery`}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.round(freeShippingProgress * 100)}%`,
                        backgroundColor: needMore === 0 ? '#16A34A' : Colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.sectionHeaderTitle}>Cart Items ({cartCount})</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.priceBreakdownWrap}>
              {/* Bill Details / Price Breakdown Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardTitle}>Price Details</Text>
                <View style={styles.divider} />

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Total MRP</Text>
                  <Text style={styles.billValue}>₹{formatINR(totalMrp)}</Text>
                </View>

                {totalSavings > 0 && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Discount on MRP</Text>
                    <Text style={[styles.billValue, { color: '#16A34A' }]}>
                      -₹{formatINR(totalSavings)}
                    </Text>
                  </View>
                )}

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={[styles.billValue, shipping === 0 && { color: '#16A34A' }]}>
                    {shipping === 0 ? 'FREE' : `₹${formatINR(shipping)}`}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Platform Fee</Text>
                  <Text style={[styles.billValue, { color: '#16A34A' }]}>FREE</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.grandRow}>
                  <Text style={styles.grandLabel}>Total Amount</Text>
                  <Text style={styles.grandValue}>₹{formatINR(grandTotal)}</Text>
                </View>

                {totalSavings > 0 && (
                  <View style={styles.savingsBanner}>
                    <Ionicons name="sparkles" size={14} color="#15803D" />
                    <Text style={styles.savingsBannerText}>
                      You will save ₹{formatINR(totalSavings)} on this order
                    </Text>
                  </View>
                )}
              </View>

              {/* Trust Badge */}
              <View style={styles.trustStrip}>
                <MaterialIcons name="verified-user" size={18} color="#059669" />
                <Text style={styles.trustText}>
                  Safe and secure payments · 100% Authentic products
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const product = typeof item.product === 'string' ? null : item.product;
            if (!product) return null;

            const discount = getDiscountPercent(product.price, product.oldPrice);

            return (
              <View style={styles.cartCard}>
                <View style={styles.cardMain}>
                  {/* Thumbnail */}
                  <View style={styles.imageWrap}>
                    <RemoteImage uri={product.image} style={styles.image} contentFit="contain" />
                    {discount ? (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{discount}%</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Info */}
                  <View style={styles.details}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.brand}>{product.brand || product.category || 'BuyLow'}</Text>
                      <TouchableOpacity
                        onPress={() => removeFromCart(product._id)}
                        style={styles.deleteButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.title} numberOfLines={2}>
                      {product.name}
                    </Text>

                    {item.color ? (
                      <Text style={styles.colorText}>Color: {item.color}</Text>
                    ) : null}

                    {/* Price and Quantity Row */}
                    <View style={styles.priceAndQtyRow}>
                      <View style={styles.priceBox}>
                        <Text style={styles.price}>₹{formatINR(product.price)}</Text>
                        {product.oldPrice && product.oldPrice > product.price ? (
                          <Text style={styles.oldPrice}>₹{formatINR(product.oldPrice)}</Text>
                        ) : null}
                      </View>

                      {/* Quantity Selector Pill */}
                      <View style={styles.qtyPill}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(product._id, item.quantity - 1)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="minus" size={13} color={Colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(product._id, item.quantity + 1)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Feather name="plus" size={13} color={Colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* Sticky Bottom Bar */}
        <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
          <View style={styles.bottomBar}>
            <View style={styles.bottomBarLeft}>
              <Text style={styles.bottomBarLabel}>Total Amount</Text>
              <Text style={styles.bottomBarPrice}>₹{formatINR(grandTotal)}</Text>
            </View>

            <TouchableOpacity
              style={styles.placeOrderBtn}
              onPress={handleCheckout}
              activeOpacity={0.88}
            >
              <Text style={styles.placeOrderBtnText}>{t('cart.proceedCheckout')}</Text>
              <Feather name="arrow-right" size={16} color={Colors.white} />
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
    backgroundColor: '#F3F6FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    ...Shadows.medium,
    elevation: 6,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },
  list: {
    padding: 14,
    paddingBottom: 24,
  },
  deliveryProgressCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  deliveryProgressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  deliveryProgressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  cartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    ...Shadows.small,
  },
  cardMain: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrap: {
    width: 95,
    height: 105,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: Colors.accent,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
    marginTop: 2,
  },
  colorText: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  priceAndQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 15.5,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  oldPrice: {
    fontSize: 11,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 18,
    textAlign: 'center',
  },
  priceBreakdownWrap: {
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  summaryCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 6,
  },
  grandLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  grandValue: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  savingsBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  trustText: {
    fontSize: 11.5,
    color: Colors.textLight,
    fontWeight: '600',
  },
  footerSafe: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...Shadows.medium,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomBarLabel: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600',
  },
  bottomBarPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.small,
  },
  placeOrderBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 24,
    ...Shadows.medium,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});