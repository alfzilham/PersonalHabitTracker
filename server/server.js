require('dotenv').config({ path: require('path').join(__dirname, '.env.local') });

const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDb } = require('./database/db');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

/* Serve frontend static files dari project root */
app.use(express.static(path.join(__dirname, '..')));

/* API routes */
app.use('/api', authRoutes);
app.use('/api/data', dataRoutes);

/* Fallback: semua route non-API serve index.html */
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log('[server] License Courses Tracker API running on http://localhost:' + PORT);
    console.log('[server] Serving frontend from ' + path.join(__dirname, '..'));
  });
});
