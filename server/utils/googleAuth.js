import { OAuth2Client } from 'google-auth-library';

let googleClient = null;

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  if (!googleClient) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

const getAllowedAudiences = () =>
  [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID]
    .map((value) => value?.trim())
    .filter(Boolean);

export const verifyGoogleCredential = async (credential) => {
  const client = getGoogleClient();
  if (!client) {
    throw new Error('Google sign-in is not configured');
  }

  const audience = getAllowedAudiences();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: audience.length === 1 ? audience[0] : audience,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) {
    throw new Error('Invalid Google account');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture || '',
    emailVerified: payload.email_verified,
  };
};

export const isGoogleAuthEnabled = () => Boolean(process.env.GOOGLE_CLIENT_ID);