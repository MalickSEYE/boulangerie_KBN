import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NouvelleVente() {
  const navigate = useNavigate();
  const [produits, setProduits]   = useState([]);
  const [panier,   setPanier]     = useState([]);
  const [modePaiement, setMode]   = useState('especes');
  const [note,     setNote]       = useState('');
  const [loading,  setLoading]    = useState(false);
  const [erreur,   setErreur]     = useState('');

  useEffect(() => {
    api.get('/produits').then(r => setProduits(r.data)).catch(() => {});
  }, []);

  const ajouterAuPanier = (produit) => {
    setPanier(prev => {
      const existant = prev.find(l => l.produit === produit._id);
      if (existant) {
        return prev.map(l => l.produit === produit._id ? { ...l, quantite: l.quantite + 1 } : l);
      }
      return [...prev, { produit: produit._id, nomProduit: produit.nom, prixUnitaire: produit.prix, quantite: 1 }];
    });
  };

  const modifierQte = (id, delta) => {
    setPanier(prev =>
      prev.map(l => l.produit === id ? { ...l, quantite: Math.max(1, l.quantite + delta) } : l)
    );
  };

  const retirerDuPanier = (id) => setPanier(prev => prev.filter(l => l.produit !== id));

  const total = panier.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0);

  const validerVente = async () => {
    if (panier.length === 0) return setErreur('Le panier est vide');
    setErreur('');
    setLoading(true);
    try {
      await api.post('/ventes', {
        lignes: panier.map(l => ({ produit: l.produit, quantite: l.quantite })),
        modePaiement,
        note,
      });
      navigate('/ventes');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Catalogue */}
      <div style={styles.catalogue}>
        <h1 style={styles.h1}>Nouvelle vente</h1>
        <div style={styles.grid}>
          {produits.map(p => (
            <button key={p._id} onClick={() => ajouterAuPanier(p)} style={styles.produitBtn} disabled={p.stock === 0}>
              <span style={styles.produitNom}>{p.nom}</span>
              <span style={styles.produitPrix}>{p.prix.toLocaleString('fr-SN')} F</span>
              {p.stock <= 5 && <span style={styles.stockAlert}>Stock : {p.stock}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Panier */}
      <div style={styles.panier}>
        <h2 style={styles.h2}>Panier</h2>

        {panier.length === 0 ? (
          <p style={styles.vide}>Cliquez sur un produit pour l'ajouter</p>
        ) : (
          <div style={styles.lignes}>
            {panier.map(l => (
              <div key={l.produit} style={styles.ligne}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{l.nomProduit}</p>
                  <p style={{ fontSize: 12, color: '#888' }}>{l.prixUnitaire.toLocaleString('fr-SN')} F × {l.quantite}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => modifierQte(l.produit, -1)} style={styles.qteBtn}>−</button>
                  <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{l.quantite}</span>
                  <button onClick={() => modifierQte(l.produit, +1)} style={styles.qteBtn}>+</button>
                  <button onClick={() => retirerDuPanier(l.produit)} style={{ ...styles.qteBtn, color: '#c00' }}>✕</button>
                </div>
                <strong>{(l.prixUnitaire * l.quantite).toLocaleString('fr-SN')} F</strong>
              </div>
            ))}
          </div>
        )}

        <div style={styles.totalBox}>
          <span>Total</span>
          <strong style={{ fontSize: 20, color: '#c17c2e' }}>{total.toLocaleString('fr-SN')} FCFA</strong>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>Mode de paiement</label>
          <select value={modePaiement} onChange={e => setMode(e.target.value)} style={styles.select}>
            <option value="especes">Espèces</option>
            <option value="carte">Carte bancaire</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>Note (optionnel)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: commande spéciale…" style={styles.input} />
        </div>

        {erreur && <p style={styles.erreur}>{erreur}</p>}

        <button onClick={validerVente} disabled={loading || panier.length === 0} style={styles.btnValider}>
          {loading ? 'Enregistrement…' : '✅ Valider la vente'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper:     { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', height: '100%' },
  catalogue:   {},
  panier:      { background: '#fff', borderRadius: 12, padding: '1.5rem', border: '0.5px solid #e8e0d0', alignSelf: 'start', position: 'sticky', top: 0 },
  h1:          { fontSize: 24, fontWeight: 600, marginBottom: '1.5rem' },
  h2:          { fontSize: 18, fontWeight: 600, marginBottom: '1rem' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 },
  produitBtn:  { background: '#fff', border: '0.5px solid #e8e0d0', borderRadius: 10, padding: '0.8rem', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4 },
  produitNom:  { fontWeight: 500, fontSize: 14 },
  produitPrix: { color: '#c17c2e', fontWeight: 700, fontSize: 15 },
  stockAlert:  { fontSize: 11, color: '#c00', fontWeight: 500 },
  vide:        { color: '#aaa', fontStyle: 'italic', fontSize: 14 },
  lignes:      { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' },
  ligne:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '0.5px solid #f0ebe0' },
  qteBtn:      { width: 26, height: 26, borderRadius: 6, border: '1px solid #ddd', background: 'none', cursor: 'pointer', fontWeight: 700 },
  totalBox:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderTop: '1px solid #e8e0d0', marginBottom: '1rem' },
  select:      { width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: '#fff' },
  input:       { width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  label:       { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#444' },
  btnValider:  { width: '100%', padding: '0.8rem', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15 },
  erreur:      { background: '#fee', color: '#c00', padding: '0.5rem', borderRadius: 8, fontSize: 13, marginBottom: 8 },
};
