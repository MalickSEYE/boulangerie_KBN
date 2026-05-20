const { connectDB }  = require('../_lib/mongoose');
const { Produit }    = require('../_lib/models');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res);
  if (!user) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  if (req.method === 'GET') {
    try {
      const { categorie, search } = req.query;
      const filtre = { actif: true };
      if (categorie) filtre.categorie = categorie;
      if (search) filtre.nom = { $regex: search, $options: 'i' };
      return res.status(200).json(await Produit.find(filtre).sort({ categorie: 1, nom: 1 }));
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  if (req.method === 'POST') {
    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    const { nom, prix, stock, categorie, unite } = req.body || {};
    if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
    if (prix == null || isNaN(prix) || prix < 0) return res.status(400).json({ message: 'Prix invalide' });
    try {
      const p = await Produit.create({ nom, prix, stock: stock || 0, categorie: categorie || 'autre', unite: unite || 'unité' });
      return res.status(201).json(p);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};
