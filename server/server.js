require('dotenv').config({ path: require('path').join(__dirname, '.env.local') });

const express = require('express');
const path = require('path');

const { initDb } = require('./database/db');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const oauthRoutes = require('./routes/oauth');

const app = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

/* Blokir akses ke folder & file sensitif — HARUS sebelum static serving */
const BLOCKED_PATHS = ['/docs', '/server', '/logs', '/graphify-out', '/README.md', '/.gitignore', '/package.json'];
app.use(BLOCKED_PATHS, (req, res) => {
  res.status(404).send('Not Found');
});

/* Blokir semua dotfiles (.env, .env.local, .git, dll) di path mana pun */
app.use((req, res, next) => {
  if (req.path.split('/').some(segment => segment.startsWith('.'))) {
    return res.status(404).send('Not Found');
  }
  next();
});

/* API & OAuth routes — harus sebelum app.get('*') fallback */
app.use('/api', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/', oauthRoutes);

/* Redirect akses langsung ke .html supaya tidak terlihat di URL
   (query string tetap diteruskan supaya token/onboarding tidak hilang) */
function preserveQuery(u) {
  const i = u.originalUrl.indexOf('?');
  return i !== -1 ? u.originalUrl.slice(i) : '';
}

app.get('/index.html', (req, res) => {
  res.redirect(301, '/' + preserveQuery(req));
});

app.get('/login.html', (req, res) => {
  res.redirect(301, '/login' + preserveQuery(req));
});

app.get('/onboarding.html', (req, res) => {
  res.redirect(301, '/onboarding' + preserveQuery(req));
});

/* Serve halaman clean-URL untuk login & onboarding */
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('/onboarding', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'onboarding.html'));
});

/* Serve frontend static files dari project root */
app.use(express.static(path.join(__dirname, '..'), { index: false }));

/* Fallback: semua route non-API serve index.html */
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

initDb().then(() => {
  const db = require('./database/db');
  db.deleteExpiredSessions().catch(() => {});
  app.listen(PORT, () => {
    console.log('[server] Personal Habit Tracker API running on http://localhost:' + PORT);
    console.log('[server] Serving frontend from ' + path.join(__dirname, '..'));
  });
});
