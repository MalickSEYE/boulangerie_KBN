const { ObjectId }  = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res);
  if (!user) return;

  try {
    const client = await clientPromise;
    const db = client.db();

    if (req.method === 'GET') {
      const { date, caissier } = req.query;
      const filtre = {};
      if (date) {
        const debut = new Date(date); debut.setHours(0,0,0,0);
        const fin   = new Date(date); fin.setHours(23,59,59,999);
        filtre.createdAt = { $gte: debut, $lte: fin };
      }
      if (caissier) filtre.caissier = caissier;
      const ventes = await db.collection('ventes').find(filtre).sort({ createdAt: -1 }).limit(100).toArray();
      // Populate caissier manuellement
      const caissierIds = [...new Set(ventes.map(v => v.caissier).filter(Boolean))];
      const caissiers = caissierIds.length > 0
        ? await db.collection('users').find({ _id: { $in: caissierIds.map(id => { try { return new ObjectId(id) } catch { return id } }) } }).toArray()
        : [];
      const caissierMap = {};
      caissiers.forEach(c => { caissierMap[c._id.toString()] = { nom: c.nom, role: c.role }; });
      const ventesAvecCaissier = ventes.map(v => ({
        ...v, caissier: v.caissier ? caissierMap[v.caissier.toString()] || null : null
      }));
      return res.status(200).json(ventesAvecCaissier);
    }

    if (req.method === 'POST') {
      const { lignes, modePaiement, note } = req.body || {};
      if (!lignes || !Array.isArray(lignes) || lignes.length === 0)
        return res.status(400).json({ message: 'Au moins un produit requis' });

      let total = 0;
      const lignesCompletes = [];
      for (const ligne of lignes) {
        const produit = await db.collection('produits').findOne({ _id: new ObjectId(ligne.produit) });
        if (!produit) return res.status(404).json({ message: 'Produit introuvable' });
        if (produit.stock < ligne.quantite) return res.status(400).json({ message: `Stock insuffisant pour "${produit.nom}"` });
        await db.collection('produits').updateOne({ _id: produit._id }, { $inc: { stock: -ligne.quantite } });
        total += produit.prix * ligne.quantite;
        lignesCompletes.push({ produit: produit._id, nomProduit: produit.nom, quantite: ligne.quantite, prixUnitaire: produit.prix });
      }
      const now = new Date();
      const result = await db.collection('ventes').insertOne({
        lignes: lignesCompletes, total, modePaiement: modePaiement || 'especes',
        caissier: user.id, note: note || '', createdAt: now, updatedAt: now
      });
      return res.status(201).json({ _id: result.insertedId, total, lignes: lignesCompletes });
    }

    return res.status(405).json({ message: 'Méthode non autorisée' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
