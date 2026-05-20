const bcrypt        = require('bcryptjs');
const jwt           = require('jsonwebtoken');
const clientPromise = require('./lib/mongodb');
const { handleCors, verifyToken, requireRole } = require('./lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;

  const { action } = req.query;
  const client = await clientPromise.catch(err => {
    res.status(500).json({ message: 'Erreur DB', detail: err.message }); return null;
  });
  if (!client) return;
  const db = client.db();

  // POST /api/auth?action=login
  if (action === 'login' && req.method === 'POST') {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    try {
      const user = await db.collection('users').findOne({ email: email.toLowerCase().trim(), actif: true });
      if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });
      const valide = await bcrypt.compare(password, user.password);
      if (!valide) return res.status(401).json({ message: 'Identifiants incorrects' });
      const token = jwt.sign(
        { id: user._id.toString(), role: user.role, nom: user.nom },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );
      const { password: _, ...userSafe } = user;
      return res.status(200).json({ token, user: userSafe });
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  // GET /api/auth?action=me
  if (action === 'me' && req.method === 'GET') {
    const decoded = verifyToken(req, res); if (!decoded) return;
    const { ObjectId } = require('mongodb');
    try {
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
      if (!user) return res.status(404).json({ message: 'Introuvable' });
      const { password: _, ...userSafe } = user;
      return res.status(200).json(userSafe);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur' }); }
  }

  // POST /api/auth?action=register
  if (action === 'register' && req.method === 'POST') {
    const admin = requireRole(req, res, 'admin'); if (!admin) return;
    const { nom, email, password, role } = req.body || {};
    if (!nom || !email || !password) return res.status(400).json({ message: 'Champs requis manquants' });
    try {
      const existant = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
      if (existant) return res.status(409).json({ message: 'Email déjà utilisé' });
      const hash = await bcrypt.hash(password, 12);
      const now = new Date();
      const result = await db.collection('users').insertOne({
        nom, email: email.toLowerCase().trim(), password: hash,
        role: role || 'caissier', actif: true, createdAt: now, updatedAt: now
      });
      return res.status(201).json({ message: 'Compte créé', id: result.insertedId });
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  return res.status(400).json({ message: 'Action inconnue' });
};
