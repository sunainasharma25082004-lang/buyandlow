import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await logout();
        }
      }
    ]);
  };

  const renderMenuItem = (icon: string, title: string, subtitle?: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon as any} size={24} color={Colors.text} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {user ? (
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={40} color={Colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.loginBanner}>
            <Text style={styles.loginTitle}>Welcome to BuyLow</Text>
            <Text style={styles.loginSubtitle}>Login or sign up to manage your orders</Text>
            <View style={styles.loginButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.primaryButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.secondaryButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <View style={styles.card}>
            {renderMenuItem('bag-outline', 'My Orders', 'Track and view order history', () => router.push('/(tabs)/orders'))}
            {renderMenuItem('cart-outline', 'Shopping Cart', 'View items in your cart', () => router.push('/cart'))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            {renderMenuItem('person-outline', 'Personal Information', user ? `${user.name} · ${user.email}` : 'Name, Email')}
            {renderMenuItem('location-outline', 'Saved Addresses', 'Add or remove delivery address')}
            {renderMenuItem('card-outline', 'Payment Methods', 'Manage your saved cards')}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {renderMenuItem('help-circle-outline', 'Help Center', 'FAQs and customer support')}
            {renderMenuItem('document-text-outline', 'Terms & Policies')}
          </View>
        </View>

        {user && (
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.white,
    gap: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textLight,
  },
  loginBanner: {
    padding: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textLight,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingLeft: 8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  logoutContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    padding: 32,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});