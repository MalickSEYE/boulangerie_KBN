const { ObjectId }  = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { handleCors, verifyToken } = require('./lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res); if (!user) return;

  const client = await clientPromise.catch(err => {
    res.status(500).json({ message: 'Erreur DB', detail: err.message }); return null;
  });
  if (!client) return;
  const db  = client.db();
  const col = db.collection('produits');
  const { id } = req.query;

  // GET /api/produits          → liste
  // GET /api/produits?id=xxx   → un produit
  if (req.method === 'GET') {
    try {
      if (id) {
        const p = await col.findOne({ _id: new ObjectId(id) });
        if (!p) return res.status(404).json({ message: 'Produit introuvable' });
        return res.status(200).json(p);
      }
      const { categorie, search } = req.query;
      const filtre = { actif: true };
      if (categorie) filtre.categorie = categorie;
      if (search) filtre.nom = { $regex: search, $options: 'i' };
      return res.status(200).json(await col.find(filtre).sort({ categorie:1, nom:1 }).toArray());
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  // POST /api/produits
  if (req.method === 'POST') {
    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    const { nom, prix, stock, categorie, unite } = req.body || {};
    if (!nom) return res.status(400).json({ message: 'Nom requis' });
    if (prix == null || isNaN(prix) || prix < 0) return res.status(400).json({ message: 'Prix invalide' });
    try {
      const now = new Date();
      const r = await col.insertOne({ nom, prix: Number(prix), stock: Number(stock)||0, categorie: categorie||'autre', unite: unite||'unité', actif: true, createdAt: now, updatedAt: now });
      return res.status(201).json({ _id: r.insertedId, nom, prix, stock, categorie, unite });
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  // PUT /api/produits?id=xxx
  if (req.method === 'PUT') {
    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    try {
      const update = { ...req.body, updatedAt: new Date() }; delete update._id;
      if (update.prix  !== undefined) update.prix  = Number(update.prix);
      if (update.stock !== undefined) update.stock = Number(update.stock);
      const r = await col.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: 'after' });
      if (!r) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json(r);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  // DELETE /api/produits?id=xxx
  if (req.method === 'DELETE') {
    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    try {
      await col.updateOne({ _id: new ObjectId(id) }, { $set: { actif: false, updatedAt: new Date() } });
      return res.status(200).json({ message: 'Produit désactivé' });
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};
