const { connectDB }       = require('../_lib/mongoose');
const { Vente, Produit }  = require('../_lib/models');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res);
  if (!user) return;

  try { await connectDB(); }
  catch (err) { return res.status(500).json({ message: 'Erreur DB', detail: err.message }); }

  if (req.method === 'GET') {
    try {
      const { date, caissier } = req.query;
      const filtre = {};
      if (date) {
        const debut = new Date(date); debut.setHours(0,0,0,0);
        const fin   = new Date(date); fin.setHours(23,59,59,999);
        filtre.createdAt = { $gte: debut, $lte: fin };
      }
      if (caissier) filtre.caissier = caissier;
      const ventes = await Vente.find(filtre).populate('caissier','nom role').sort({ createdAt: -1 }).limit(100);
      return res.status(200).json(ventes);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  if (req.method === 'POST') {
    const { lignes, modePaiement, note } = req.body || {};
    if (!lignes || !Array.isArray(lignes) || lignes.length === 0)
      return res.status(400).json({ message: 'Au moins un produit requis' });

    try {
      let total = 0;
      const lignesCompletes = [];
      for (const ligne of lignes) {
        const produit = await Produit.findById(ligne.produit);
        if (!produit) return res.status(404).json({ message: `Produit introuvable` });
        if (produit.stock < ligne.quantite) return res.status(400).json({ message: `Stock insuffisant pour "${produit.nom}"` });
        await Produit.findByIdAndUpdate(produit._id, { $inc: { stock: -ligne.quantite } });
        total += produit.prix * ligne.quantite;
        lignesCompletes.push({ produit: produit._id, nomProduit: produit.nom, quantite: ligne.quantite, prixUnitaire: produit.prix });
      }
      const vente = await Vente.create({ lignes: lignesCompletes, total, modePaiement: modePaiement || 'especes', caissier: user.id, note });
      return res.status(201).json(vente);
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};
