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

  /* Cek apakah key valid (ada di .env) */
  const keyIsValid = DEV_KEYS.includes(normalizedKey);
  if (!keyIsValid) {
    return res.status(401).json({ error: 'Developer Key tidak valid.' });
  }

  const existingUser = await db.findUserByUsername(username.trim());

  if (!existingUser) {
    /* Cek apakah developer key sudah dipakai user lain */
    const userWithSameKey = await db.findUserByKey(normalizedKey);
    if (userWithSameKey) {
      return res.status(401).json({ error: 'Developer Key sudah dipakai oleh user lain.' });
    }

    /* Login pertama — simpan user baru */
    const userId = await db.createUser(username.trim(), normalizedKey);
    const token = uuidv4();
    await db.createSession(userId, token);
    return res.json({ token, username: username.trim(), isNewUser: true });
  }

  /* User sudah ada — cocokkan key */
  if (existingUser.developer_key !== normalizedKey) {
    return res.status(401).json({
      error: 'Developer Key tidak sesuai dengan data yang tersimpan. Gunakan key yang sama saat pendaftaran.',
    });
  }

  const token = uuidv4();
  await db.createSession(existingUser.id, token);
  res.json({ token, username: existingUser.username, isNewUser: false });
});

/* POST /api/logout — hapus session */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    await db.deleteSessionByToken(token);
  }
  res.json({ ok: true });
});

/* DELETE /api/account — hapus akun + semua data user */
router.delete('/account', requireAuth, async (req, res) => {
  await db.deleteUserById(req.user.id);
  res.json({ ok: true, message: 'Akun berhasil dihapus.' });
});

module.exports = router;
