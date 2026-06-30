import { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

WebBrowser.maybeCompleteAuthSession();

const readIdToken = (paramToken?: string | string[]) => {
  if (typeof paramToken === 'string' && paramToken) return paramToken;

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('id_token');
    if (fromQuery) return fromQuery;

    const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    if (hash) {
      const fromHash = new URLSearchParams(hash).get('id_token');
      if (fromHash) return fromHash;
    }
  }

  return '';
};

export default function OAuthRedirectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id_token?: string | string[] }>();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const completeSignIn = async () => {
      const idToken = readIdToken(params.id_token);

      if (!idToken) {
        setError('Google sign-in token not found. Please try again.');
        return;
      }

      try {
        await loginWithGoogle(idToken);
        router.replace('/(tabs)');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google sign-in failed';
        setError(message);
      }
    };

    completeSignIn();
  }, [params.id_token, loginWithGoogle, router]);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>Signing you in with Google...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  error: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 22,
  },
});