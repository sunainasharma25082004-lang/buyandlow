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
import { useLanguage } from '../../context/LanguageContext';

const bannerHeight = isTablet ? 210 : Math.round(Math.min(SCREEN_WIDTH * 0.44, 185));

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

export default function BannerSlider() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackSlides: BannerSlide[] = useMemo(
    () =>
      BANNER_SLIDES.map((item) => {
        const key = item.id as '1' | '2' | '3';
        const labels: Record<string, { label: string; title: string; subtitle: string }> = {
          '1': {
            label: t('home.banner1Label') || 'DEAL OF THE DAY',
            title: t('home.banner1Title') || 'Electronics Fest',
            subtitle: t('home.banner1Subtitle') || 'Up to 60% off on top gadgets',
          },
          '2': {
            label: t('home.banner2Label') || 'KITCHEN SPECIAL',
            title: t('home.banner2Title') || 'Modern Kitchen',
            subtitle: t('home.banner2Subtitle') || 'Appliances starting at ₹499',
          },
          '3': {
            label: t('home.banner3Label') || 'DINING & DECOR',
            title: t('home.banner3Title') || 'Premium Crockery',
            subtitle: t('home.banner3Subtitle') || 'Elegant sets at low prices',
          },
        };
        const copy = labels[key] || labels['1'];
        return {
          id: item.id,
          label: copy.label,
          title: copy.title,
          subtitle: copy.subtitle,
          image: item.image,
          route: item.route,
        };
      }),
    [t],
  );

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
  }, [fallbackSlides]);

  const data = useMemo(() => slides, [slides]);

  const renderItem = ({ item }: { item: BannerSlide }) => (
    <TouchableOpacity
      style={styles.bannerWrap}
      activeOpacity={0.94}
      onPress={() => router.push(item.route as any)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        contentFit="cover"
        {...(Platform.OS === 'web' ? { referrerPolicy: 'no-referrer' as const } : {})}
      />
      <LinearGradient
        colors={['rgba(15,23,42,0.85)', 'rgba(15,23,42,0.45)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.overlay}
      />
      <View style={styles.content}>
        <View style={styles.labelPill}>
          <Text style={styles.labelText}>{item.label}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
        <View style={styles.ctaButton}>
          <Text style={styles.buttonText}>{t('common.shopNow') || 'Shop Now'}</Text>
          <Feather name="arrow-right" size={13} color={Colors.white} />
        </View>
      </View>
    </TouchableOpacity>
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
        scrollAnimationDuration={800}
        autoPlayInterval={3600}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={renderItem}
        mode="parallax"
        modeConfig={{ parallaxScrollingScale: 0.94, parallaxScrollingOffset: 34 }}
      />

      {/* Pagination Indicator Dots */}
      {data.length > 1 && (
        <View style={styles.paginationWrap}>
          {data.map((_, i) => (
            <View
              key={`banner-dot-${i}`}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: horizontalPadding,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  bannerWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
    width: '100%',
    backgroundColor: '#0F172A',
    ...Shadows.small,
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxWidth: '72%',
  },
  labelPill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  labelText: {
    color: Colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 25,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    alignSelf: 'flex-start',
    gap: 5,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 11.5,
  },
  paginationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 5,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 5,
    backgroundColor: '#CBD5E1',
  },
});