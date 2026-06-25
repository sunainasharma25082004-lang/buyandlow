import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { getMyOrders, formatINR, getOrderStatus } from '../../services/api';
import { Order } from '../../types/api';
import { useRouter, useFocusEffect } from 'expo-router';

export default function OrdersScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
    }, [token])
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
        </View>
        <View style={styles.emptyState}>
          <Feather name="log-in" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>Please login</Text>
          <Text style={styles.emptyText}>You need to be logged in to view your orders.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>
      
      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="shopping-bag" size={48} color={Colors.border} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your order history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item._id.substring(0, 8)}</Text>
                <Text style={[styles.orderStatus, { color: getOrderStatus(item) === 'delivered' ? 'green' : Colors.primary }]}>
                  {getOrderStatus(item).replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
              <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <View style={styles.orderItems}>
                {item.orderItems.map((prod, idx) => (
                  <Text key={idx} style={styles.orderItemText}>
                    {prod.quantity}x {prod.name}
                  </Text>
                ))}
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>Total: ₹{formatINR(item.totalPrice)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
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
    borderRadius: 8,
    padding: 16,
    backgroundColor: Colors.white,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderId: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  orderStatus: {
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  orderTotal: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.text,
  },
});