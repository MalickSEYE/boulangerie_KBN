const { ObjectId }  = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { handleCors, requireRole } = require('./lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const admin = requireRole(req, res, 'admin'); if (!admin) return;

  const client = await clientPromise.catch(err => {
    res.status(500).json({ message: 'Erreur DB', detail: err.message }); return null;
  });
  if (!client) return;
  const db  = client.db();
  const col = db.collection('users');
  const { id, action } = req.query;

  // GET /api/users  → liste
  if (req.method === 'GET') {
    try {
      return res.status(200).json(await col.find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray());
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur' }); }
  }

  // PUT /api/users?id=xxx&action=role  ou  action=actif
  if (req.method === 'PUT' && id) {
    try {
      let update = {};
      if (action === 'role') {
        const { role } = req.body || {};
        if (!['admin','caissier','vendeur','livreur'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });
        update = { role };
      } else if (action === 'actif') {
        const { actif } = req.body || {};
        update = { actif };
      } else {
        return res.status(400).json({ message: 'Action requise: role ou actif' });
      }
      const r = await col.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: 'after', projection: { password: 0 } }
      );
      if (!r) return res.status(404).json({ message: 'Utilisateur introuvable' });
      return res.status(200).json(r);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};
