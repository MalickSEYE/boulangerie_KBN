import React, { useEffect, useState } from 'react';
import api from '../api';

const ROLES = ['admin', 'caissier', 'vendeur', 'livreur'];

export default function Employes() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = async () => {
    setLoading(true);
    try { setUsers((await api.get('/users')).data); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { charger(); }, []);

  const changerRole = async (id, role) => {
    try { await api.put(`/users/${id}/role`, { role }); charger(); }
    catch { alert('Erreur lors du changement de rôle'); }
  };

  const toggleActif = async (id, actif) => {
    try { await api.put(`/users/${id}/actif`, { actif }); charger(); }
    catch { alert('Erreur'); }
  };

  const roleColor = (r) => ({ admin: '#fde8f0', caissier: '#fdf5e0', vendeur: '#e8f4ff', livreur: '#f0f8e8' }[r] || '#f0f0f0');

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.h1}>Employés</h1>
        <p style={{ color: '#888', fontSize: 14 }}>Les nouveaux comptes sont créés via l'API ou par un admin connecté.</p>
      </div>

      {loading ? <p>Chargement…</p> : (
        <table style={styles.table}>
          <thead>
            <tr>
              {['Nom', 'Email', 'Rôle', 'Statut', 'Créé le', 'Actions'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ opacity: u.actif ? 1 : 0.5 }}>
                <td style={styles.td}><strong>{u.nom}</strong></td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <select
                    value={u.role}
                    onChange={e => changerRole(u._id, e.target.value)}
                    style={{ ...styles.select, background: roleColor(u.role) }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: u.actif ? '#e8f8ee' : '#fee', color: u.actif ? '#2e7d32' : '#c00' }}>
                    {u.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString('fr-SN')}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => toggleActif(u._id, !u.actif)}
                    style={styles.btnSm}
                  >
                    {u.actif ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 },
  h1:      { fontSize: 24, fontWeight: 600 },
  table:   { width: '100%', background: '#fff', borderRadius: 12, borderCollapse: 'collapse', border: '0.5px solid #e8e0d0' },
  th:      { padding: '0.75rem 1rem', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500, borderBottom: '1px solid #f0ebe0' },
  td:      { padding: '0.75rem 1rem', fontSize: 14, borderBottom: '0.5px solid #f5f0e8' },
  select:  { padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, cursor: 'pointer' },
  badge:   { padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  btnSm:   { padding: '4px 12px', background: 'none', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};
