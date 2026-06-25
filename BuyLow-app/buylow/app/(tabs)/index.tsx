import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

import Header from '../../components/home/Header';
import SearchBar from '../../components/home/SearchBar';
import BannerSlider from '../../components/home/BannerSlider';
import Features from '../../components/home/Features';
import Categories from '../../components/home/Categories';
import Deals from '../../components/home/Deals';
import CouponBanner from '../../components/home/CouponBanner';

import TrendyProducts from '../../components/home/TrendyProducts';
import RecentlyViewed from '../../components/home/RecentlyViewed';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SearchBar />
        <BannerSlider />
        <Features />
        <RecentlyViewed />
        <Deals />
        <TrendyProducts />
        <Categories />
        <CouponBanner />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomPadding: {
    height: 80, // Padding for bottom tabs
  }
});