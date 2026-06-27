import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import RemoteImage from '../../components/RemoteImage';
import OrderTracking from '../../components/OrderTracking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getMyOrders, formatINR, getOrderStatus } from '../../services/api';
import { getDeliveryMessage, formatStatusLabel } from '../../utils/orderTracking';
import { Order } from '../../types/api';
import { useRouter, useFocusEffect } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OrdersScreen() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        setLoading(false);
        return;
      }
      let active = true;
      setLoading(true);
      getMyOrders(token)
        .then((res) => {
          if (active && res.success) {
            setOrders(res.orders);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => { active = false; };
    }, [token]),
  );

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderOrderCard = (item: Order) => {
    const status = getOrderStatus(item);
    const expanded = expandedId === item._id;
    const delivery = getDeliveryMessage(item);
    const statusColor =
      status === 'delivered' ? Colors.success : status === 'cancelled' ? Colors.error : Colors.primary;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => toggleExpand(item._id)}
        activeOpacity={0.92}
      >
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>
              {t('orders.orderId', { id: item._id.substring(0, 8).toUpperCase() })}
            </Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.orderStatus, { color: statusColor }]}>
              {formatStatusLabel(status)}
            </Text>
          </View>
        </View>

        <View style={styles.deliveryBanner}>
          <Feather name="clock" size={16} color={Colors.primary} />
          <View style={styles.deliveryTextWrap}>
            <Text style={styles.deliveryTitle}>{delivery.title}</Text>
            <Text style={styles.deliverySub}>{delivery.subtitle}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.orderItems.slice(0, expanded ? item.orderItems.length : 2).map((prod, idx) => (
            <View key={idx} style={styles.orderItemRow}>
              <View style={styles.orderThumb}>
                <RemoteImage uri={prod.image} style={styles.orderThumbImg} contentFit="contain" />
              </View>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemText} numberOfLines={2}>{prod.name}</Text>
                <Text style={styles.orderItemQty}>
                  {t('orders.qty', { count: String(prod.quantity) })} · ₹{formatINR(prod.price * prod.quantity)}
                </Text>
              </View>
            </View>
          ))}
          {!expanded && item.orderItems.length > 2 ? (
            <Text style={styles.moreItems}>
              {t('orders.moreItems', { count: String(item.orderItems.length - 2) })}
            </Text>
          ) : null}
        </View>

        {expanded ? (
          <View style={styles.expandedSection}>
            <Text style={styles.sectionLabel}>{t('orders.orderTracking')}</Text>
            <OrderTracking order={item} />

            <Text style={styles.sectionLabel}>{t('orders.deliveryAddress')}</Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{item.shippingAddress.address}</Text>
              <Text style={styles.addressText}>
                {item.shippingAddress.city} - {item.shippingAddress.postalCode}
              </Text>
              <Text style={styles.addressText}>{item.shippingAddress.country}</Text>
              <Text style={styles.addressPhone}>
                {t('orders.phoneLabel', { phone: item.shippingAddress.phone })}
              </Text>
            </View>

            <Text style={styles.sectionLabel}>{t('orders.paymentSummary')}</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('orders.items')}</Text>
                <Text style={styles.summaryValue}>₹{formatINR(item.itemsPrice)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('orders.delivery')}</Text>
                <Text style={[styles.summaryValue, item.shippingPrice === 0 && { color: Colors.success }]}>
                  {item.shippingPrice === 0 ? t('common.free') : `₹${formatINR(item.shippingPrice)}`}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>{t('checkout.grandTotal')}</Text>
                <Text style={styles.summaryTotalValue}>₹{formatINR(item.totalPrice)}</Text>
              </View>
              <View style={styles.payRowExpanded}>
                <Ionicons
                  name={item.paymentMethod?.toLowerCase().includes('cash') ? 'cash-outline' : 'card-outline'}
                  size={16}
                  color={Colors.textLight}
                />
                <Text style={styles.payMethod}>{item.paymentMethod}</Text>
                <Text style={styles.paidBadge}>{item.isPaid ? t('common.paid') : t('common.pending')}</Text>
              </View>
            </View>

            {item.deliveryNote ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>{t('orders.deliveryNote')}</Text>
                <Text style={styles.noteText}>{item.deliveryNote}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.orderFooter}>
          <Text style={styles.tapHint}>{expanded ? t('orders.tapCollapse') : t('orders.tapExpand')}</Text>
          <Text style={styles.orderTotal}>₹{formatINR(item.totalPrice)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <CustomHeader />
        <View style={styles.header}>
          <Text style={styles.title}>{t('orders.title')}</Text>
        </View>
        <View style={styles.emptyState}>
          <Feather name="log-in" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>{t('orders.pleaseLogin')}</Text>
          <Text style={styles.emptyText}>{t('orders.loginToView')}</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>{t('common.login')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader />
      <View style={styles.header}>
        <Text style={styles.title}>{t('orders.title')}</Text>
        <Text style={styles.headerSub}>{t('orders.subtitle')}</Text>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="shopping-bag" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>{t('orders.noOrders')}</Text>
          <Text style={styles.emptyText}>{t('orders.noOrdersSub')}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
          renderItem={({ item }) => renderOrderCard(item)}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  loginBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  loginBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.white,
    ...Shadows.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: '800',
    fontSize: 15,
    color: Colors.text,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  orderStatus: {
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deliveryTextWrap: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  deliverySub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
    lineHeight: 18,
  },
  orderItems: {
    marginBottom: 12,
    gap: 10,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.background,
    padding: 4,
    overflow: 'hidden',
  },
  orderThumbImg: {
    width: '100%',
    height: '100%',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  orderItemQty: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  moreItems: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addressBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
    fontWeight: '600',
  },
  summaryBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
  },
  payRowExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  payMethod: {
    fontSize: 12,
    color: Colors.textLight,
    flex: 1,
  },
  paidBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
    backgroundColor: 'rgba(46,125,50,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  noteBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 18,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 11,
    color: Colors.textLight,
    flex: 1,
    paddingRight: 8,
  },
  orderTotal: {
    fontWeight: '900',
    fontSize: 18,
    color: Colors.primary,
  },
});