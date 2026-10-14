import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/colors';
import { Platform, View, StyleSheet } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

export default function TabLayout() {
  const { t } = useLanguage();
  const { cartCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          ...Shadows.medium,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarShowLabel: true,
        tabBarBadgeStyle: {
          backgroundColor: Colors.accent,
          color: Colors.primaryDark,
          fontSize: 10,
          fontWeight: '900',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                color={focused ? Colors.primary : color}
                size={22}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: t('tabs.categories'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                color={focused ? Colors.primary : color}
                size={22}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Ionicons
                name={focused ? 'search' : 'search-outline'}
                color={focused ? Colors.primary : color}
                size={22}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart') || 'Cart',
          tabBarBadge: cartCount > 0 ? (cartCount > 9 ? '9+' : cartCount) : undefined,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Ionicons
                name={focused ? 'cart' : 'cart-outline'}
                color={focused ? Colors.primary : color}
                size={22}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.account'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                color={focused ? Colors.primary : color}
                size={22}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 28,
  },
  activeIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 28,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
  },
});