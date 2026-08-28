const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../database/db');
const oauthState = require('../oauth-state');
const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

/* GET /auth/google — redirect ke Google OAuth */
router.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  const stateCode = oauthState.create({ csrf: state });
  res.setHeader('Set-Cookie', 'oauth_state=' + stateCode + '; Max-Age=300; Path=/; HttpOnly; SameSite=Lax' + (req.secure || process.env.NODE_ENV === 'production' ? '; Secure' : ''));
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    state: stateCode,
  });
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString());
});

/* GET /auth/google/callback — handle Google redirect */
router.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('No authorization code provided.');
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(v => v.trim().split('=')));
  if (!state || !cookies.oauth_state || cookies.oauth_state !== state || !oauthState.consume(state)) return res.status(400).send('Invalid or expired OAuth state.');
  res.setHeader('Set-Cookie', 'oauth_state=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax' + (req.secure || process.env.NODE_ENV === 'production' ? '; Secure' : ''));

  try {
    /* Exchange code untuk access token */
    const tokenParams = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: CALLBACK_URL,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error('Failed to get access token');

    /* Ambil user info dari Google */
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: 'Bearer ' + tokens.access_token },
    });
    const userInfo = await userRes.json();

    const googleId = userInfo.id;
    const email = userInfo.email || '';
    const avatarUrl = userInfo.picture || '';
    if (!googleId || userInfo.verified_email === false) throw new Error('Google account email is not verified');

    /* Cek apakah Google ID sudah terdaftar */
    const existingUser = await db.findUserByGoogleId(googleId);

    if (existingUser) {
      await db.updateUserGoogleInfo(existingUser.id, googleId, email, avatarUrl);
      const token = uuidv4();
      await db.createSession(existingUser.id, token);
      const handoff = oauthState.create({ type: 'session', token });
      return res.redirect('/login?oauth_code=' + encodeURIComponent(handoff));
    }

    /* User baru — redirect ke login page dengan data Google */
    const onboardingCode = oauthState.create({ type: 'onboarding', googleId, email, avatarUrl });
    const params = new URLSearchParams({ onboarding: 'google', oauth_code: onboardingCode });
    res.redirect('/login?' + params.toString());

  } catch (err) {
    console.error('[google] OAuth error:', err.message);
    res.redirect('/login?error=google_auth_failed&msg=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
