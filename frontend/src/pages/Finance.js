import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = (url, opts) => axios({ url: `${API_BASE}${url}`, ...opts }).then(r => r.data);

const RISK_COLOR = { low:'#2d6a2d', medium:'#e65100', high:'#c62828' };

export default function Finance() {
  const [loans, setLoans] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [emiForm, setEmiForm] = useState({ principal:100000, rate:7, months:12 });
  const [emiResult, setEmiResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api('/finance/loans').then(r => setLoans(r.data)),
      api('/finance/insurance').then(r => setInsurance(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  async function calcEMI() {
    setCalcLoading(true);
    try { const r = await api('/finance/emi-calculator', { method:'POST', data:emiForm }); setEmiResult(r.data); }
    catch(e) { console.error(e); }
    finally { setCalcLoading(false); }
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
      <div className="page-header">
        <h1>💰 Finance Section</h1>
        <p>Compare all farm loans side by side — find the lowest interest rate</p>
      </div>

      <div className="card" style={{ background:'#fff3e0', border:'1px solid #ffcc80', marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>💡 Key fact most farmers don't know</div>
        <p style={{ fontSize:14, color:'#374151', lineHeight:1.7 }}>
          The Kisan Credit Card (KCC) gives crop loans at just <strong>4% interest</strong> per year — with government interest subvention. Moneylenders charge 36-60%. If you don't have a KCC yet, getting one is the single best financial move you can make today.
        </p>
      </div>

      {loading && <div className="loading">Loading finance options...</div>}

      <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Loan Options — Sorted by Interest Rate</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
        {loans.map((loan, i) => (
          <div key={loan.id} className="card" style={{ border: i===0 ? '2px solid #2d6a2d' : '1px solid #e5e7eb' }}>
            {i===0 && <div style={{ background:'#2d6a2d', color:'white', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:'6px 6px 0 0', marginTop:-20, marginLeft:-20, marginRight:-20, marginBottom:12 }}>⭐ LOWEST RATE — RECOMMENDED</div>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700, fontSize:18, color:'#2d6a2d' }}>{loan.interest_rate}% / year</span>
                  <span className="badge badge-green">{loan.bank_short}</span>
                  <span className="tag">{loan.type}</span>
                </div>
                <div style={{ fontWeight:600, fontSize:15, marginBottom:4 }}>{loan.bank}</div>
                <div style={{ fontSize:13, color:'#6b7280', marginBottom:8 }}>Max: ₹{loan.max_amount.toLocaleString()} · {loan.tenure} · Collateral: {loan.collateral}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {loan.features.map(f => <span key={f} className="tag">✓ {f}</span>)}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <button className="btn-primary btn-sm" onClick={() => setSelectedLoan(loan)}>How to Apply</button>
                <a href={loan.apply_link} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'#1565c0', textAlign:'center' }}>Official Site ↗</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:32 }}>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>🧮 EMI Calculator</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Loan Amount (₹)</label>
            <input type="number" value={emiForm.principal} onChange={e=>setEmiForm(f=>({...f,principal:parseInt(e.target.value)}))} />
          </div>
          <div className="form-group">
            <label>Interest Rate (% per year)</label>
            <input type="number" step="0.5" value={emiForm.rate} onChange={e=>setEmiForm(f=>({...f,rate:parseFloat(e.target.value)}))} />
          </div>
          <div className="form-group">
            <label>Loan Period (months)</label>
            <input type="number" value={emiForm.months} onChange={e=>setEmiForm(f=>({...f,months:parseInt(e.target.value)}))} />
          </div>
        </div>
        <button className="btn-primary" onClick={calcEMI} disabled={calcLoading}>{calcLoading ? 'Calculating...' : 'Calculate EMI'}</button>
        {emiResult && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginTop:16 }}>
            {[
              { label:'Monthly EMI', val:`₹${emiResult.emi.toLocaleString()}`, color:'#2d6a2d' },
              { label:'Total Payment', val:`₹${emiResult.total_payment.toLocaleString()}`, color:'#374151' },
              { label:'Total Interest', val:`₹${emiResult.total_interest.toLocaleString()}`, color:'#c62828' },
              { label:'Principal', val:`₹${emiResult.principal.toLocaleString()}`, color:'#1565c0' }
            ].map(s => (
              <div key={s.label} style={{ background:'#f9fafb', borderRadius:8, padding:14, textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontWeight:800, fontSize:20, color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>🛡️ Crop Insurance</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
        {insurance.map(ins => (
          <div key={ins.id} className="card">
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{ins.name}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#2d6a2d', marginBottom:4 }}>{ins.premium_pct}% premium</div>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:10 }}>Coverage: {ins.coverage}</div>
            <div style={{ marginBottom:12 }}>
              {ins.covers.map(c => <div key={c} style={{ fontSize:13, color:'#374151', padding:'2px 0' }}>✓ {c}</div>)}
            </div>
            <a href={ins.apply_link} target="_blank" rel="noopener noreferrer"><button className="btn-secondary btn-sm btn-full">Apply Now ↗</button></a>
          </div>
        ))}
      </div>

      {selectedLoan && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e=>{if(e.target===e.currentTarget) setSelectedLoan(null);}}>
          <div style={{ background:'white', borderRadius:16, maxWidth:520, width:'100%', maxHeight:'90vh', overflow:'auto', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ fontWeight:700 }}>{selectedLoan.bank}</h2>
              <button onClick={()=>setSelectedLoan(null)} style={{ background:'none', fontSize:22, color:'#6b7280', padding:0 }}>✕</button>
            </div>
            <div style={{ fontWeight:700, fontSize:22, color:'#2d6a2d', marginBottom:4 }}>{selectedLoan.interest_rate}% interest · Max ₹{selectedLoan.max_amount.toLocaleString()}</div>
            <p style={{ fontSize:13, color:'#6b7280', marginBottom:20 }}>{selectedLoan.eligibility}</p>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#6b7280', marginBottom:8 }}>DOCUMENTS NEEDED</div>
              {selectedLoan.documents.map(d => <span key={d} className="tag" style={{ margin:3 }}>{d}</span>)}
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#6b7280', marginBottom:10 }}>HOW TO APPLY</div>
              {selectedLoan.steps.map((s,i) => (
                <div key={i} style={{ display:'flex', gap:12, marginBottom:10, alignItems:'flex-start' }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'#e8f5e9', color:'#2d6a2d', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>{i+1}</div>
                  <p style={{ fontSize:14, color:'#374151', lineHeight:1.6, paddingTop:3 }}>{s}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <a href={selectedLoan.apply_link} target="_blank" rel="noopener noreferrer"><button className="btn-primary">Apply Now ↗</button></a>
              <button className="btn-secondary" onClick={()=>setSelectedLoan(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}