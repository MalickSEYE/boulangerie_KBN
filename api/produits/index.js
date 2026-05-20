const clientPromise = require('../_lib/mongodb');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res);
  if (!user) return;

  try {
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection('produits');

    if (req.method === 'GET') {
      const { categorie, search } = req.query;
      const filtre = { actif: true };
      if (categorie) filtre.categorie = categorie;
      if (search) filtre.nom = { $regex: search, $options: 'i' };
      const produits = await col.find(filtre).sort({ categorie: 1, nom: 1 }).toArray();
      return res.status(200).json(produits);
    }

    if (req.method === 'POST') {
      if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
      const { nom, prix, stock, categorie, unite } = req.body || {};
      if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
      if (prix == null || isNaN(prix) || prix < 0) return res.status(400).json({ message: 'Prix invalide' });
      const now = new Date();
      const result = await col.insertOne({
        nom, prix: Number(prix), stock: Number(stock) || 0,
        categorie: categorie || 'autre', unite: unite || 'unité',
        actif: true, createdAt: now, updatedAt: now
      });
      return res.status(201).json({ _id: result.insertedId, nom, prix, stock, categorie, unite });
    }

    return res.status(405).json({ message: 'Méthode non autorisée' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
