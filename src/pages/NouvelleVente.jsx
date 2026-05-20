import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { produitsAPI, ventesAPI } from '../api';

export default function NouvelleVente() {
  const navigate=useNavigate();
  const [produits,setProduits]=useState([]);const [panier,setPanier]=useState([]);
  const [mode,setMode]=useState('especes');const [note,setNote]=useState('');
  const [loading,setLoading]=useState(false);const [erreur,setErreur]=useState('');

  useEffect(()=>{produitsAPI.list().then(r=>setProduits(r.data)).catch(()=>{});},[]);

  const ajouter=(p)=>setPanier(prev=>{const ex=prev.find(l=>l.produit===p._id.toString());if(ex)return prev.map(l=>l.produit===p._id.toString()?{...l,quantite:l.quantite+1}:l);return [...prev,{produit:p._id.toString(),nomProduit:p.nom,prixUnitaire:p.prix,quantite:1}];});
  const modQte=(id,d)=>setPanier(prev=>prev.map(l=>l.produit===id?{...l,quantite:Math.max(1,l.quantite+d)}:l));
  const retirer=(id)=>setPanier(prev=>prev.filter(l=>l.produit!==id));
  const total=panier.reduce((s,l)=>s+l.prixUnitaire*l.quantite,0);

  const valider=async()=>{
    if(panier.length===0)return setErreur('Le panier est vide');
    setErreur('');setLoading(true);
    try{await ventesAPI.create({lignes:panier.map(l=>({produit:l.produit,quantite:l.quantite})),modePaiement:mode,note});navigate('/ventes');}
    catch(err){setErreur(err.response?.data?.message||'Erreur');}
    finally{setLoading(false);}
  };

  return(<div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'2rem'}}>
    <div>
      <h1 style={{fontSize:24,fontWeight:600,marginBottom:'1.5rem'}}>Nouvelle vente</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
        {produits.map(p=>(
          <button key={p._id} onClick={()=>ajouter(p)} disabled={p.stock===0} style={{background:'#fff',border:'0.5px solid #e8e0d0',borderRadius:10,padding:'0.8rem',cursor:'pointer',textAlign:'left',display:'flex',flexDirection:'column',gap:4}}>
            <span style={{fontWeight:500,fontSize:14}}>{p.nom}</span>
            <span style={{color:'#c17c2e',fontWeight:700,fontSize:15}}>{p.prix?.toLocaleString('fr-SN')} F</span>
            {p.stock<=5&&<span style={{fontSize:11,color:'#c00'}}>Stock:{p.stock}</span>}
          </button>
        ))}
      </div>
    </div>
    <div style={{background:'#fff',borderRadius:12,padding:'1.5rem',border:'0.5px solid #e8e0d0',alignSelf:'start',position:'sticky',top:0}}>
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:'1rem'}}>Panier</h2>
      {panier.length===0?<p style={{color:'#aaa',fontStyle:'italic',fontSize:14}}>Cliquez sur un produit</p>:(
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:'1rem'}}>
          {panier.map(l=>(
            <div key={l.produit} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.5rem 0',borderBottom:'0.5px solid #f0ebe0'}}>
              <div><p style={{fontWeight:500,fontSize:14}}>{l.nomProduit}</p><p style={{fontSize:12,color:'#888'}}>{l.prixUnitaire?.toLocaleString('fr-SN')} F×{l.quantite}</p></div>
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                <button onClick={()=>modQte(l.produit,-1)} style={{width:26,height:26,borderRadius:6,border:'1px solid #ddd',background:'none',cursor:'pointer',fontWeight:700}}>−</button>
                <span style={{fontWeight:600,minWidth:20,textAlign:'center'}}>{l.quantite}</span>
                <button onClick={()=>modQte(l.produit,1)} style={{width:26,height:26,borderRadius:6,border:'1px solid #ddd',background:'none',cursor:'pointer',fontWeight:700}}>+</button>
                <button onClick={()=>retirer(l.produit)} style={{width:26,height:26,borderRadius:6,border:'1px solid #ddd',background:'none',cursor:'pointer',color:'#c00',fontWeight:700}}>✕</button>
              </div>
              <strong>{(l.prixUnitaire*l.quantite).toLocaleString('fr-SN')} F</strong>
            </div>
          ))}
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderTop:'1px solid #e8e0d0',marginBottom:'1rem'}}>
        <span>Total</span><strong style={{fontSize:20,color:'#c17c2e'}}>{total.toLocaleString('fr-SN')} FCFA</strong>
      </div>
      <div style={{marginBottom:12}}><label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Mode de paiement</label>
        <select value={mode} onChange={e=>setMode(e.target.value)} style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ddd',fontSize:14,background:'#fff'}}>
          <option value="especes">Espèces</option><option value="carte">Carte</option><option value="mobile_money">Mobile Money</option>
        </select>
      </div>
      <div style={{marginBottom:12}}><label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Note</label>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Optionnel…" style={{width:'100%',padding:'0.6rem',borderRadius:8,border:'1px solid #ddd',fontSize:14}}/>
      </div>
      {erreur&&<p style={{background:'#fee',color:'#c00',padding:'0.5rem',borderRadius:8,fontSize:13,marginBottom:8}}>{erreur}</p>}
      <button onClick={valider} disabled={loading||panier.length===0} style={{width:'100%',padding:'0.8rem',background:'#2e7d32',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:15}}>
        {loading?'Enregistrement…':'✅ Valider la vente'}
      </button>
    </div>
  </div>);
}
