const { ObjectId }  = require('mongodb');
const clientPromise = require('../_lib/mongodb');
const { handleCors, verifyToken } = require('../_lib/auth');

module.exports = async function(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });

  const decoded = verifyToken(req, res);
  if (!decoded) return;

  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    const { password: _pwd, ...userSafe } = user;
    return res.status(200).json(userSafe);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', detail: err.message });
  }
};
