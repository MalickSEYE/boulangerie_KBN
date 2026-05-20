import { connectDB }  from '../../_lib/mongoose.js';
import { Vente }      from '../../_lib/models.js';
import { handleCors, requireRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });

  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  await connectDB();

  try {
    const debut = new Date();
    debut.setHours(0, 0, 0, 0);

    const stats = await Vente.aggregate([
      { $match: { createdAt: { $gte: debut } } },
      {
        $group: {
          _id: null,
          totalVentes:     { $sum: 1 },
          chiffreAffaires: { $sum: '$total' },
        },
      },
    ]);

    res.status(200).json(stats[0] || { totalVentes: 0, chiffreAffaires: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
