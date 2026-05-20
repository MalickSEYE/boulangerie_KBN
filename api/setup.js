const bcrypt        = require('bcryptjs');
const clientPromise = require('./lib/mongodb');

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).end();

  try {
    const client = await clientPromise;
    const db     = client.db();

    // Supprimer l'ancien admin s'il existe
    await db.collection('users').deleteMany({ email: 'admin@admin.com' });

    // Créer un hash frais
    const hash = await bcrypt.hash('Admin2024!', 12);

    await db.collection('users').insertOne({
      nom:       'Admin',
      email:     'admin@admin.com',
      password:  hash,
      role:      'admin',
      actif:     true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(200).json({
      ok:       true,
      message:  'Admin créé avec succès !',
      email:    'admin@admin.com',
      password: 'Admin2024!',
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
