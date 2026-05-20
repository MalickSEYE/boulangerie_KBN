const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { connectDB }  = require('../_lib/mongoose');
const { User }       = require('../_lib/models');
const { handleCors } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim(), actif: true });
    if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });

    const valide = await bcrypt.compare(password, user.password);
    if (!valide) return res.status(401).json({ message: 'Identifiants incorrects' });

    const token = jwt.sign(
      { id: user._id, role: user.role, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.status(200).json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
