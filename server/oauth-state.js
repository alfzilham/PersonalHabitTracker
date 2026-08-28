const crypto = require('crypto');

const pending = new Map();
const TTL_MS = 5 * 60 * 1000;

function create(value) {
  const code = crypto.randomBytes(32).toString('hex');
  pending.set(code, { value, expiresAt: Date.now() + TTL_MS });
  return code;
}

function consume(code) {
  const item = pending.get(code);
  pending.delete(code);
  if (!item || item.expiresAt < Date.now()) return null;
  return item.value;
}

function purge() {
  const now = Date.now();
  for (const [key, item] of pending) {
    if (item.expiresAt < now) pending.delete(key);
  }
}

setInterval(purge, TTL_MS).unref();

module.exports = { create, consume };
