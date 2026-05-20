import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ventesAPI } from '../api';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [ventesRecentes, setVentesRecentes] = useState([]);

  useEffect(() => {
    if (isAdmin()) ventesAPI.statsJour().then(r => setStats(r.data)).catch(() => {});
    ventesAPI.list().then(r => setVentesRecentes(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('fr-SN', { weekday:'long', day:'numeric', month:'long' });

  return (
    <div>
      <h1 style={s.h1}>Bonjour, {user?.nom} 👋</h1>
      <p style={s.date}>{today}</p>
      {isAdmin() && stats && (
        <div style={s.grid}>
          <div style={s.card}><p style={s.ct}>Ventes aujourd'hui</p><p style={s.cv}>{stats.totalVentes}</p></div>
          <div style={s.card}><p style={s.ct}>Chiffre d'affaires</p><p style={s.cv}>{stats.chiffreAffaires?.toLocaleString('fr-SN')} <span style={{fontSize:14}}>FCFA</span></p></div>
        </div>
      )}
      <h2 style={s.h2}>Dernières ventes</h2>
      {ventesRecentes.length === 0 ? <p style={{color:'#aaa',fontStyle:'italic'}}>Aucune vente aujourd'hui.</p> : (
        <table style={s.table}><thead><tr>{['Heure','Caissier','Articles','Total','Paiement'].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>{ventesRecentes.map(v=>(
            <tr key={v._id}>
              <td style={s.td}>{new Date(v.createdAt).toLocaleTimeString('fr-SN',{hour:'2-digit',minute:'2-digit'})}</td>
              <td style={s.td}>{v.caissier?.nom||'—'}</td>
              <td style={s.td}>{v.lignes?.length} art.</td>
              <td style={s.td}><strong>{v.total?.toLocaleString('fr-SN')} F</strong></td>
              <td style={s.td}><span style={{padding:'2px 10px',borderRadius:20,fontSize:12,background:'#fdf5e0'}}>{v.modePaiement}</span></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
const s={h1:{fontSize:24,fontWeight:600,marginBottom:4},date:{color:'#888',marginBottom:'2rem',textTransform:'capitalize'},h2:{fontSize:18,fontWeight:500,margin:'2rem 0 1rem'},grid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:'2rem'},card:{background:'#fff',borderRadius:12,padding:'1.25rem',border:'0.5px solid #e8e0d0'},ct:{fontSize:13,color:'#888',marginBottom:8},cv:{fontSize:28,fontWeight:600,color:'#c17c2e'},table:{width:'100%',background:'#fff',borderRadius:12,borderCollapse:'collapse',border:'0.5px solid #e8e0d0'},th:{padding:'0.75rem 1rem',textAlign:'left',fontSize:12,color:'#888',fontWeight:500,borderBottom:'1px solid #f0ebe0'},td:{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}};
