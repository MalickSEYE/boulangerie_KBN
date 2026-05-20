const { connectDB }  = require('../_lib/mongoose');
const { Produit }    = require('../_lib/models');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res);
  if (!user) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const p = await Produit.findById(id);
      if (!p) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json(p);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur' }); }
  }

  if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });

  if (req.method === 'PUT') {
    try {
      const p = await Produit.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!p) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json(p);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur' }); }
  }

  if (req.method === 'DELETE') {
    try {
      const p = await Produit.findByIdAndUpdate(id, { actif: false }, { new: true });
      if (!p) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json({ message: 'Produit désactivé' });
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur' }); }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};
