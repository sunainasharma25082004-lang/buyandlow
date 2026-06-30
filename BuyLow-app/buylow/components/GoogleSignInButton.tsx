import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
  Platform,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { type AuthSessionResult } from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import {
  getGoogleAppReturnUri,
  getGoogleAuthOrigin,
  getGoogleWebClientId,
  getGoogleAndroidClientId,
  getGoogleIosClientId,
  isGoogleWebConfigured,
  isGoogleAndroidConfigured,
} from '../config/google';
import { useLanguage } from '../context/LanguageContext';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onSuccess: (idToken: string) => Promise<void>;
  disabled?: boolean;
};

const parseIdTokenFromUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const fromQuery = parsed.searchParams.get('id_token');
    if (fromQuery) return fromQuery;

    const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
    if (hash) {
      const params = new URLSearchParams(hash);
      const fromHash = params.get('id_token');
      if (fromHash) return fromHash;
    }
  } catch {
    return null;
  }
  return null;
};

const extractIdToken = (response: AuthSessionResult | null): string | null => {
  if (response?.type !== 'success') return null;
  return (
    response.authentication?.idToken ||
    (response.params as { id_token?: string })?.id_token ||
    null
  );
};

const androidSetupMsg =
  'Phone ke liye Google Console mein Android client banao (5 min, ek baar):\n\n' +
  '1) console.cloud.google.com/apis/credentials\n' +
  '2) Create Credentials -> OAuth -> Android\n' +
  '3) Package: host.exp.exponent\n' +
  '4) SHA-1: 58:FB:04:42:84:66:F3:DC:9F:26:36:86:B3:66:0F:86:7F:EE:FC:BA\n' +
  '5) Android Client ID copy -> .env mein:\n' +
  '   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...\n' +
  '6) server/.env -> GOOGLE_ANDROID_CLIENT_ID=same\n\n' +
  'Test user: rajammy1234567@gmail.com (OAuth consent screen)';

function MobileGoogleSignInButton({ onSuccess, disabled }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const webClientId = getGoogleWebClientId();
  const androidClientId = getGoogleAndroidClientId();
  const iosClientId = getGoogleIosClientId();
  const redirectUri = getGoogleAppReturnUri();

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      webClientId: webClientId || undefined,
      androidClientId: androidClientId || undefined,
      iosClientId: iosClientId || undefined,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      selectAccount: true,
    },
    { scheme: 'buylow', path: 'oauthredirect' },
  );

  useEffect(() => {
    if (__DEV__) {
      console.log('[Google mobile] redirectUri:', redirectUri);
      console.log('[Google mobile] androidClientId:', androidClientId || '(missing)');
    }
  }, [redirectUri, androidClientId]);

  useEffect(() => {
    if (response?.type === 'error') {
      setBusy(false);
      const params = response.params as { error?: string; error_description?: string };
      Alert.alert(
        'Google sign-in failed',
        `${params.error || 'error'}${params.error_description ? `\n${params.error_description}` : ''}\n\n${androidSetupMsg}`,
      );
      return;
    }

    if (response?.type !== 'success') {
      if (response?.type === 'dismiss') setBusy(false);
      return;
    }

    const idToken = extractIdToken(response);
    if (!idToken) {
      Alert.alert(t('common.error'), t('auth.googleNoToken'));
      setBusy(false);
      return;
    }

    onSuccess(idToken)
      .catch((err: Error) => Alert.alert(t('common.error'), err.message || t('auth.googleFailed')))
      .finally(() => setBusy(false));
  }, [response, onSuccess, t]);

  const handlePress = async () => {
    if (!isGoogleWebConfigured()) {
      Alert.alert(t('auth.googleNotConfiguredTitle'), t('auth.googleNotConfiguredMsg'));
      return;
    }

    if (Platform.OS === 'android' && !isGoogleAndroidConfigured()) {
      Alert.alert('Phone Google login', androidSetupMsg);
      return;
    }

    if (!request) {
      Alert.alert(t('common.error'), t('auth.googleFailed'));
      return;
    }

    setBusy(true);
    try {
      const result = await promptAsync();
      if (result.type === 'dismiss' || result.type === 'cancel') {
        setBusy(false);
      }
    } catch {
      setBusy(false);
      Alert.alert(t('common.error'), t('auth.googleFailed'));
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || busy) && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled || busy}
      activeOpacity={0.85}
    >
      {busy ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.text}>{t('auth.continueWithGoogle')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function WebGoogleSignInButton({ onSuccess, disabled }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const authOrigin = getGoogleAuthOrigin();
  const returnUri = getGoogleAppReturnUri();

  const handlePress = async () => {
    if (!isGoogleWebConfigured()) {
      Alert.alert(t('auth.googleNotConfiguredTitle'), t('auth.googleNotConfiguredMsg'));
      return;
    }

    const authPageUrl =
      `${authOrigin}/auth/google?return_to=${encodeURIComponent(returnUri)}`;

    setBusy(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(authPageUrl, returnUri);

      if (result.type !== 'success' || !result.url) {
        if (result.type !== 'cancel' && result.type !== 'dismiss') {
          Alert.alert(t('common.error'), t('auth.googleFailed'));
        }
        return;
      }

      const idToken = parseIdTokenFromUrl(result.url);
      if (!idToken) {
        Alert.alert(t('common.error'), t('auth.googleNoToken'));
        return;
      }

      await onSuccess(idToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth.googleFailed');
      Alert.alert(t('common.error'), message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || busy) && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={disabled || busy}
      activeOpacity={0.85}
    >
      {busy ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.text}>{t('auth.continueWithGoogle')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function GoogleSignInButton(props: Props) {
  if (Platform.OS === 'web') {
    return <WebGoogleSignInButton {...props} />;
  }
  return <MobileGoogleSignInButton {...props} />;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 54,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});