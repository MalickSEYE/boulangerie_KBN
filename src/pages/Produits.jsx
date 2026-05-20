import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['pain', 'viennoiserie', 'patisserie', 'boisson', 'autre'];

export default function Produits() {
  const { isAdmin } = useAuth();
  const [produits, setProduits]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [categorie, setCategorie]     = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editProduit, setEditProduit] = useState(null);
  const [form, setForm]               = useState({ nom: '', prix: '', stock: '', categorie: 'pain', unite: 'unité' });
  const [erreur, setErreur]           = useState('');

  const charger = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)    params.search    = search;
      if (categorie) params.categorie = categorie;
      const res = await api.get('/produits', { params });
      setProduits(res.data);
    } catch { setProduits([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { charger(); }, [search, categorie]);

  const ouvrirForm = (p = null) => {
    setErreur('');
    setEditProduit(p);
    setForm(p ? { nom: p.nom, prix: p.prix, stock: p.stock, categorie: p.categorie, unite: p.unite } : { nom: '', prix: '', stock: '', categorie: 'pain', unite: 'unité' });
    setShowForm(true);
  };

  const sauvegarder = async () => {
    setErreur('');
    try {
      if (editProduit) {
        await api.put(`/produits/${editProduit._id}`, form);
      } else {
        await api.post('/produits', form);
      }
      setShowForm(false);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Désactiver ce produit ?')) return;
    try {
      await api.delete(`/produits/${id}`);
      charger();
    } catch { alert('Erreur lors de la suppression'); }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.h1}>Produits</h1>
        {isAdmin() && <button onClick={() => ouvrirForm()} style={styles.btnPrimary}>+ Ajouter</button>}
      </div>

      <div style={styles.filtres}>
        <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} style={styles.input} />
        <select value={categorie} onChange={e => setCategorie(e.target.value)} style={styles.select}>
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <p>Chargement…</p> : (
        <div style={styles.grid}>
          {produits.map(p => (
            <div key={p._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ ...styles.badge, background: catColor(p.categorie) }}>{p.categorie}</span>
                {isAdmin() && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => ouvrirForm(p)} style={styles.btnSm}>✏️</button>
                    <button onClick={() => supprimer(p._id)} style={{ ...styles.btnSm, color: '#c00' }}>🗑</button>
                  </div>
                )}
              </div>
              <p style={styles.nom}>{p.nom}</p>
              <p style={styles.prix}>{p.prix.toLocaleString('fr-SN')} FCFA</p>
              <p style={styles.stock}>Stock : <strong>{p.stock}</strong> {p.unite}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginBottom: '1rem' }}>{editProduit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
            {erreur && <p style={styles.erreur}>{erreur}</p>}

            {[['Nom du produit', 'nom', 'text'], ['Prix (FCFA)', 'prix', 'number'], ['Stock initial', 'stock', 'number'], ['Unité', 'unite', 'text']].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={styles.label}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={styles.input} />
              </div>
            ))}

            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Catégorie</label>
              <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={styles.select}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={styles.btnSecondary}>Annuler</button>
              <button onClick={sauvegarder} style={styles.btnPrimary}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function catColor(cat) {
  return { pain: '#fdf5e0', viennoiserie: '#fdeee0', patisserie: '#fde8f0', boisson: '#e8f4ff', autre: '#f0f0f0' }[cat] || '#f0f0f0';
}

const styles = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  h1:          { fontSize: 24, fontWeight: 600 },
  filtres:     { display: 'flex', gap: 12, marginBottom: '1.5rem' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  card:        { background: '#fff', borderRadius: 12, padding: '1rem', border: '0.5px solid #e8e0d0' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge:       { padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  nom:         { fontWeight: 600, fontSize: 15, marginBottom: 4 },
  prix:        { color: '#c17c2e', fontWeight: 700, fontSize: 17, marginBottom: 4 },
  stock:       { fontSize: 13, color: '#888' },
  input:       { width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  select:      { padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: '#fff' },
  label:       { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#444' },
  btnPrimary:  { padding: '0.6rem 1.2rem', background: '#c17c2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 },
  btnSecondary:{ padding: '0.6rem 1.2rem', background: 'none', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' },
  btnSm:       { padding: '4px 8px', background: 'none', border: '1px solid #eee', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:       { background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 440 },
  erreur:      { background: '#fee', color: '#c00', padding: '0.5rem 0.8rem', borderRadius: 8, fontSize: 13, marginBottom: 12 },
};
