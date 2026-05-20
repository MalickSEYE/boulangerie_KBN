const { connectDB } = require('../_lib/mongoose');
const { User }      = require('../_lib/models');
const { handleCors, requireRole } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });
  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  try {
    return res.status(200).json(await User.find().sort({ createdAt: -1 }));
  } catch (err) { return res.status(500).json({ message: 'Erreur serveur' }); }
};
