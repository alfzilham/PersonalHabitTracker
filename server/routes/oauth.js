const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

/* GET /auth/google — redirect ke Google OAuth */
router.get('/auth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
  });
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString());
});

/* GET /auth/google/callback — handle Google redirect */
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No authorization code provided.');

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

    /* Cek apakah Google ID sudah terdaftar */
    const existingUser = await db.findUserByGoogleId(googleId);

    if (existingUser) {
      await db.updateUserGoogleInfo(existingUser.id, googleId, email, avatarUrl);
      const token = uuidv4();
      await db.createSession(existingUser.id, token);
      return res.redirect('/login.html?token=' + token);
    }

    /* User baru — redirect ke login page dengan data Google */
    const params = new URLSearchParams({
      onboarding: 'google',
      googleId,
      email,
      avatar: avatarUrl,
    });
    res.redirect('/login.html?' + params.toString());

  } catch (err) {
    console.error('[google] OAuth error:', err.message);
    res.redirect('/login.html?error=google_auth_failed');
  }
});

module.exports = router;
