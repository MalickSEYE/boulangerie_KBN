const { connectDB } = require('../../_lib/mongoose');
const { Vente }     = require('../../_lib/models');
const { handleCors, requireRole } = require('../../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });
  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  try {
    const debut = new Date(); debut.setHours(0,0,0,0);
    const stats = await Vente.aggregate([
      { $match: { createdAt: { $gte: debut } } },
      { $group: { _id: null, totalVentes: { $sum: 1 }, chiffreAffaires: { $sum: '$total' } } },
    ]);
    return res.status(200).json(stats[0] || { totalVentes: 0, chiffreAffaires: 0 });
  } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
};
