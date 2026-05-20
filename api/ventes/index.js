import { connectDB }  from '../_lib/mongoose.js';
import { Vente, Produit } from '../_lib/models.js';
import { handleCors, verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const user = verifyToken(req, res);
  if (!user) return;

  await connectDB();

  // ── GET /api/ventes ───────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { date, caissier } = req.query;
      const filtre = {};

      if (date) {
        const debut = new Date(date); debut.setHours(0, 0, 0, 0);
        const fin   = new Date(date); fin.setHours(23, 59, 59, 999);
        filtre.createdAt = { $gte: debut, $lte: fin };
      }
      if (caissier) filtre.caissier = caissier;

      const ventes = await Vente.find(filtre)
        .populate('caissier', 'nom role')
        .sort({ createdAt: -1 })
        .limit(100);

      return res.status(200).json(ventes);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // ── POST /api/ventes ──────────────────────────────────────────────
  if (req.method === 'POST') {
    const { lignes, modePaiement, note } = req.body || {};

    if (!lignes || !Array.isArray(lignes) || lignes.length === 0)
      return res.status(400).json({ message: 'Au moins un produit requis' });

    try {
      let total = 0;
      const lignesCompletes = [];

      for (const ligne of lignes) {
        if (!ligne.produit || !ligne.quantite || ligne.quantite < 1)
          return res.status(400).json({ message: 'Ligne de vente invalide' });

        const produit = await Produit.findById(ligne.produit);
        if (!produit) return res.status(404).json({ message: `Produit ${ligne.produit} introuvable` });
        if (produit.stock < ligne.quantite)
          return res.status(400).json({ message: `Stock insuffisant pour "${produit.nom}" (stock : ${produit.stock})` });

        await Produit.findByIdAndUpdate(produit._id, { $inc: { stock: -ligne.quantite } });

        total += produit.prix * ligne.quantite;
        lignesCompletes.push({
          produit:      produit._id,
          nomProduit:   produit.nom,
          quantite:     ligne.quantite,
          prixUnitaire: produit.prix,
        });
      }

      const vente = await Vente.create({
        lignes: lignesCompletes,
        total,
        modePaiement: modePaiement || 'especes',
        caissier: user.id,
        note,
      });

      return res.status(201).json(vente);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur lors de l'enregistrement de la vente" });
    }
  }

  res.status(405).json({ message: 'Méthode non autorisée' });
}
