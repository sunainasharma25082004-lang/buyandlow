import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { isGoogleAuthEnabled } from '../utils/googleAuth.js';

const router = express.Router();

const isAllowedReturnTo = (value) => {
  if (!value || typeof value !== 'string') return false;

  try {
    const parsed = new URL(value);
    const { protocol, hostname } = parsed;

    if (protocol === 'buylow:' || protocol === 'exp:') return true;

    if (protocol !== 'http:') return false;

    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
  } catch {
    return false;
  }
};

const encodeState = (returnTo) =>
  Buffer.from(JSON.stringify({ returnTo }), 'utf8').toString('base64url');

const decodeState = (state) => {
  if (!state || typeof state !== 'string') return null;
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    if (!parsed?.returnTo || !isAllowedReturnTo(parsed.returnTo)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const getRequestOrigin = (req) => {
  const host = req.get('host');
  if (!host) return null;
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  return `${protocol}://${host}`;
};

const isPrivateIpHost = (host) => {
  const hostname = String(host || '').split(':')[0];
  return (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
};

const getCallbackUrl = (req) => {
  const origin = getRequestOrigin(req);
  return origin ? `${origin}/auth/google/callback` : null;
};

const privateIpBlockedHtml = (host) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>BuyLow Google Sign-In</title>
<style>body{font-family:system-ui,sans-serif;max-width:520px;margin:40px auto;padding:0 20px;color:#1e293b;line-height:1.5}
h1{font-size:22px}code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px}</style></head>
<body>
<h1>Phone par yeh URL kaam nahi karega</h1>
<p>Google private IP (<code>${host}</code>) par OAuth allow nahi karta.</p>
<p><strong>Phone / Expo Go:</strong> app mein <em>Continue with Google</em> dabao — native Android client use hoga (private IP nahi).</p>
<p><strong>Android OAuth client</strong> Google Console mein banao:</p>
<ul>
<li>Package: <code>host.exp.exponent</code></li>
<li>SHA-1: <code>58:FB:04:42:84:66:F3:DC:9F:26:36:86:B3:66:0F:86:7F:EE:FC:BA</code></li>
</ul>
<p>Client ID <code>EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID</code> mein dalo.</p>
<p><strong>PC web test:</strong> <code>http://localhost:5000/auth/google?return_to=buylow://oauthredirect</code></p>
</body></html>`;

const getOAuthClient = (redirectUri) =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );

const redirectWithToken = (res, returnTo, idToken) => {
  const sep = returnTo.includes('?') ? '&' : '?';
  res.redirect(`${returnTo}${sep}id_token=${encodeURIComponent(idToken)}`);
};

router.get('/google', (req, res) => {
  if (!isGoogleAuthEnabled() || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).send('Google sign-in is not configured on the server.');
  }

  const returnTo = typeof req.query.return_to === 'string' ? req.query.return_to.trim() : '';
  if (!isAllowedReturnTo(returnTo)) {
    return res.status(400).send('Invalid or missing return_to parameter.');
  }

  const callbackUrl = getCallbackUrl(req);
  if (!callbackUrl) {
    return res.status(500).send('Could not determine callback URL.');
  }

  if (isPrivateIpHost(req.get('host'))) {
    return res.status(400).type('html').send(privateIpBlockedHtml(req.get('host')));
  }

  const client = getOAuthClient(callbackUrl);
  const authUrl = client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state: encodeState(returnTo),
    prompt: 'select_account',
    include_granted_scopes: true,
  });

  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  if (!isGoogleAuthEnabled() || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).send('Google sign-in is not configured on the server.');
  }

  if (req.query.error) {
    return res
      .status(400)
      .send(`Google sign-in failed: ${req.query.error}. Add redirect URI ${getCallbackUrl(req)} in Google Console.`);
  }

  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const parsedState = decodeState(state);

  if (!code || !parsedState) {
    return res.status(400).send('Invalid Google sign-in response.');
  }

  const callbackUrl = getCallbackUrl(req);
  if (!callbackUrl) {
    return res.status(500).send('Could not determine callback URL.');
  }

  try {
    const client = getOAuthClient(callbackUrl);
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return res.status(401).send('Google did not return an ID token.');
    }

    redirectWithToken(res, parsedState.returnTo, tokens.id_token);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token exchange failed';
    res.status(500).send(`Google sign-in failed: ${message}`);
  }
});

export default router;