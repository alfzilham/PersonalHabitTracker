const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const oauthState = require('../oauth-state');
const router = express.Router();
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientAllowed(req) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const item = attempts.get(key);
  if (!item || item.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + WINDOW_MS }); return true; }
  item.count += 1;
  return item.count <= MAX_ATTEMPTS;
}

function rejectLogin(res) {
  return res.status(401).json({ error: 'Username atau Developer Key tidak valid.' });
}

const DEV_KEYS = (process.env.DEV_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

console.log('[auth] Loaded ' + DEV_KEYS.length + ' developer keys');

/* POST /api/login */
router.post('/login', async (req, res) => {
  if (!clientAllowed(req)) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
  const { username, developerKey } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username wajib diisi.' });
  }
  if (!developerKey || !developerKey.trim()) {
    return res.status(400).json({ error: 'Developer Key wajib diisi.' });
  }

  const normalizedKey = developerKey.toUpperCase().trim();

  const keyIsValid = DEV_KEYS.includes(normalizedKey);
  if (!keyIsValid) {
    return res.status(401).json({ error: 'Developer Key tidak valid.' });
  }

  const existingUser = await db.findUserByUsername(username.trim());

  if (!existingUser) {
    const userWithSameKey = await db.findUserByKey(normalizedKey);
    if (userWithSameKey) {
      return res.status(401).json({ error: 'Developer Key sudah dipakai oleh user lain.' });
    }

    const userId = await db.createUser(username.trim(), normalizedKey);
    const token = uuidv4();
    await db.createSession(userId, token);
    return res.json({ token, username: username.trim(), isNewUser: true });
  }

  if (!(await db.verifyUserDeveloperKey(existingUser, normalizedKey))) return rejectLogin(res);

  const token = uuidv4();
  await db.createSession(existingUser.id, token);
  res.json({ token, username: existingUser.username, isNewUser: false });
});

/* POST /api/login/google — menyelesaikan onboarding Google */
router.post('/login/google', async (req, res) => {
  if (!clientAllowed(req)) return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
  const { oauthCode, username, role, developerKey } = req.body;
  const oauth = oauthState.consume(oauthCode);

  if (!oauth || oauth.type !== 'onboarding' || !oauth.googleId) return res.status(400).json({ error: 'OAuth session tidak valid atau sudah kedaluwarsa.' });
  if (!username || !username.trim()) return res.status(400).json({ error: 'Username wajib diisi.' });
  if (!developerKey || !developerKey.trim()) return res.status(400).json({ error: 'Developer Key wajib diisi.' });

  const normalizedKey = developerKey.toUpperCase().trim();

  const keyIsValid = DEV_KEYS.includes(normalizedKey);
  if (!keyIsValid) return res.status(401).json({ error: 'Developer Key tidak valid.' });

  const existingKey = await db.findUserByKey(normalizedKey);
  if (existingKey) return res.status(401).json({ error: 'Developer Key sudah dipakai oleh user lain.' });

  const userId = await db.createGoogleUser(username.trim(), normalizedKey, oauth.googleId, oauth.email || '', oauth.avatarUrl || '');
  const token = uuidv4();
  await db.createSession(userId, token);

  /* Simpan data Google ke settings_profile — include role */
  try {
    var settings = { name: username.trim(), email: oauth.email || '', avatar: oauth.avatarUrl || '', role: role || '', theme: 'light', notifTodo: true, language: 'en' };
    await db.upsertUserData(userId, 'settings', 'settings_profile', JSON.stringify(settings));
  } catch (e) {}

  res.json({ token, username: username.trim(), isNewUser: true });
});

router.post('/oauth/exchange', (req, res) => {
  const handoff = oauthState.consume(req.body && req.body.oauthCode);
  if (!handoff || handoff.type !== 'session' || !handoff.token) {
    return res.status(400).json({ error: 'OAuth exchange tidak valid atau sudah kedaluwarsa.' });
  }
  res.json({ token: handoff.token });
});

/* POST /api/logout */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    await db.deleteSessionByToken(token);
  }
  res.json({ ok: true });
});

/* DELETE /api/account */
router.delete('/account', requireAuth, async (req, res) => {
  await db.deleteUserById(req.user.id);
  res.json({ ok: true, message: 'Akun berhasil dihapus.' });
});

module.exports = router;
