import bcrypt from 'bcryptjs';
import { connectDB }   from '../_lib/mongoose.js';
import { User }        from '../_lib/models.js';
import { handleCors, requireRole } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  const admin = requireRole(req, res, 'admin');
  if (!admin) return;

  await connectDB();

  const { nom, email, password, role } = req.body || {};
  if (!nom || !email || !password) return res.status(400).json({ message: 'Champs requis manquants' });
  if (password.length < 6) return res.status(400).json({ message: 'Mot de passe min. 6 caractères' });

  const rolesValides = ['admin', 'caissier', 'vendeur', 'livreur'];
  if (role && !rolesValides.includes(role)) return res.status(400).json({ message: 'Rôle invalide' });

  try {
    const existant = await User.findOne({ email: email.toLowerCase().trim() });
    if (existant) return res.status(409).json({ message: 'Cet email est déjà utilisé' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ nom, email, password: hash, role: role || 'caissier' });

    res.status(201).json({ message: 'Compte créé', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
