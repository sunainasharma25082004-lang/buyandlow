import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../constants/colors';
import HelpHeader from '../../components/HelpHeader';

type HelpOption = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/help/chat' | '/help/callback';
  color: string;
};

const HELP_OPTIONS: HelpOption[] = [
  {
    id: 'chat',
    title: 'Chat with Us',
    subtitle: 'Common questions & live support',
    icon: 'chatbubbles-outline',
    route: '/help/chat',
    color: Colors.primary,
  },
  {
    id: 'callback',
    title: 'Call Me Back',
    subtitle: 'Request a call from our team',
    icon: 'call-outline',
    route: '/help/callback',
    color: '#2E7D32',
  },
];

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <HelpHeader title="Help & Support" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Choose an option below. Our support team is here for you 24×7.
          </Text>
        </View>

        {HELP_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            activeOpacity={0.85}
            onPress={() => router.push(option.route)}
          >
            <View style={[styles.optionIcon, { backgroundColor: `${option.color}18` }]}>
              <Ionicons name={option.icon} size={28} color={option.color} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.textLight} />
          </TouchableOpacity>
        ))}

        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={22} color={Colors.primary} />
          <Text style={styles.tipText}>
            For order issues, keep your order ID ready. You can find it in My Orders.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    ...Shadows.small,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.lightBlue,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 19,
  },
});