const { neon } = require('@neondatabase/serverless');

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
    developer_key TEXT NOT NULL,
    google_id TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
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
  const rows = await getSql()`SELECT * FROM app_users WHERE developer_key = ${developerKey}`;
  return rows[0] || null;
}

async function findUserByUsername(username) {
  const rows = await getSql()`SELECT * FROM app_users WHERE username = ${username}`;
  return rows[0] || null;
}

async function createUser(username, developerKey) {
  const rows = await getSql()`
    INSERT INTO app_users (username, developer_key)
    VALUES (${username}, ${developerKey})
    RETURNING id
  `;
  return rows[0].id;
}

async function findUserByGoogleId(googleId) {
  const rows = await getSql()`SELECT * FROM app_users WHERE google_id = ${googleId}`;
  return rows[0] || null;
}

async function createGoogleUser(username, developerKey, googleId, email, avatarUrl) {
  const rows = await getSql()`
    INSERT INTO app_users (username, developer_key, google_id, email, avatar_url)
    VALUES (${username}, ${developerKey}, ${googleId}, ${email}, ${avatarUrl})
    RETURNING id
  `;
  return rows[0].id;
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
  `;
  return rows[0] || null;
}

async function deleteSessionByToken(token) {
  await getSql()`DELETE FROM app_sessions WHERE token = ${token}`;
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
  findUserByGoogleId,
  createUser,
  createGoogleUser,
  updateUserGoogleInfo,
  createSession,
  findSessionByToken,
  deleteSessionByToken,
  getUserData,
  upsertUserData,
  deleteUserData,
  deleteUserById,
};
