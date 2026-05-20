const { connectDB } = require('../../_lib/mongoose');
const { User }      = require('../../_lib/models');
const { handleCors, requireRole } = require('../../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Méthode non autorisée' });
  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  const { id } = req.query;
  const { role } = req.body || {};
  if (!['admin','caissier','vendeur','livreur'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    return res.status(200).json(user);
  } catch (err) { return res.status(500).json({ message: 'Erreur serveur' }); }
};
