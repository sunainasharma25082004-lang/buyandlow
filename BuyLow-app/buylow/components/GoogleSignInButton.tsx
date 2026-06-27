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
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getGoogleClientId, isGoogleAuthConfigured } from '../config/google';
import { useLanguage } from '../context/LanguageContext';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onSuccess: (idToken: string) => Promise<void>;
  disabled?: boolean;
};

function NativeGoogleSignInButton({ onSuccess, disabled }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const webClientId = getGoogleClientId();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId || undefined,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
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

function WebGoogleSignInButton({ onSuccess, disabled }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const webClientId = getGoogleClientId();

  if (!isGoogleAuthConfigured()) {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          Alert.alert(t('auth.googleNotConfiguredTitle'), t('auth.googleNotConfiguredMsg'))
        }
      >
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.text}>{t('auth.continueWithGoogle')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.webWrap, disabled && styles.buttonDisabled]}>
      <GoogleOAuthProvider clientId={webClientId}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (!credentialResponse.credential) {
              Alert.alert(t('common.error'), t('auth.googleNoToken'));
              return;
            }
            setBusy(true);
            try {
              await onSuccess(credentialResponse.credential);
            } catch (err: any) {
              Alert.alert(t('common.error'), err?.message || t('auth.googleFailed'));
            } finally {
              setBusy(false);
            }
          }}
          onError={() => Alert.alert(t('common.error'), t('auth.googleFailed'))}
          text="continue_with"
          shape="rectangular"
          theme="outline"
          size="large"
          width="100%"
          locale="en"
        />
      </GoogleOAuthProvider>
      {busy ? (
        <View style={styles.webOverlay}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

export default function GoogleSignInButton(props: Props) {
  if (Platform.OS === 'web') {
    return <WebGoogleSignInButton {...props} />;
  }
  return <NativeGoogleSignInButton {...props} />;
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
  webWrap: {
    width: '100%',
    marginBottom: 8,
    minHeight: 54,
    justifyContent: 'center',
  },
  webOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});