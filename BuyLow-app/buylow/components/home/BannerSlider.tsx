import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: 1,
    label: 'LOWEST PRICES',
    title: 'Buy More,\nPay Less!',
    subtitle: 'Top Quality Products at\nUnbeatable Prices',
    icon: 'shopping-bag',
    color: Colors.lightBlue,
  },
  {
    id: 2,
    label: 'NEW ARRIVALS',
    title: 'Trendy\nCollections',
    subtitle: 'Check out what is new\nthis season',
    icon: 'star',
    color: '#F0E6FF', // Light purple
  },
  {
    id: 3,
    label: 'SALE 50% OFF',
    title: 'Mega\nClearance',
    subtitle: 'Limited time offer on\nselected items',
    icon: 'tag',
    color: '#FFE6E6', // Light red
  }
];

export default function BannerSlider() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof BANNERS[0] }) => (
    <View style={[styles.banner, { backgroundColor: item.color }]}>
      <View style={styles.content}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/categories')}>
          <Text style={styles.buttonText}>Shop Now</Text>
          <Feather name="arrow-right" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.imagePlaceholder}>
          <Feather name={item.icon as any} size={60} color={Colors.primary} style={{opacity: 0.2}}/>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width - 32} // container has paddingHorizontal 16
        height={180}
        autoPlay={true}
        data={BANNERS}
        scrollAnimationDuration={1000}
        autoPlayInterval={3000}
        renderItem={renderItem}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  banner: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'center',
  },
  label: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  imagePlaceholder: {
    position: 'absolute',
    right: 10,
    bottom: -10,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
});