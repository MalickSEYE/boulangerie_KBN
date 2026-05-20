const { connectDB }  = require('../_lib/mongoose');
const { User }       = require('../_lib/models');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });

  const decoded = verifyToken(req, res);
  if (!decoded) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  try {
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
