import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';

export default function CouponBanner() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.left}>
          <View style={styles.iconContainer}>
            <Feather name="gift" size={22} color={Colors.accent} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Extra 10% Off</Text>
            <Text style={styles.subtitle}>on all Prepaid Orders via Razorpay</Text>
          </View>
        </View>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>USE CODE</Text>
          <Text style={styles.code}>BUYLOW10</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  banner: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    ...Shadows.medium,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.accent,
    fontSize: 17,
    fontWeight: '900',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  codeContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  codeLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  code: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});