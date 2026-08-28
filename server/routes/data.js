const express = require('express');
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

const FEATURE_KEYS = {
  courses: ['course_completion', 'custom_courses', 'archived_courses', 'course_edits', 'course_notes'],
  study: ['study_completion', 'study_log', 'study_minggu_terakhir', 'study_edits', 'custom_subjects', 'archived_study'],
  todos: ['todos', 'daily_tasks'],
  finance: ['finance_records'],
  certificates: ['certificates'],
  notes: ['personal_notes'],
  settings: ['settings_profile'],
};
const MAX_VALUE_BYTES = 5 * 1024 * 1024;

function validObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function validateFeatureData(feature, data) {
  if (!FEATURE_KEYS[feature] || !validObject(data)) return false;
  for (const key of Object.keys(data)) {
    if (!FEATURE_KEYS[feature].includes(key)) return false;
    const serialized = JSON.stringify(data[key]);
    if (typeof serialized !== 'string' || serialized.length > MAX_VALUE_BYTES) return false;
  }
  return true;
}

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
  if (!validObject(data) || Object.keys(data).some(feature => !validateFeatureData(feature, data[feature]))) {
    return res.status(400).json({ error: 'Invalid data schema.' });
  }
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
  if (!validateFeatureData(feature, data)) {
    return res.status(400).json({ error: 'Invalid data schema.' });
  }
  for (const dataKey of Object.keys(data)) {
    await db.upsertUserData(req.user.id, feature, dataKey, JSON.stringify(data[dataKey]));
  }
  res.json({ ok: true });
});

/* DELETE /api/data/:feature/:key — hapus satu key */
router.delete('/:feature/:key', requireAuth, async (req, res) => {
  if (!FEATURE_KEYS[req.params.feature] || !FEATURE_KEYS[req.params.feature].includes(req.params.key)) {
    return res.status(400).json({ error: 'Invalid data key.' });
  }
  await db.deleteUserData(req.user.id, req.params.feature, req.params.key);
  res.json({ ok: true });
});

module.exports = router;
