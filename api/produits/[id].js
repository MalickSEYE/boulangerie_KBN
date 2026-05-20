import { connectDB }  from '../_lib/mongoose.js';
import { Produit }    from '../_lib/models.js';
import { handleCors, verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const user = verifyToken(req, res);
  if (!user) return;

  await connectDB();

  const { id } = req.query;

  // ── GET /api/produits/:id ─────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const produit = await Produit.findById(id);
      if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json(produit);
    } catch {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Routes suivantes : admin uniquement
  if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });

  // ── PUT /api/produits/:id ─────────────────────────────────────────
  if (req.method === 'PUT') {
    const { prix, stock } = req.body || {};
    if (prix  != null && (isNaN(prix)  || prix  < 0)) return res.status(400).json({ message: 'Prix invalide' });
    if (stock != null && (isNaN(stock) || stock < 0)) return res.status(400).json({ message: 'Stock invalide' });

    try {
      const produit = await Produit.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json(produit);
    } catch {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
  }

  // ── DELETE /api/produits/:id ──────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const produit = await Produit.findByIdAndUpdate(id, { actif: false }, { new: true });
      if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
      return res.status(200).json({ message: 'Produit désactivé', produit });
    } catch {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  res.status(405).json({ message: 'Méthode non autorisée' });
}
