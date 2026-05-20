import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Ventes() {
  const [ventes, setVentes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate]       = useState('');

  const charger = async () => {
    setLoading(true);
    try {
      const params = {};
      if (date) params.date = date;
      const res = await api.get('/ventes', { params });
      setVentes(res.data);
    } catch { setVentes([]); }
    finally  { setLoading(false); }
  };

  useEffect(() => { charger(); }, [date]);

  const totalJour = ventes.reduce((s, v) => s + v.total, 0);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.h1}>Historique des ventes</h1>
        <Link to="/ventes/nouvelle" style={styles.btnPrimary}>+ Nouvelle vente</Link>
      </div>

      <div style={styles.filtres}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
        {date && <button onClick={() => setDate('')} style={styles.btnSecondary}>Effacer le filtre</button>}
        <span style={styles.total}>Total : <strong>{totalJour.toLocaleString('fr-SN')} FCFA</strong></span>
      </div>

      {loading ? <p>Chargement…</p> : ventes.length === 0 ? (
        <p style={{ color: '#aaa', fontStyle: 'italic' }}>Aucune vente trouvée.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {['Date & heure', 'Caissier', 'Articles', 'Paiement', 'Total'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventes.map(v => (
              <tr key={v._id}>
                <td style={styles.td}>
                  {new Date(v.createdAt).toLocaleDateString('fr-SN')} {' '}
                  {new Date(v.createdAt).toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={styles.td}>{v.caissier?.nom || '—'}</td>
                <td style={styles.td}>
                  {v.lignes?.map(l => `${l.nomProduit} ×${l.quantite}`).join(', ')}
                </td>
                <td style={styles.td}><span style={{ ...styles.badge, background: badgeColor(v.modePaiement) }}>{v.modePaiement}</span></td>
                <td style={{ ...styles.td, fontWeight: 700, color: '#c17c2e' }}>{v.total?.toLocaleString('fr-SN')} F</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function badgeColor(mode) {
  return { carte: '#e8f4ff', mobile_money: '#f0f8e8', especes: '#fdf5e0' }[mode] || '#f0f0f0';
}

const styles = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  h1:          { fontSize: 24, fontWeight: 600 },
  filtres:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' },
  total:       { marginLeft: 'auto', fontSize: 15 },
  input:       { padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  btnPrimary:  { padding: '0.6rem 1.2rem', background: '#c17c2e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, textDecoration: 'none' },
  btnSecondary:{ padding: '0.55rem 0.9rem', background: 'none', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  table:       { width: '100%', background: '#fff', borderRadius: 12, borderCollapse: 'collapse', border: '0.5px solid #e8e0d0' },
  th:          { padding: '0.75rem 1rem', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500, borderBottom: '1px solid #f0ebe0' },
  td:          { padding: '0.75rem 1rem', fontSize: 14, borderBottom: '0.5px solid #f5f0e8', verticalAlign: 'middle' },
  badge:       { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
};
