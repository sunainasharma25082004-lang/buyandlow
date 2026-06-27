import { Platform } from 'react-native';
import Constants from 'expo-constants';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isLanHost = (host: string) =>
  /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);

const isTunnelHost = (host: string) =>
  /ngrok|exp\.direct|expo\.dev|ngrok-free|\.tunnel\./i.test(host);

/** Only LAN/localhost hosts can reach the local backend — not Expo tunnel URLs */
const isUsableApiHost = (host: string) =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host === '10.0.2.2' ||
  isLanHost(host);

const getMetroHost = () => {
  const sources = [
    Constants.expoConfig?.hostUri,
    (Constants.expoConfig as { debuggerHost?: string } | null)?.debuggerHost,
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost,
  ];

  for (const source of sources) {
    if (!source) continue;
    const host = source.split(':')[0];
    if (host && isUsableApiHost(host) && !isTunnelHost(host)) {
      return host;
    }
  }

  return null;
};

const isLocaltunnelUrl = (url: string) => /loca\.lt/i.test(url);

const getWebDevApiUrl = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  if (isUsableApiHost(host)) {
    return `http://${host}:5000/api`;
  }
  return null;
};

const resolveApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // Expo web in browser — same machine as backend; tunnel causes CORS errors
  const webApiUrl = getWebDevApiUrl();
  if (webApiUrl) {
    if (!envUrl || isLocaltunnelUrl(envUrl)) {
      return webApiUrl;
    }
  }

  const metroHost = getMetroHost();

  // Same WiFi (LAN): direct PC IP is faster and won't die like localtunnel
  if (metroHost) {
    const lanUrl = `http://${metroHost}:5000/api`;
    if (!envUrl || isLocaltunnelUrl(envUrl)) return lanUrl;
  }

  if (envUrl) return trimTrailingSlash(envUrl);

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api';
};

export const API_URL = resolveApiUrl();

export const isTunnelApi = () => isLocaltunnelUrl(API_URL);

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

if (__DEV__) {
  console.log('[BuyLow] API_URL =', API_URL);
}

const rewriteLocalhostUrl = (url: string) => {
  const match = url.match(/^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?(\/.*)?$/i);
  if (!match) return url;
  const path = match[3] || '';
  return `${API_ORIGIN}${path}`;
};

const rewriteStaleUploadUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.startsWith('/uploads/')) return url;

    const currentHost = new URL(API_ORIGIN).host;
    if (parsed.host === currentHost) return url;

    return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

export const resolveMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^data:|^blob:/i.test(url)) return url;

  if (/^https?:\/\//i.test(url)) {
    return rewriteStaleUploadUrl(rewriteLocalhostUrl(url));
  }

  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
};