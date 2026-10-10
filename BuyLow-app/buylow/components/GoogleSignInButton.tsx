import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {
  getGoogleAppReturnUri,
  getGoogleAuthOrigin,
  isGoogleWebConfigured,
} from '../config/google';
import { Colors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onSuccess: (idToken: string) => Promise<unknown>;
  disabled?: boolean;
};

const parseIdTokenFromUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const fromQuery = parsed.searchParams.get('id_token');
    if (fromQuery) return fromQuery;

    const hash = parsed.hash.startsWith('#')
      ? parsed.hash.slice(1)
      : parsed.hash;
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

export default function GoogleSignInButton({ onSuccess, disabled }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const authOrigin = getGoogleAuthOrigin();
  const returnUri = getGoogleAppReturnUri();

  const handlePress = async () => {
    if (!isGoogleWebConfigured()) {
      Alert.alert(
        t('auth.googleNotConfiguredTitle'),
        t('auth.googleNotConfiguredMsg'),
      );
      return;
    }

    const authPageUrl = `${authOrigin}/auth/google?return_to=${encodeURIComponent(returnUri)}`;

    setBusy(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authPageUrl,
        returnUri,
      );

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
      const message =
        err instanceof Error ? err.message : t('auth.googleFailed');
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
