import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getGoogleWebClientId, isGoogleAuthConfigured } from '../config/google';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  onSuccess: (idToken: string) => Promise<void>;
  disabled?: boolean;
};

export default function GoogleSignInButton({ onSuccess, disabled }: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const webClientId = getGoogleWebClientId();

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
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : t('auth.googleFailed');
              Alert.alert(t('common.error'), message);
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