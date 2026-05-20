const { ObjectId }  = require('mongodb');
const clientPromise = require('./lib/mongodb');
const { handleCors, verifyToken, requireRole } = require('./lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  const user = verifyToken(req, res); if (!user) return;

  const client = await clientPromise.catch(err => {
    res.status(500).json({ message: 'Erreur DB', detail: err.message }); return null;
  });
  if (!client) return;
  const db = client.db();

  // GET /api/ventes?stats=jour  → stats du jour (admin)
  if (req.method === 'GET' && req.query.stats === 'jour') {
    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    try {
      const debut = new Date(); debut.setHours(0,0,0,0);
      const stats = await db.collection('ventes').aggregate([
        { $match: { createdAt: { $gte: debut } } },
        { $group: { _id: null, totalVentes: { $sum: 1 }, chiffreAffaires: { $sum: '$total' } } }
      ]).toArray();
      return res.status(200).json(stats[0] || { totalVentes: 0, chiffreAffaires: 0 });
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  // GET /api/ventes  → historique
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
      const ventes = await db.collection('ventes').find(filtre).sort({ createdAt: -1 }).limit(100).toArray();
      const caissierIds = [...new Set(ventes.map(v => v.caissier).filter(Boolean))];
      const caissiers = caissierIds.length > 0
        ? await db.collection('users').find({ _id: { $in: caissierIds.map(id => { try { return new ObjectId(id) } catch { return id } }) } }).toArray()
        : [];
      const map = {}; caissiers.forEach(c => { map[c._id.toString()] = { nom: c.nom, role: c.role }; });
      return res.status(200).json(ventes.map(v => ({ ...v, caissier: v.caissier ? map[v.caissier.toString()] || null : null })));
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  // POST /api/ventes
  if (req.method === 'POST') {
    const { lignes, modePaiement, note } = req.body || {};
    if (!lignes || !Array.isArray(lignes) || lignes.length === 0)
      return res.status(400).json({ message: 'Au moins un produit requis' });
    try {
      let total = 0; const lignesCompletes = [];
      for (const ligne of lignes) {
        const p = await db.collection('produits').findOne({ _id: new ObjectId(ligne.produit) });
        if (!p) return res.status(404).json({ message: 'Produit introuvable' });
        if (p.stock < ligne.quantite) return res.status(400).json({ message: `Stock insuffisant pour "${p.nom}"` });
        await db.collection('produits').updateOne({ _id: p._id }, { $inc: { stock: -ligne.quantite } });
        total += p.prix * ligne.quantite;
        lignesCompletes.push({ produit: p._id, nomProduit: p.nom, quantite: ligne.quantite, prixUnitaire: p.prix });
      }
      const now = new Date();
      const r = await db.collection('ventes').insertOne({ lignes: lignesCompletes, total, modePaiement: modePaiement||'especes', caissier: user.id, note: note||'', createdAt: now, updatedAt: now });
      return res.status(201).json({ _id: r.insertedId, total, lignes: lignesCompletes });
    } catch (err) { return res.status(500).json({ message: 'Erreur serveur', detail: err.message }); }
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
};
