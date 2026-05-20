import React, { useEffect, useState } from 'react';
import { usersAPI } from '../api';

const ROLES=['admin','caissier','vendeur','livreur'];

export default function Employes() {
  const [users,setUsers]=useState([]);const [loading,setLoading]=useState(true);
  const charger=async()=>{setLoading(true);try{setUsers((await usersAPI.list()).data);}catch{setUsers([]);}finally{setLoading(false);}};
  useEffect(()=>{charger();},[]);
  const changerRole=async(id,role)=>{try{await usersAPI.setRole(id,role);charger();}catch{alert('Erreur');}};
  const toggleActif=async(id,actif)=>{try{await usersAPI.setActif(id,actif);charger();}catch{alert('Erreur');}};
  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem'}}>
      <h1 style={{fontSize:24,fontWeight:600}}>Employés</h1>
    </div>
    {loading?<p>Chargement…</p>:(
      <table style={{width:'100%',background:'#fff',borderRadius:12,borderCollapse:'collapse',border:'0.5px solid #e8e0d0'}}>
        <thead><tr>{['Nom','Email','Rôle','Statut','Créé le','Actions'].map(h=><th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:12,color:'#888',fontWeight:500,borderBottom:'1px solid #f0ebe0'}}>{h}</th>)}</tr></thead>
        <tbody>{users.map(u=>(
          <tr key={u._id} style={{opacity:u.actif?1:0.5}}>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}><strong>{u.nom}</strong></td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}>{u.email}</td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}>
              <select value={u.role} onChange={e=>changerRole(u._id,e.target.value)} style={{padding:'4px 8px',borderRadius:6,border:'1px solid #ddd',fontSize:13,cursor:'pointer'}}>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}><span style={{padding:'2px 10px',borderRadius:20,fontSize:12,background:u.actif?'#e8f8ee':'#fee',color:u.actif?'#2e7d32':'#c00'}}>{u.actif?'Actif':'Inactif'}</span></td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}>{new Date(u.createdAt).toLocaleDateString('fr-SN')}</td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}><button onClick={()=>toggleActif(u._id,!u.actif)} style={{padding:'4px 12px',background:'none',border:'1px solid #ddd',borderRadius:6,cursor:'pointer',fontSize:13}}>{u.actif?'Désactiver':'Réactiver'}</button></td>
          </tr>
        ))}</tbody>
      </table>
    )}
  </div>);
}
