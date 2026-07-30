const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const DEV_KEYS = (process.env.DEV_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

console.log('[auth] Loaded ' + DEV_KEYS.length + ' developer keys');

/* POST /api/login */
router.post('/login', async (req, res) => {
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

  if (existingUser.developer_key !== normalizedKey) {
    return res.status(401).json({
      error: 'Developer Key tidak sesuai dengan data yang tersimpan. Gunakan key yang sama saat pendaftaran.',
    });
  }

  const token = uuidv4();
  await db.createSession(existingUser.id, token);
  res.json({ token, username: existingUser.username, isNewUser: false });
});

/* POST /api/login/google — menyelesaikan onboarding Google */
router.post('/login/google', async (req, res) => {
  const { googleId, email, avatarUrl, username, developerKey } = req.body;

  if (!googleId) return res.status(400).json({ error: 'Google ID diperlukan.' });
  if (!username || !username.trim()) return res.status(400).json({ error: 'Username wajib diisi.' });
  if (!developerKey || !developerKey.trim()) return res.status(400).json({ error: 'Developer Key wajib diisi.' });

  const normalizedKey = developerKey.toUpperCase().trim();

  const keyIsValid = DEV_KEYS.includes(normalizedKey);
  if (!keyIsValid) return res.status(401).json({ error: 'Developer Key tidak valid.' });

  const existingKey = await db.findUserByKey(normalizedKey);
  if (existingKey) return res.status(401).json({ error: 'Developer Key sudah dipakai oleh user lain.' });

  const userId = await db.createGoogleUser(username.trim(), normalizedKey, googleId, email || '', avatarUrl || '');
  const token = uuidv4();
  await db.createSession(userId, token);

  /* Simpan data Google ke settings_profile */
  try {
    await db.upsertUserData(userId, 'settings', 'settings_profile', JSON.stringify({
      name: username.trim(), email: email || '', avatar: avatarUrl || '',
      theme: 'light', notifTodo: true, language: 'en',
    }));
  } catch (e) {}

  res.json({ token, username: username.trim(), isNewUser: true });
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
