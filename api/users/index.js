import { connectDB }  from '../_lib/mongoose.js';
import { User }       from '../_lib/models.js';
import { handleCors, requireRole } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });

  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  await connectDB();

  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
