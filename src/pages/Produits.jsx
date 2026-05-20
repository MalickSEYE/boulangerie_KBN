import React, { useEffect, useState } from 'react';
import { produitsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CATS = ['pain','viennoiserie','patisserie','boisson','autre'];

export default function Produits() {
  const { isAdmin } = useAuth();
  const [produits,setProduits]=useState([]);const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');const [categorie,setCategorie]=useState('');
  const [showForm,setShowForm]=useState(false);const [editP,setEditP]=useState(null);
  const [form,setForm]=useState({nom:'',prix:'',stock:'',categorie:'pain',unite:'unité'});
  const [erreur,setErreur]=useState('');

  const charger=async()=>{setLoading(true);try{const r=await produitsAPI.list({categorie:categorie||undefined,search:search||undefined});setProduits(r.data);}catch{setProduits([]);}finally{setLoading(false);}};
  useEffect(()=>{charger();},[search,categorie]);

  const ouvrirForm=(p=null)=>{setErreur('');setEditP(p);setForm(p?{nom:p.nom,prix:p.prix,stock:p.stock,categorie:p.categorie,unite:p.unite}:{nom:'',prix:'',stock:'',categorie:'pain',unite:'unité'});setShowForm(true);};
  const sauvegarder=async()=>{setErreur('');try{if(editP){await produitsAPI.update(editP._id,form);}else{await produitsAPI.create(form);}setShowForm(false);charger();}catch(err){setErreur(err.response?.data?.message||'Erreur');}};
  const supprimer=async(id)=>{if(!confirm('Désactiver ?'))return;try{await produitsAPI.delete(id);charger();}catch{alert('Erreur');}};

  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
      <h1 style={{fontSize:24,fontWeight:600}}>Produits</h1>
      {isAdmin()&&<button onClick={()=>ouvrirForm()} style={btn.primary}>+ Ajouter</button>}
    </div>
    <div style={{display:'flex',gap:12,marginBottom:'1.5rem'}}>
      <input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={inp}/>
      <select value={categorie} onChange={e=>setCategorie(e.target.value)} style={inp}><option value="">Toutes catégories</option>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select>
    </div>
    {loading?<p>Chargement…</p>:(
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
        {produits.map(p=>(
          <div key={p._id} style={{background:'#fff',borderRadius:12,padding:'1rem',border:'0.5px solid #e8e0d0'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{padding:'2px 10px',borderRadius:20,fontSize:11,background:'#fdf5e0'}}>{p.categorie}</span>
              {isAdmin()&&<div style={{display:'flex',gap:4}}>
                <button onClick={()=>ouvrirForm(p)} style={btn.sm}>✏️</button>
                <button onClick={()=>supprimer(p._id)} style={{...btn.sm,color:'#c00'}}>🗑</button>
              </div>}
            </div>
            <p style={{fontWeight:600,fontSize:15,marginBottom:4}}>{p.nom}</p>
            <p style={{color:'#c17c2e',fontWeight:700,fontSize:17,marginBottom:4}}>{p.prix?.toLocaleString('fr-SN')} FCFA</p>
            <p style={{fontSize:13,color:'#888'}}>Stock : <strong>{p.stock}</strong> {p.unite}</p>
          </div>
        ))}
      </div>
    )}
    {showForm&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
      <div style={{background:'#fff',borderRadius:16,padding:'2rem',width:'100%',maxWidth:440}}>
        <h2 style={{marginBottom:'1rem'}}>{editP?'Modifier':'Nouveau produit'}</h2>
        {erreur&&<p style={{background:'#fee',color:'#c00',padding:'0.5rem',borderRadius:8,fontSize:13,marginBottom:12}}>{erreur}</p>}
        {[['Nom','nom','text'],['Prix (FCFA)','prix','number'],['Stock','stock','number'],['Unité','unite','text']].map(([l,k,t])=>(
          <div key={k} style={{marginBottom:12}}><label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>{l}</label>
          <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{...inp,width:'100%'}}/></div>
        ))}
        <div style={{marginBottom:12}}><label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Catégorie</label>
        <select value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} style={{...inp,width:'100%'}}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={()=>setShowForm(false)} style={btn.secondary}>Annuler</button>
          <button onClick={sauvegarder} style={btn.primary}>Enregistrer</button>
        </div>
      </div>
    </div>)}
  </div>);
}
const inp={padding:'0.6rem 0.8rem',borderRadius:8,border:'1px solid #ddd',fontSize:14,background:'#fff'};
const btn={primary:{padding:'0.6rem 1.2rem',background:'#c17c2e',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:500},secondary:{padding:'0.6rem 1.2rem',background:'none',border:'1px solid #ddd',borderRadius:8,cursor:'pointer'},sm:{padding:'4px 8px',background:'none',border:'1px solid #eee',borderRadius:6,cursor:'pointer',fontSize:14}};
