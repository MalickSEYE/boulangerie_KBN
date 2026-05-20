const jwt = require('jsonwebtoken');

function verifyToken(req, res) {
  const header = req.headers['authorization'] || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token manquant ou mal formaté' });
    return null;
  }
  try {
    return jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (err) {
    res.status(401).json({ message: err.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide' });
    return null;
  }
}

function requireRole(req, res, ...roles) {
  const user = verifyToken(req, res);
  if (!user) return null;
  if (!roles.includes(user.role)) { res.status(403).json({ message: 'Accès refusé' }); return null; }
  return user;
}

function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}

module.exports = { verifyToken, requireRole, handleCors };
