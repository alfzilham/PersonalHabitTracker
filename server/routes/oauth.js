const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const router = express.Router();

/* GET /auth/google — redirect ke Google OAuth */
router.get('/auth/google', (req, res) => {
  const oauth2Client = req.app.get('oauth2Client');
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  res.redirect(authUrl);
});

/* GET /auth/google/callback — handle Google redirect */
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No authorization code provided.');

  try {
    const oauth2Client = req.app.get('oauth2Client');
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = require('googleapis').google.oauth2('v2');
    const { data: userInfo } = await oauth2.userinfo.get({ auth: oauth2Client });

    const googleId = userInfo.id;
    const email = userInfo.email || '';
    const avatarUrl = userInfo.picture || '';

    const existingUser = await db.findUserByGoogleId(googleId);

    if (existingUser) {
      await db.updateUserGoogleInfo(existingUser.id, googleId, email, avatarUrl);
      const token = uuidv4();
      await db.createSession(existingUser.id, token);
      return res.redirect('/login.html?token=' + token);
    }

    const params = new URLSearchParams({
      onboarding: 'google',
      googleId: googleId,
      email: email,
      avatar: avatarUrl,
    });
    res.redirect('/login.html?' + params.toString());

  } catch (err) {
    console.error('[google] OAuth error:', err.message);
    res.redirect('/login.html?error=google_auth_failed');
  }
});

module.exports = router;
