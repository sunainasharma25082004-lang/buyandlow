import { Platform } from 'react-native';
import Constants from 'expo-constants';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getDevHost = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = configuredApiUrl
  ? trimTrailingSlash(configuredApiUrl)
  : `http://${getDevHost()}:5000/api`;

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
};