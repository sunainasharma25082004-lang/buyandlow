import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import HelpHeader from '../../components/HelpHeader';
import type { PaymentPreference } from '../../types/api';

const PAYMENT_OPTIONS: {
  id: PaymentPreference;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'razorpay',
    title: 'Razorpay (UPI / Card / NetBanking)',
    desc: 'Secure online payments via UPI, debit/credit cards, and net banking',
    icon: 'card-outline',
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    desc: 'Pay when your order arrives at your doorstep',
    icon: 'cash-outline',
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const [selected, setSelected] = useState<PaymentPreference>('razorpay');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.paymentPreference) {
      setSelected(user.paymentPreference);
    }
  }, [user?.paymentPreference]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ paymentPreference: selected });
      Alert.alert('Saved', 'Your preferred payment method has been updated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not save preference.';
      Alert.alert('Save Failed', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <HelpHeader title="Payment Methods" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <HelpHeader title="Payment Methods" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Choose your default payment method for checkout. You can still change it while placing an order.
        </Text>

        {PAYMENT_OPTIONS.map((option) => {
          const active = selected === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setSelected(option.id)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon} size={24} color={Colors.primary} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </View>
              {active && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Secure Payments</Text>
            <Text style={styles.infoDesc}>
              Razorpay supports UPI apps, all major cards, and net banking. Card details are never stored in the app.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Save Preference</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  optionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightBlue,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  optionDesc: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    lineHeight: 17,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 18,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    ...Shadows.medium,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});