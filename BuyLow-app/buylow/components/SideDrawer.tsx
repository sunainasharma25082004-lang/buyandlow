import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

type DrawerItem = {
  icon: string;
  iconFamily: 'Ionicons' | 'Feather' | 'MaterialIcons';
  label: string;
  route: string;
  badge?: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SideDrawer({ visible, onClose }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayAnim]);

  const navigate = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 150);
  };

  const mainItems: DrawerItem[] = [
    { icon: 'home-outline', iconFamily: 'Ionicons', label: 'Home', route: '/(tabs)' },
    { icon: 'grid-outline', iconFamily: 'Ionicons', label: 'Categories', route: '/(tabs)/categories' },
    { icon: 'search-outline', iconFamily: 'Ionicons', label: 'Search', route: '/(tabs)/search' },
    { icon: 'bag-outline', iconFamily: 'Ionicons', label: 'My Orders', route: '/(tabs)/orders' },
    { icon: 'cart-outline', iconFamily: 'Ionicons', label: 'Shopping Cart', route: '/cart', badge: cartCount },
  ];

  const accountItems: DrawerItem[] = [
    { icon: 'person-outline', iconFamily: 'Ionicons', label: 'My Account', route: '/(tabs)/account' },
    { icon: 'heart-outline', iconFamily: 'Ionicons', label: 'Wishlist', route: '/wishlist' },
    { icon: 'location-outline', iconFamily: 'Ionicons', label: 'My Addresses', route: '/(tabs)/account' },
  ];

  const renderIcon = (item: DrawerItem, color: string) => {
    if (item.iconFamily === 'Ionicons') {
      return <Ionicons name={item.icon as any} size={22} color={color} />;
    }
    if (item.iconFamily === 'Feather') {
      return <Feather name={item.icon as any} size={22} color={color} />;
    }
    return <MaterialIcons name={item.icon as any} size={22} color={color} />;
  };

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.drawerHeader}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        {user ? (
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.loginSection}>
            <Text style={styles.loginPrompt}>Hello, Guest!</Text>
            <View style={styles.loginButtons}>
              <TouchableOpacity style={styles.loginBtn} onPress={() => navigate('/(auth)/login')}>
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.registerBtn} onPress={() => navigate('/(auth)/register')}>
                <Text style={styles.registerBtnText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Main Nav */}
          <Text style={styles.sectionTitle}>NAVIGATION</Text>
          {mainItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => navigate(item.route)}>
              <View style={styles.menuIcon}>
                {renderIcon(item, Colors.primary)}
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && item.badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                </View>
              ) : null}
              <Ionicons name="chevron-forward" size={16} color={Colors.border} />
            </TouchableOpacity>
          ))}

          {/* Account */}
          <Text style={styles.sectionTitle}>MY ACCOUNT</Text>
          {accountItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => navigate(item.route)}>
              <View style={styles.menuIcon}>
                {renderIcon(item, Colors.primary)}
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.border} />
            </TouchableOpacity>
          ))}

          {/* Deals highlight */}
          <View style={styles.offerBanner}>
            <Ionicons name="pricetag" size={18} color={Colors.primary} />
            <Text style={styles.offerText}>Exclusive deals for members!</Text>
          </View>

          {/* Logout */}
          {user && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                onClose();
                await logout();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.drawerFooter}>
          <Text style={styles.footerText}>BuyLow v1.0.0 · Buy More, Pay Less!</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: Colors.white,
    ...Shadows.large,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  logo: {
    width: 120,
    height: 40,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.lightBlue,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  loginSection: {
    padding: 16,
    backgroundColor: Colors.lightBlue,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  loginPrompt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  loginButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerBtnText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollArea: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  offerBanner: {
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 10,
  },
  offerText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF8F8',
  },
  logoutText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
