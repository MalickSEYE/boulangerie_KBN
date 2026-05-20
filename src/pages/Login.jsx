import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [erreur,   setErreur]   = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      setErreur(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.titre}>🥐 Boulangerie</h1>
        <p style={styles.sous}>Connexion à l'espace de gestion</p>

        {erreur && <p style={styles.erreur}>{erreur}</p>}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="prenom@boulangerie.sn"
          required
          style={styles.input}
        />

        <label style={styles.label}>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page:  { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f0e8' },
  card:  { background: '#fff', padding: '2.5rem', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 },
  titre: { textAlign: 'center', fontSize: 28, marginBottom: 4 },
  sous:  { textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: 500, color: '#444' },
  input: { padding: '0.65rem 0.9rem', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, outline: 'none' },
  btn:   { marginTop: 8, padding: '0.75rem', background: '#c17c2e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  erreur:{ background: '#fee', color: '#c00', padding: '0.6rem 0.8rem', borderRadius: 8, fontSize: 13 },
};
