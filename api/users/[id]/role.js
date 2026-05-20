import { connectDB }  from '../../_lib/mongoose.js';
import { User }       from '../../_lib/models.js';
import { handleCors, requireRole } from '../../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Méthode non autorisée' });

  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  const { id }   = req.query;
  const { role } = req.body || {};
  const rolesValides = ['admin', 'caissier', 'vendeur', 'livreur'];
  if (!rolesValides.includes(role)) return res.status(400).json({ message: 'Rôle invalide' });

  await connectDB();

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
