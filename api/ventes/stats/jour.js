const clientPromise = require('../../lib/mongodb');
const { handleCors, requireRole } = require('../../lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });
  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  try {
    const client = await clientPromise;
    const db = client.db();
    const debut = new Date(); debut.setHours(0,0,0,0);
    const stats = await db.collection('ventes').aggregate([
      { $match: { createdAt: { $gte: debut } } },
      { $group: { _id: null, totalVentes: { $sum: 1 }, chiffreAffaires: { $sum: '$total' } } }
    ]).toArray();
    return res.status(200).json(stats[0] || { totalVentes: 0, chiffreAffaires: 0 });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
