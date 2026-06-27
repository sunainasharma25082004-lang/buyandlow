import React, { useMemo } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { RazorpaySuccess } from '../utils/razorpay';

export type { RazorpaySuccess };

type Props = {
  visible: boolean;
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (payload: RazorpaySuccess) => void;
  onDismiss: () => void;
};

export default function RazorpayCheckout({
  visible,
  keyId,
  amount,
  currency,
  razorpayOrderId,
  userName = '',
  userEmail = '',
  userPhone = '',
  onSuccess,
  onDismiss,
}: Props) {
  const html = useMemo(() => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
      body { margin: 0; background: #f0f4ff; font-family: sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; }
      .box { text-align:center; color:#1565C0; }
    </style>
  </head>
  <body>
    <div class="box"><p>Opening secure payment...</p></div>
    <script>
      function post(data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }
      try {
        var options = {
          key: ${JSON.stringify(keyId)},
          amount: ${amount},
          currency: ${JSON.stringify(currency)},
          name: 'BuyLow India',
          description: 'Order Payment',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80',
          order_id: ${JSON.stringify(razorpayOrderId)},
          prefill: {
            name: ${JSON.stringify(userName)},
            email: ${JSON.stringify(userEmail)},
            contact: ${JSON.stringify(userPhone)},
          },
          theme: { color: '#1565C0' },
          handler: function (response) {
            post({ type: 'success', payload: response });
          },
          modal: {
            ondismiss: function () { post({ type: 'dismiss' }); }
          }
        };
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          post({ type: 'error', message: response.error && response.error.description || 'Payment failed' });
        });
        rzp.open();
      } catch (e) {
        post({ type: 'error', message: e.message || 'Could not open Razorpay' });
      }
    </script>
  </body>
</html>
  `, [keyId, amount, currency, razorpayOrderId, userName, userEmail, userPhone]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loaderText}>Loading Razorpay...</Text>
            </View>
          )}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'success' && data.payload) {
                onSuccess(data.payload);
              } else if (data.type === 'dismiss') {
                onDismiss();
              } else if (data.type === 'error') {
                Alert.alert('Payment Failed', data.message || 'Could not complete payment. Please try again.');
                onDismiss();
              }
            } catch {
              onDismiss();
            }
          }}
          style={styles.webview}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  headerTitle: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { color: Colors.textLight, fontSize: 14 },
});