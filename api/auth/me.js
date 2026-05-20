import { connectDB }  from '../_lib/mongoose.js';
import { User }       from '../_lib/models.js';
import { handleCors, verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Méthode non autorisée' });

  const decoded = verifyToken(req, res);
  if (!decoded) return;

  await connectDB();

  try {
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
