import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import BannerSkeleton from '../ui/BannerSkeleton';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { Colors, Shadows } from '../../constants/colors';
import { BANNER_SLIDES } from '../../constants/images';
import { SCREEN_WIDTH, horizontalPadding, isTablet } from '../../utils/responsive';
import { getAppBanners, resolveMediaUrl } from '../../services/api';
import type { AppBanner } from '../../types/api';

const bannerHeight = isTablet ? 220 : Math.min(SCREEN_WIDTH * 0.48, 200);

type BannerSlide = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  route: string;
};

const toSlide = (banner: AppBanner): BannerSlide => ({
  id: banner._id,
  label: banner.label,
  title: banner.title,
  subtitle: banner.subtitle,
  image: resolveMediaUrl(banner.image),
  route: banner.route,
});

const fallbackSlides: BannerSlide[] = BANNER_SLIDES.map((item) => ({
  id: item.id,
  label: item.label,
  title: item.title,
  subtitle: item.subtitle,
  image: item.image,
  route: item.route,
}));

export default function BannerSlider() {
  const router = useRouter();
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getAppBanners()
      .then((res) => {
        if (!mounted) return;
        const next = (res.banners || []).map(toSlide);
        setSlides(next.length > 0 ? next : fallbackSlides);
      })
      .catch(() => {
        setSlides(fallbackSlides);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const data = useMemo(() => slides, [slides]);

  const renderItem = ({ item }: { item: BannerSlide }) => (
    <View style={styles.bannerWrap}>
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        contentFit="cover"
        {...(Platform.OS === 'web' ? { referrerPolicy: 'no-referrer' as const } : {})}
      />
      <LinearGradient
        colors={['rgba(13,71,161,0.85)', 'rgba(21,101,192,0.55)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.overlay}
      />
      <View style={styles.content}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(item.route as any)}
        >
          <Text style={styles.buttonText}>Shop Now</Text>
          <Feather name="arrow-right" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <BannerSkeleton />;
  }

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={SCREEN_WIDTH - horizontalPadding * 2}
        height={bannerHeight}
        autoPlay
        data={data}
        scrollAnimationDuration={900}
        autoPlayInterval={3500}
        renderItem={renderItem}
        mode="parallax"
        modeConfig={{ parallaxScrollingScale: 0.92, parallaxScrollingOffset: 42 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalPadding,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  bannerWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    height: '100%',
    width: '100%',
    ...Shadows.medium,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
    maxWidth: '68%',
  },
  label: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 30,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
    lineHeight: 18,
  },
  button: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  buttonText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
});