import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows, Gradients } from '../../../constants/colors';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import CustomHeader from '../../../components/CustomHeader';
import GoogleSignInButton from '../../../components/GoogleSignInButton';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout, deleteAccount, loginWithGoogle } = useAuth();
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your BuyLow account? This action is irreversible and removes your personal data, saved addresses, and profile details.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    iconColor: string = Colors.primary
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Hero */}
        {user ? (
          <LinearGradient
            colors={Gradients.primaryHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHero}
          >
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={14} color="#60A5FA" />
                </View>
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              {user.phone ? <Text style={styles.userPhone}>+91 {user.phone}</Text> : null}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.loginHero}>
            <View style={styles.loginHeroHeader}>
              <Ionicons name="person-circle-outline" size={48} color={Colors.primary} />
              <Text style={styles.loginTitle}>{t('account.welcome')}</Text>
              <Text style={styles.loginSubtitle}>{t('account.welcomeSubtitle')}</Text>
            </View>
            <View style={styles.googleWrap}>
              <GoogleSignInButton onSuccess={loginWithGoogle} />
            </View>
            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>{t('common.login')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.85}
              >
                <Text style={styles.registerBtnText}>{t('common.signUp')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 4 Quick Actions (Amazon / Flipkart Style) */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/orders')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="package" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('account.myOrders')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/wishlist')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="heart-outline" size={20} color="#DB2777" />
            </View>
            <Text style={styles.quickActionText}>{t('account.wishlist')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => requireLogin('/(tabs)/account/addresses')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="location-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.quickActionText}>Addresses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/help' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
              <Feather name="headphones" size={20} color="#D97706" />
            </View>
            <Text style={styles.quickActionText}>Help Center</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details Group */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('account.myAccount')}</Text>
          <View style={styles.card}>
            {renderMenuItem('bag-outline', t('account.myOrders'), t('account.myOrdersSub'), () =>
              router.push('/(tabs)/orders')
            )}
            {renderMenuItem('cart-outline', t('account.shoppingCart'), t('account.shoppingCartSub'), () =>
              router.push('/cart')
            )}
            {renderMenuItem('heart-outline', t('account.wishlist'), t('account.wishlistSub'), () =>
              router.push('/wishlist'),
              '#DB2777'
            )}
          </View>
        </View>

        {/* Account Settings Group */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('account.accountSettings')}</Text>
          <View style={styles.card}>
            {renderMenuItem(
              'person-outline',
              t('account.personalInfo'),
              user
                ? `${user.name}${user.phone ? ` · +91 ${user.phone}` : ''}`
                : t('account.personalInfoSub'),
              () => requireLogin('/(tabs)/account/profile')
            )}
            {renderMenuItem(
              'location-outline',
              t('account.savedAddresses'),
              addressSubtitle,
              () => requireLogin('/(tabs)/account/addresses')
            )}
            {renderMenuItem(
              'card-outline',
              t('account.paymentMethods'),
              user ? paymentLabel : t('account.paymentDefault'),
              () => requireLogin('/(tabs)/account/payment')
            )}
          </View>
        </View>

        {/* Support & Legal Group */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('account.support')}</Text>
          <View style={styles.card}>
            {renderMenuItem(
              'help-circle-outline',
              t('account.helpCenter'),
              t('account.helpCenterSub'),
              () => router.push('/help' as any)
            )}
            {renderMenuItem(
              'chatbubble-ellipses-outline',
              'Chat with Support',
              'Fast assistance for orders & queries',
              () => router.push('/help/chat' as any)
            )}
            {renderMenuItem('document-text-outline', t('account.termsPolicies'), 'Privacy policy & usage terms')}
          </View>
        </View>

        {/* Logout and Delete Account Buttons */}
        {user && (
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
              <Feather name="log-out" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>{t('common.logout')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', marginTop: 10 }]}
              onPress={handleDeleteAccount}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={17} color="#64748B" />
              <Text style={[styles.logoutText, { color: '#64748B', fontWeight: '600' }]}>Delete Account & Data</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.brandFooter}>BuyLow India • Premium Value Store</Text>
          <Text style={styles.versionText}>{t('common.version')} 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 20,
    gap: 16,
    ...Shadows.medium,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 2,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  userPhone: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  loginHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginHorizontal: 14,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  loginHeroHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  googleWrap: {
    width: '100%',
    marginBottom: 12,
  },
  authButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerBtnText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginTop: 14,
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 14,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  logoutContainer: {
    marginTop: 22,
    paddingHorizontal: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  versionContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  brandFooter: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  versionText: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
});