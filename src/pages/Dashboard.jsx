import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [ventesRecentes, setVentesRecentes] = useState([]);

  useEffect(() => {
    if (isAdmin()) {
      api.get('/ventes/stats/jour').then(r => setStats(r.data)).catch(() => {});
    }
    api.get('/ventes').then(r => setVentesRecentes(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('fr-SN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      <h1 style={styles.h1}>Bonjour, {user?.nom} 👋</h1>
      <p style={styles.date}>{today}</p>

      {isAdmin() && stats && (
        <div style={styles.statsGrid}>
          <StatCard titre="Ventes aujourd'hui" valeur={stats.totalVentes} unite="ventes" />
          <StatCard titre="Chiffre d'affaires" valeur={`${stats.chiffreAffaires?.toLocaleString('fr-SN')} FCFA`} />
        </div>
      )}

      <h2 style={styles.h2}>Dernières ventes</h2>
      {ventesRecentes.length === 0 ? (
        <p style={styles.vide}>Aucune vente enregistrée aujourd'hui.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {['Heure', 'Caissier', 'Articles', 'Total', 'Paiement'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventesRecentes.map(v => (
              <tr key={v._id}>
                <td style={styles.td}>{new Date(v.createdAt).toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={styles.td}>{v.caissier?.nom || '—'}</td>
                <td style={styles.td}>{v.lignes?.length} article(s)</td>
                <td style={styles.td}><strong>{v.total?.toLocaleString('fr-SN')} F</strong></td>
                <td style={styles.td}><span style={{ ...styles.badge, background: badgeColor(v.modePaiement) }}>{v.modePaiement}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ titre, valeur, unite = '' }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitre}>{titre}</p>
      <p style={styles.cardValeur}>{valeur} <span style={{ fontSize: 14 }}>{unite}</span></p>
    </div>
  );
}

function badgeColor(mode) {
  return mode === 'carte' ? '#e8f4ff' : mode === 'mobile_money' ? '#f0f8e8' : '#fdf5e0';
}

const styles = {
  h1:         { fontSize: 24, fontWeight: 600, marginBottom: 4 },
  date:       { color: '#888', marginBottom: '2rem', textTransform: 'capitalize' },
  h2:         { fontSize: 18, fontWeight: 500, margin: '2rem 0 1rem' },
  vide:       { color: '#aaa', fontStyle: 'italic' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '2rem' },
  card:       { background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #e8e0d0' },
  cardTitre:  { fontSize: 13, color: '#888', marginBottom: 8 },
  cardValeur: { fontSize: 28, fontWeight: 600, color: '#c17c2e' },
  table:      { width: '100%', background: '#fff', borderRadius: 12, borderCollapse: 'collapse', border: '0.5px solid #e8e0d0' },
  th:         { padding: '0.75rem 1rem', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500, borderBottom: '1px solid #f0ebe0' },
  td:         { padding: '0.75rem 1rem', fontSize: 14, borderBottom: '0.5px solid #f5f0e8' },
  badge:      { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
};
