const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

/* GET /api/data — ambil semua data user */
router.get('/', requireAuth, async (req, res) => {
  const rows = await db.getUserData(req.user.id);
  const data = {};
  rows.forEach(r => {
    if (!data[r.feature]) data[r.feature] = {};
    data[r.feature][r.data_key] = JSON.parse(r.data_value);
  });
  res.json(data);
});

/* GET /api/data/:feature — ambil data satu fitur */
router.get('/:feature', requireAuth, async (req, res) => {
  const rows = await db.getUserData(req.user.id);
  const feature = req.params.feature;
  const result = {};
  rows.filter(r => r.feature === feature).forEach(r => {
    result[r.data_key] = JSON.parse(r.data_value);
  });
  res.json(result);
});

/* POST /api/data — simpan semua data (full sync) */
router.post('/', requireAuth, async (req, res) => {
  const data = req.body;
  for (const feature of Object.keys(data)) {
    for (const dataKey of Object.keys(data[feature])) {
      await db.upsertUserData(req.user.id, feature, dataKey, JSON.stringify(data[feature][dataKey]));
    }
  }
  res.json({ ok: true });
});

/* POST /api/data/:feature — simpan satu fitur */
router.post('/:feature', requireAuth, async (req, res) => {
  const feature = req.params.feature;
  const data = req.body;
  for (const dataKey of Object.keys(data)) {
    await db.upsertUserData(req.user.id, feature, dataKey, JSON.stringify(data[dataKey]));
  }
  res.json({ ok: true });
});

/* DELETE /api/data/:feature/:key — hapus satu key */
router.delete('/:feature/:key', requireAuth, async (req, res) => {
  await db.deleteUserData(req.user.id, req.params.feature, req.params.key);
  res.json({ ok: true });
});

module.exports = router;
