import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/colors';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
        <Feather name="menu" size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.iconGroup}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/(tabs)/search')}>
          <Feather name="search" size={22} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
          <Feather name="shopping-cart" size={22} color={Colors.text} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
    elevation: 4,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    height: 35,
    width: 150,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightBlue,
  },
  cartBadge: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    top: -4,
    right: -4,
    backgroundColor: Colors.secondary,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.white,
  }
});