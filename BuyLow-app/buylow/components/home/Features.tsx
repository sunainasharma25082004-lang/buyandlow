import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import { FEATURE_IMAGES } from '../../constants/images';
import { useLanguage } from '../../context/LanguageContext';

export default function Features() {
  const { t } = useLanguage();
  const features = [
    { icon: 'award' as const, text: t('home.featureLowest'), image: FEATURE_IMAGES.delivery },
    { icon: 'check-circle' as const, text: t('home.featureOriginal'), image: FEATURE_IMAGES.secure },
    { icon: 'truck' as const, text: t('home.featureDelivery'), image: FEATURE_IMAGES.delivery },
    { icon: 'refresh-ccw' as const, text: t('home.featureReturns'), image: FEATURE_IMAGES.returns },
    { icon: 'headphones' as const, text: t('home.featureSupport'), image: FEATURE_IMAGES.support },
  ];
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {features.map((item, index) => (
          <View key={index} style={styles.featureItem}>
            <LinearGradient
              colors={[Colors.lightBlue, Colors.white]}
              style={styles.iconContainer}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.featureImage}
                contentFit="cover"
                {...(Platform.OS === 'web' ? { referrerPolicy: 'no-referrer' as const } : {})}
              />
              <View style={styles.iconBadge}>
                <Feather name={item.icon} size={14} color={Colors.primary} />
              </View>
            </LinearGradient>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 14,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  featureItem: {
    alignItems: 'center',
    width: 72,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    ...Shadows.small,
  },
  featureImage: {
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  iconBadge: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  text: {
    fontSize: 10,
    textAlign: 'center',
    color: Colors.text,
    fontWeight: '600',
    lineHeight: 14,
  },
});