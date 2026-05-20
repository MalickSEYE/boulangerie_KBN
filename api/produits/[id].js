const { ObjectId }  = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res);
  if (!user) return;

  const { id } = req.query;
  let oid;
  try { oid = new ObjectId(id); } catch { return res.status(400).json({ message: 'ID invalide' }); }

  try {
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection('produits');

    if (req.method === 'GET') {
      const p = await col.findOne({ _id: oid });
      if (!p) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json(p);
    }

    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });

    if (req.method === 'PUT') {
      const update = { ...req.body, updatedAt: new Date() };
      delete update._id;
      if (update.prix !== undefined) update.prix = Number(update.prix);
      if (update.stock !== undefined) update.stock = Number(update.stock);
      const result = await col.findOneAndUpdate({ _id: oid }, { $set: update }, { returnDocument: 'after' });
      if (!result) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json(result);
    }

    if (req.method === 'DELETE') {
      await col.updateOne({ _id: oid }, { $set: { actif: false, updatedAt: new Date() } });
      return res.status(200).json({ message: 'Produit désactivé' });
    }

    return res.status(405).json({ message: 'Méthode non autorisée' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
