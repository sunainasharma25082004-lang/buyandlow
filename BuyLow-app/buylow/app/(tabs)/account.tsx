import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import CustomHeader from '../../components/CustomHeader';
export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const requireLogin = (route: string) => {
    if (!user) {
      Alert.alert(t('auth.loginRequired'), t('auth.loginRequiredGeneric'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.login'), onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    router.push(route as any);
  };

  const addressCount = user?.addresses?.length || 0;
  const paymentLabel =
    user?.paymentPreference === 'cod' ? t('account.paymentCod') : t('account.paymentRazorpay');

  const addressSubtitle =
    user && addressCount > 0
      ? addressCount > 1
        ? t('account.savedAddressesCountPlural', { count: String(addressCount) })
        : t('account.savedAddressesCount', { count: String(addressCount) })
      : t('account.savedAddressesSub');

  const handleLogout = () => {
    Alert.alert(t('common.logout'), t('account.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
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
      <CustomHeader />
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
            <Text style={styles.loginTitle}>{t('account.welcome')}</Text>
            <Text style={styles.loginSubtitle}>{t('account.welcomeSubtitle')}</Text>
            <View style={styles.loginButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.primaryButtonText}>{t('common.login')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.secondaryButtonText}>{t('common.signUp')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account.myAccount')}</Text>
          <View style={styles.card}>
            {renderMenuItem('bag-outline', t('account.myOrders'), t('account.myOrdersSub'), () =>
              router.push('/(tabs)/orders'),
            )}
            {renderMenuItem('cart-outline', t('account.shoppingCart'), t('account.shoppingCartSub'), () =>
              router.push('/cart'),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account.accountSettings')}</Text>
          <View style={styles.card}>
            {renderMenuItem('heart-outline', t('account.wishlist'), t('account.wishlistSub'), () =>
              router.push('/wishlist'),
            )}
            {renderMenuItem(
              'person-outline',
              t('account.personalInfo'),
              user
                ? `${user.name}${user.phone ? ` · +91 ${user.phone}` : ''}`
                : t('account.personalInfoSub'),
              () => requireLogin('/account/profile'),
            )}
            {renderMenuItem('location-outline', t('account.savedAddresses'), addressSubtitle, () =>
              requireLogin('/account/addresses'),
            )}
            {renderMenuItem(
              'card-outline',
              t('account.paymentMethods'),
              user ? paymentLabel : t('account.paymentDefault'),
              () => requireLogin('/account/payment'),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('account.support')}</Text>
          <View style={styles.card}>
            {renderMenuItem('help-circle-outline', t('account.helpCenter'), t('account.helpCenterSub'), () =>
              router.push('/help' as any),
            )}
            {renderMenuItem('document-text-outline', t('account.termsPolicies'))}
          </View>
        </View>

        {user && (
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>{t('common.logout')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>{t('common.version')}</Text>
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