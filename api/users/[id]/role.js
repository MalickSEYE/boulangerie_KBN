const { ObjectId }  = require('mongodb');
const clientPromise = require('../../_lib/mongodb');
const { handleCors, requireRole } = require('../../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Méthode non autorisée' });
  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  const { id } = req.query;
  const { role } = req.body || {};
  if (!['admin','caissier','vendeur','livreur'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });

  try {
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) }, { $set: { role, updatedAt: new Date() } }, { returnDocument: 'after', projection: { password: 0 } }
    );
    if (!result) return res.status(404).json({ message: 'Utilisateur introuvable' });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
