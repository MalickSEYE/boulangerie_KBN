const bcrypt        = require('bcryptjs');
const clientPromise = require('../lib/mongodb');
const { handleCors, requireRole } = require('../lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  const { nom, email, password, role } = req.body || {};
  if (!nom || !email || !password) return res.status(400).json({ message: 'Champs requis manquants' });
  if (password.length < 6) return res.status(400).json({ message: 'Mot de passe min. 6 caractères' });

  try {
    const client = await clientPromise;
    const db = client.db();
    const existant = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (existant) return res.status(409).json({ message: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(password, 12);
    const now = new Date();
    const result = await db.collection('users').insertOne({
      nom, email: email.toLowerCase().trim(), password: hash,
      role: role || 'caissier', actif: true, createdAt: now, updatedAt: now
    });
    return res.status(201).json({ message: 'Compte créé', id: result.insertedId });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
