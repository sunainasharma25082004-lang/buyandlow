export const getGoogleClientId = () =>
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

export const isGoogleAuthConfigured = () => Boolean(getGoogleClientId());