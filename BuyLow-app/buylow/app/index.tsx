import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const FLOATING_ICONS = [
  { name: 'bag-handle-outline' as const, top: '18%', left: '12%', delay: 0 },
  { name: 'pricetag-outline' as const, top: '28%', right: '10%', delay: 200 },
  { name: 'star-outline' as const, bottom: '32%', left: '16%', delay: 400 },
  { name: 'gift-outline' as const, bottom: '24%', right: '14%', delay: 600 },
];

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(24)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const iconAnims = useRef(FLOATING_ICONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();

    iconAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(FLOATING_ICONS[i].delay),
          Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ]),
      ).start();
    });

    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
      Animated.timing(barWidth, { toValue: width * 0.55, duration: 1200, useNativeDriver: false }),
    ]).start();

    const timer = setTimeout(() => router.replace('/(tabs)'), 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary, Colors.primaryLight]}
        style={StyleSheet.absoluteFill}
      />

      {FLOATING_ICONS.map((item, index) => (
        <Animated.View
          key={item.name}
          style={[
            styles.floatingIcon,
            {
              top: item.top as any,
              left: (item as any).left,
              right: (item as any).right,
              bottom: (item as any).bottom,
              opacity: iconAnims[index],
              transform: [
                {
                  translateY: iconAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -12],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name={item.name} size={26} color="rgba(255,255,255,0.25)" />
        </Animated.View>
      ))}

      <Animated.View
        style={[
          styles.logoOuter,
          { opacity: logoOpacity, transform: [{ scale: Animated.multiply(logoScale, pulse) }] },
        ]}
      >
        <View style={styles.logoCard}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} contentFit="contain" />
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.taglineWrap, { opacity: taglineOpacity, transform: [{ translateY: taglineY }] }]}
      >
        <Text style={styles.brandName}>BUYLOW INDIA</Text>
        <Text style={styles.tagline}>Buy More, Pay Less!</Text>
        <View style={styles.accentPill}>
          <Ionicons name="flash" size={14} color={Colors.primary} />
          <Text style={styles.pillText}>India&apos;s Smart Shopping App</Text>
        </View>
      </Animated.View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>

      <Text style={styles.loadingText}>Loading best deals for you...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: height * 0.08,
  },
  floatingIcon: { position: 'absolute' },
  logoOuter: { alignItems: 'center', marginBottom: 28 },
  logoCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 14,
  },
  logo: { width: width * 0.58, height: 72 },
  taglineWrap: { alignItems: 'center', marginBottom: 36 },
  brandName: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: 1,
    marginBottom: 14,
  },
  accentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  barTrack: {
    width: width * 0.55,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  barFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  loadingText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
});