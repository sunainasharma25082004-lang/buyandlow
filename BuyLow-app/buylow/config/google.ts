import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isLanHost = (host: string) =>
  /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);

export const getGoogleWebClientId = () =>
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

/** Phone (Expo Go): alag Android client ID — Web client se alag credential, same Google project. */
export const getGoogleAndroidClientId = () =>
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || '';

export const getGoogleIosClientId = () =>
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || getGoogleAndroidClientId();

export const getGoogleClientId = getGoogleWebClientId;

export const isGoogleWebConfigured = () => Boolean(getGoogleWebClientId());

export const isGoogleAndroidConfigured = () => Boolean(getGoogleAndroidClientId());

export const isGoogleAuthConfigured = () => isGoogleWebConfigured();

/** Sirf Expo web (browser) — PC server OAuth. */
export const getGoogleAuthOrigin = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    if (isLanHost(host)) {
      return `http://${host}:5000`;
    }
  }

  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_AUTH_ORIGIN?.trim();
  if (fromEnv) return trimTrailingSlash(fromEnv);

  return 'https://buyandlow-api.onrender.com';
};

const getReversedClientRedirectUri = (clientId: string) => {
  const prefix = clientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${prefix}:/oauth2redirect/google`;
};

/** Android/iOS Google client ke liye reversed redirect URI (invalid_request fix). */
export const getGoogleAppReturnUri = () => {
  if (Platform.OS === 'android') {
    const androidId = getGoogleAndroidClientId();
    if (androidId) return getReversedClientRedirectUri(androidId);
  }

  if (Platform.OS === 'ios') {
    const iosId = getGoogleIosClientId();
    if (iosId) return getReversedClientRedirectUri(iosId);
  }

  return makeRedirectUri({
    scheme: 'buylow',
    path: 'oauthredirect',
    preferLocalhost: Platform.OS === 'web',
  });
};