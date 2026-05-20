import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ventesAPI } from '../api';

export default function Ventes() {
  const [ventes,setVentes]=useState([]);const [loading,setLoading]=useState(true);const [date,setDate]=useState('');
  const charger=async()=>{setLoading(true);try{const r=await ventesAPI.list(date?{date}:{});setVentes(r.data);}catch{setVentes([]);}finally{setLoading(false);}};
  useEffect(()=>{charger();},[date]);
  const total=ventes.reduce((s,v)=>s+v.total,0);
  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
      <h1 style={{fontSize:24,fontWeight:600}}>Historique des ventes</h1>
      <Link to="/ventes/nouvelle" style={{padding:'0.6rem 1.2rem',background:'#c17c2e',color:'#fff',borderRadius:8,textDecoration:'none',fontWeight:500}}>+ Nouvelle vente</Link>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem',flexWrap:'wrap'}}>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:'0.55rem 0.8rem',borderRadius:8,border:'1px solid #ddd',fontSize:14}}/>
      {date&&<button onClick={()=>setDate('')} style={{padding:'0.55rem 0.9rem',background:'none',border:'1px solid #ddd',borderRadius:8,cursor:'pointer',fontSize:14}}>Effacer</button>}
      <span style={{marginLeft:'auto',fontSize:15}}>Total : <strong>{total.toLocaleString('fr-SN')} FCFA</strong></span>
    </div>
    {loading?<p>Chargement…</p>:ventes.length===0?<p style={{color:'#aaa',fontStyle:'italic'}}>Aucune vente.</p>:(
      <table style={{width:'100%',background:'#fff',borderRadius:12,borderCollapse:'collapse',border:'0.5px solid #e8e0d0'}}>
        <thead><tr>{['Date & heure','Caissier','Articles','Paiement','Total'].map(h=><th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:12,color:'#888',fontWeight:500,borderBottom:'1px solid #f0ebe0'}}>{h}</th>)}</tr></thead>
        <tbody>{ventes.map(v=>(
          <tr key={v._id}>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}>{new Date(v.createdAt).toLocaleDateString('fr-SN')} {new Date(v.createdAt).toLocaleTimeString('fr-SN',{hour:'2-digit',minute:'2-digit'})}</td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}>{v.caissier?.nom||'—'}</td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}>{v.lignes?.map(l=>`${l.nomProduit} ×${l.quantite}`).join(', ')}</td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8'}}><span style={{padding:'2px 10px',borderRadius:20,fontSize:12,background:'#fdf5e0'}}>{v.modePaiement}</span></td>
            <td style={{padding:'0.75rem 1rem',fontSize:14,borderBottom:'0.5px solid #f5f0e8',fontWeight:700,color:'#c17c2e'}}>{v.total?.toLocaleString('fr-SN')} F</td>
          </tr>
        ))}</tbody>
      </table>
    )}
  </div>);
}
