export const getGoogleWebClientId = () =>
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

/** Expo Go / dev: falls back to web client ID if platform ID not set */
export const getGoogleAndroidClientId = () =>
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || getGoogleWebClientId();

export const getGoogleIosClientId = () =>
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || getGoogleWebClientId();

export const getGoogleClientId = getGoogleWebClientId;

export const isGoogleAuthConfigured = () => Boolean(getGoogleWebClientId());