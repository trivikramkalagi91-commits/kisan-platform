import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = (url) => axios.get(`${API_BASE}${url}`).then(r => r.data);
const DIFF_COLOR = { Easy:'badge-green', Medium:'badge-amber', Hard:'badge-blue' };

export default function BusinessHub() {
  const [ideas, setIdeas] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ difficulty:'', max_investment:'' });

  useEffect(() => {
    Promise.all([
      api('/business').then(r => setIdeas(r.data)),
      api('/business/meta/loans').then(r => setLoans(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  async function applyFilter() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.difficulty) params.set('difficulty', filter.difficulty);
      if (filter.max_investment) params.set('max_investment', filter.max_investment);
      const r = await axios.get(`${API_BASE}/business?${params}`).then(r => r.data);
      setIdeas(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
      <div className="page-header">
        <h1>🏪 Business Hub</h1>
        <p>Start a business beyond farming — with investment estimates, loan schemes and step-by-step guide</p>
      </div>

      {/* Motivational banner */}
      <div className="card" style={{ background:'linear-gradient(135deg,#1b5e20,#2d6a2d)', color:'white', marginBottom:24 }}>
        <div style={{ fontSize:15, fontWeight:700, marginBottom:8 }}>💡 Many farmers earn more from agri-business than farming itself</div>
        <p style={{ fontSize:13, opacity:0.9, lineHeight:1.7 }}>
          A pipe shop, tractor rental or dairy farm can give you stable monthly income regardless of crop prices. Government schemes like Mudra and PMEGP give loans at low interest with zero to minimal collateral.
        </p>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom:24 }}>
        <select value={filter.difficulty} onChange={e=>setFilter(f=>({...f,difficulty:e.target.value}))}>
          <option value="">All Difficulty</option>
          <option value="Easy">Easy to start</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard (High reward)</option>
        </select>
        <select value={filter.max_investment} onChange={e=>setFilter(f=>({...f,max_investment:e.target.value}))}>
          <option value="">Any Investment</option>
          <option value="200000">Under ₹2 lakh</option>
          <option value="500000">Under ₹5 lakh</option>
          <option value="1000000">Under ₹10 lakh</option>
        </select>
        <button className="btn-primary" onClick={applyFilter}>Filter</button>
      </div>

      {loading && <div className="loading">Loading business ideas...</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16, marginBottom:32 }}>
        {ideas.map(idea => (
          <div key={idea.id} className="card" style={{ cursor:'pointer', transition:'all 0.15s' }}
            onClick={() => setSelected(idea)}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ fontSize:36 }}>{idea.icon}</div>
              <span className={`badge ${DIFF_COLOR[idea.difficulty]}`}>{idea.difficulty}</span>
            </div>
            <h3 style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{idea.title}</h3>
            <p style={{ fontSize:13, color:'#6b7280', marginBottom:14, lineHeight:1.6 }}>{idea.description}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
              <div style={{ background:'#f0fdf4', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#9ca3af' }}>Investment</div>
                <div style={{ fontWeight:700, color:'#e65100', fontSize:13 }}>₹{(idea.investment_min/1000).toFixed(0)}K – ₹{(idea.investment_max/1000).toFixed(0)}K</div>
              </div>
              <div style={{ background:'#f0fdf4', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#9ca3af' }}>Monthly Profit</div>
                <div style={{ fontWeight:700, color:'#2d6a2d', fontSize:13 }}>₹{(idea.monthly_profit_min/1000).toFixed(0)}K – ₹{(idea.monthly_profit_max/1000).toFixed(0)}K</div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6b7280' }}>
              <span>📍 {idea.location}</span>
              <span>⏱️ Payback: {idea.payback_months} months</span>
            </div>
          </div>
        ))}
      </div>

      {/* Loan schemes */}
      <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>💳 Loan Schemes for Starting Business</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:14, marginBottom:32 }}>
        {loans.map(loan => (
          <div key={loan.name} className="card">
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{loan.name}</div>
            <div style={{ fontSize:13, color:'#6b7280', marginBottom:8 }}>{loan.type}</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
              <span>Max: <strong>₹{(loan.max_amount/100000).toFixed(0)} lakh</strong></span>
              <span>Rate: <strong style={{ color:'#2d6a2d' }}>{loan.interest}</strong></span>
            </div>
            <div style={{ fontSize:12, color:'#9ca3af', marginBottom:12 }}>Collateral: {loan.collateral}</div>
            <a href={loan.link} target="_blank" rel="noopener noreferrer"><button className="btn-secondary btn-sm btn-full">Apply Online ↗</button></a>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
          <div style={{ background:'white', borderRadius:16, maxWidth:580, width:'100%', maxHeight:'90vh', overflow:'auto', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:36 }}>{selected.icon}</span>
              <button onClick={()=>setSelected(null)} style={{ background:'none', fontSize:22, color:'#6b7280', padding:0 }}>✕</button>
            </div>
            <h2 style={{ fontWeight:800, fontSize:20, marginBottom:4 }}>{selected.title}</h2>
            <p style={{ color:'#6b7280', fontSize:13, marginBottom:16 }}>📍 {selected.location} · Payback in {selected.payback_months} months</p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[
                { label:'Investment', val:`₹${selected.investment_min.toLocaleString()} – ₹${selected.investment_max.toLocaleString()}` },
                { label:'Monthly Profit', val:`₹${selected.monthly_profit_min.toLocaleString()} – ₹${selected.monthly_profit_max.toLocaleString()}` },
                { label:'Market Size', val:selected.market_size },
                { label:'Difficulty', val:selected.difficulty }
              ].map(s=>(
                <div key={s.label} style={{ background:'#f9fafb', borderRadius:8, padding:12 }}>
                  <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontWeight:700, fontSize:15, color:'#2d6a2d' }}>{s.val}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize:14, color:'#374151', lineHeight:1.7, marginBottom:16 }}>{selected.description}</p>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#6b7280', marginBottom:8 }}>WHO IS THIS SUITABLE FOR</div>
              {selected.suitable_for.map(s=><div key={s} style={{ fontSize:13, color:'#374151', padding:'4px 0' }}>✓ {s}</div>)}
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#6b7280', marginBottom:10 }}>HOW TO START — STEP BY STEP</div>
              {selected.steps.map((step, i)=>(
                <div key={i} style={{ display:'flex', gap:12, marginBottom:10 }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'#e8f5e9', color:'#2d6a2d', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>{i+1}</div>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.6, paddingTop:4 }}>{step}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#6b7280', marginBottom:8 }}>GOVT SCHEMES TO FUND THIS</div>
              {selected.schemes.map(s=><div key={s} style={{ display:'flex', gap:8, fontSize:13, color:'#374151', padding:'4px 0' }}><span style={{ color:'#2d6a2d' }}>₹</span>{s}</div>)}
            </div>

            <button className="btn-secondary btn-full" onClick={()=>setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}