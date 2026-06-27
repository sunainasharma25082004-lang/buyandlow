import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import {
  getGoogleWebClientId,
  getGoogleAndroidClientId,
  getGoogleIosClientId,
  isGoogleAuthConfigured,
} from '../config/google';
import { useLanguage } from '../context/LanguageContext';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onSuccess: (idToken: string) => Promise<void>;
  disabled?: boolean;
};

export default function GoogleSignInButton({ onSuccess, disabled }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const webClientId = getGoogleWebClientId();
  const androidClientId = getGoogleAndroidClientId();
  const iosClientId = getGoogleIosClientId();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId || undefined,
    androidClientId: androidClientId || undefined,
    iosClientId: iosClientId || undefined,
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response?.type === 'error' || response?.type === 'dismiss') {
        setBusy(false);
      }
      return;
    }

    const idToken =
      response.authentication?.idToken ||
      (response.params as { id_token?: string })?.id_token;

    if (!idToken) {
      Alert.alert(t('common.error'), t('auth.googleNoToken'));
      setBusy(false);
      return;
    }

    onSuccess(idToken)
      .catch((err: Error) => {
        Alert.alert(t('common.error'), err.message || t('auth.googleFailed'));
      })
      .finally(() => setBusy(false));
  }, [response, onSuccess, t]);

  const handlePress = async () => {
    if (!isGoogleAuthConfigured() || !request) {
      Alert.alert(t('auth.googleNotConfiguredTitle'), t('auth.googleNotConfiguredMsg'));
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