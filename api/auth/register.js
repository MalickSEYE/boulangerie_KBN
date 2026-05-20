const bcrypt = require('bcryptjs');
const { connectDB }  = require('../_lib/mongoose');
const { User }       = require('../_lib/models');
const { handleCors, requireRole } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  const { nom, email, password, role } = req.body || {};
  if (!nom || !email || !password) return res.status(400).json({ message: 'Champs requis manquants' });
  if (password.length < 6) return res.status(400).json({ message: 'Mot de passe min. 6 caractères' });

  try {
    const existant = await User.findOne({ email: email.toLowerCase().trim() });
    if (existant) return res.status(409).json({ message: 'Email déjà utilisé' });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ nom, email, password: hash, role: role || 'caissier' });
    return res.status(201).json({ message: 'Compte créé', user });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
