const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

let sql;

function getSql() {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
    initSchema();
  }
  return sql;
}

async function initSchema() {
  const s = getSql();
  await s`CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    developer_key TEXT,
    developer_key_hash TEXT,
    google_id TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await s`ALTER TABLE app_users ADD COLUMN IF NOT EXISTS developer_key_hash TEXT`;
  await s`ALTER TABLE app_users ALTER COLUMN developer_key DROP NOT NULL`;
  await s`CREATE TABLE IF NOT EXISTS app_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES app_users(id),
    feature TEXT NOT NULL,
    data_key TEXT NOT NULL,
    data_value TEXT NOT NULL,
    UNIQUE(user_id, feature, data_key)
  )`;
  await s`CREATE TABLE IF NOT EXISTS app_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES app_users(id),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
}

/* ============ USERS ============ */

async function findUserByKey(developerKey) {
  const rows = await getSql()`SELECT * FROM app_users WHERE developer_key = ${developerKey} OR developer_key_hash IS NOT NULL`;
  for (const user of rows) {
    if (verifyDeveloperKey(developerKey, user.developer_key_hash || user.developer_key)) return user;
  }
  return null;
}

async function findUserByUsername(username) {
  const rows = await getSql()`SELECT * FROM app_users WHERE username = ${username}`;
  return rows[0] || null;
}

async function createUser(username, developerKey) {
  const developerKeyHash = hashDeveloperKey(developerKey);
  const rows = await getSql()`
    INSERT INTO app_users (username, developer_key, developer_key_hash)
    VALUES (${username}, NULL, ${developerKeyHash})
    RETURNING id
  `;
  return rows[0].id;
}

async function findUserByGoogleId(googleId) {
  const rows = await getSql()`SELECT * FROM app_users WHERE google_id = ${googleId}`;
  return rows[0] || null;
}

async function createGoogleUser(username, developerKey, googleId, email, avatarUrl) {
  const developerKeyHash = hashDeveloperKey(developerKey);
  const rows = await getSql()`
    INSERT INTO app_users (username, developer_key, developer_key_hash, google_id, email, avatar_url)
    VALUES (${username}, NULL, ${developerKeyHash}, ${googleId}, ${email}, ${avatarUrl})
    RETURNING id
  `;
  return rows[0].id;
}

function hashDeveloperKey(value) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(value, salt, 32).toString('hex');
}

function verifyDeveloperKey(value, stored) {
  if (!stored) return false;
  if (!stored.includes(':')) {
    const expected = Buffer.from(String(stored));
    const actual = Buffer.from(String(value));
    return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
  }
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const actual = crypto.scryptSync(value, parts[0], 32).toString('hex');
  const expected = Buffer.from(parts[1]);
  const actualBuffer = Buffer.from(actual);
  return expected.length === actualBuffer.length && crypto.timingSafeEqual(actualBuffer, expected);
}

async function verifyUserDeveloperKey(user, developerKey) {
  const valid = verifyDeveloperKey(developerKey, user.developer_key_hash || user.developer_key);
  if (valid && !user.developer_key_hash) {
    await getSql()`UPDATE app_users SET developer_key = NULL, developer_key_hash = ${hashDeveloperKey(developerKey)} WHERE id = ${user.id}`;
  }
  return valid;
}

async function updateUserGoogleInfo(userId, googleId, email, avatarUrl) {
  await getSql()`
    UPDATE app_users SET google_id = ${googleId}, email = ${email}, avatar_url = ${avatarUrl}
    WHERE id = ${userId}
  `;
}

/* ============ SESSIONS ============ */

async function createSession(userId, token) {
  await getSql()`
    INSERT INTO app_sessions (user_id, token) VALUES (${userId}, ${token})
  `;
}

async function findSessionByToken(token) {
  const rows = await getSql()`
    SELECT s.*, u.username FROM app_sessions s
    JOIN app_users u ON u.id = s.user_id
    WHERE s.token = ${token}
      AND s.created_at > NOW() - INTERVAL '7 days'
  `;
  return rows[0] || null;
}

async function deleteSessionByToken(token) {
  await getSql()`DELETE FROM app_sessions WHERE token = ${token}`;
}

async function deleteExpiredSessions() {
  await getSql()`DELETE FROM app_sessions WHERE created_at <= NOW() - INTERVAL '7 days'`;
}

/* ============ USER DATA ============ */

async function getUserData(userId) {
  const rows = await getSql()`
    SELECT feature, data_key, data_value FROM app_data WHERE user_id = ${userId}
  `;
  return rows;
}

async function upsertUserData(userId, feature, dataKey, dataValue) {
  await getSql()`
    INSERT INTO app_data (user_id, feature, data_key, data_value)
    VALUES (${userId}, ${feature}, ${dataKey}, ${dataValue})
    ON CONFLICT (user_id, feature, data_key)
    DO UPDATE SET data_value = EXCLUDED.data_value
  `;
}

async function deleteUserData(userId, feature, dataKey) {
  await getSql()`
    DELETE FROM app_data WHERE user_id = ${userId} AND feature = ${feature} AND data_key = ${dataKey}
  `;
}

/* ============ ACCOUNT ============ */

async function deleteUserById(userId) {
  const s = getSql();
  await s`DELETE FROM app_sessions WHERE user_id = ${userId}`;
  await s`DELETE FROM app_data WHERE user_id = ${userId}`;
  await s`DELETE FROM app_users WHERE id = ${userId}`;
}

async function initDb() {
  await initSchema();
  console.log('[db] NeonDB schema ready');
}

module.exports = {
  initDb,
  findUserByKey,
  findUserByUsername,
  verifyUserDeveloperKey,
  findUserByGoogleId,
  createUser,
  createGoogleUser,
  updateUserGoogleInfo,
  createSession,
  findSessionByToken,
  deleteSessionByToken,
  deleteExpiredSessions,
  getUserData,
  upsertUserData,
  deleteUserData,
  deleteUserById,
};
