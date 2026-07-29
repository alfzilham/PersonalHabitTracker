const db = require('../database/db');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }

  const token = authHeader.slice(7);
  const session = await db.findSessionByToken(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }

  req.user = { id: session.user_id, username: session.username, token };
  next();
}

module.exports = { requireAuth };
