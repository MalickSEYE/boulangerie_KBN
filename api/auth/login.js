import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import { connectDB }  from '../_lib/mongoose.js';
import { User }       from '../_lib/models.js';
import { handleCors } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  await connectDB();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim(), actif: true });
    if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });

    const valide = await bcrypt.compare(password, user.password);
    if (!valide) return res.status(401).json({ message: 'Identifiants incorrects' });

    const token = jwt.sign(
      { id: user._id, role: user.role, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(200).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
