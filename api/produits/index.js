import { connectDB }  from '../_lib/mongoose.js';
import { Produit }    from '../_lib/models.js';
import { handleCors, verifyToken, requireRole } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const user = verifyToken(req, res);
  if (!user) return;

  await connectDB();

  // ── GET /api/produits ────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { categorie, search } = req.query;
      const filtre = { actif: true };
      if (categorie) filtre.categorie = categorie;
      if (search)    filtre.nom = { $regex: search, $options: 'i' };

      const produits = await Produit.find(filtre).sort({ categorie: 1, nom: 1 });
      return res.status(200).json(produits);
    } catch (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // ── POST /api/produits ───────────────────────────────────────────
  if (req.method === 'POST') {
    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });

    const { nom, prix, stock, categorie, unite } = req.body || {};
    if (!nom)         return res.status(400).json({ message: 'Le nom est requis' });
    if (prix == null || isNaN(prix) || prix < 0) return res.status(400).json({ message: 'Prix invalide' });

    try {
      const produit = await Produit.create({ nom, prix, stock: stock || 0, categorie: categorie || 'autre', unite: unite || 'unité' });
      return res.status(201).json(produit);
    } catch (err) {
      return res.status(500).json({ message: 'Erreur lors de la création' });
    }
  }

  res.status(405).json({ message: 'Méthode non autorisée' });
}
