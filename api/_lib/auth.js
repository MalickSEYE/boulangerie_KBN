import jwt from 'jsonwebtoken';

/**
 * Vérifie le header Authorization: Bearer <token>
 * Retourne { id, role, nom } ou lance une Response d'erreur.
 */
export function verifyToken(req, res) {
  const header = req.headers['authorization'] || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token manquant ou mal formaté' });
    return null;
  }
  const token = header.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expirée, veuillez vous reconnecter'
      : 'Token invalide';
    res.status(401).json({ message: msg });
    return null;
  }
}

/**
 * Vérifie le token ET le rôle.
 * Retourne l'utilisateur décodé ou null (la réponse d'erreur est déjà envoyée).
 */
export function requireRole(req, res, ...roles) {
  const user = verifyToken(req, res);
  if (!user) return null;
  if (!roles.includes(user.role)) {
    res.status(403).json({ message: 'Accès refusé — droits insuffisants' });
    return null;
  }
  return user;
}

/**
 * Gère les requêtes OPTIONS (pre-flight CORS).
 * Retourne true si la requête était OPTIONS (handler doit s'arrêter).
 */
export function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}
