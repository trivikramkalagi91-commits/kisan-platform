import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = (url, opts) => axios({ url: `${API_BASE}${url}`, ...opts }).then(r => r.data);

export default function Barter() {
  const [listings, setListings] = useState([]);
  const [crops, setCrops] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [contactItem, setContactItem] = useState(null);
  const [filters, setFilters] = useState({ state: '', have_crop: '', want_crop: '' });
  const [form, setForm] = useState({ farmer_name:'', farmer_phone:'', village:'', district:'', state:'Karnataka', have_crop:'Rice', have_quantity:5, have_unit:'quintal', want_crop:'Wheat', want_quantity:4, want_unit:'quintal', description:'' });
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api('/barter/crops').then(r => setCrops(r.data)),
      api('/barter/states').then(r => setStates(r.data))
    ]);
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    try { const r = await api('/barter', { params: filters }); setListings(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function submitBarter() {
    if (!form.farmer_name || !form.farmer_phone) { alert('Name and phone required'); return; }
    setPosting(true);
    try {
      await api('/barter', { method: 'POST', data: form });
      setSuccess('Your barter listing is posted! Farmers will contact you directly.');
      setShowPost(false);
      fetchListings();
    } catch(e) { alert(e.message); }
    finally { setPosting(false); }
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div className="page-header" style={{ margin:0 }}>
          <h1>🔄 Barter System</h1>
          <p>Swap crops directly with nearby farmers — zero cash, zero commission</p>
        </div>
        <button className="btn-primary" onClick={() => setShowPost(true)}>+ Post Barter</button>
      </div>

      {success && <div className="success-msg" style={{ marginBottom:16 }}>{success}</div>}

      {/* How it works */}
      <div className="card" style={{ background:'#e3f2fd', border:'1px solid #90caf9', marginBottom:24 }}>
        <div style={{ fontWeight:700, marginBottom:8 }}>💡 How barter works</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, fontSize:13, color:'#374151' }}>
          {['Post what you have and what you need','Browse others looking for your crop','Contact them directly by phone','Agree on quantity and exchange location'].map((s,i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <span style={{ fontWeight:700, color:'#1565c0', minWidth:20 }}>{i+1}.</span><span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select value={filters.state} onChange={e => setFilters(f=>({...f,state:e.target.value}))}>
          <option value="">All States</option>
          {states.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={filters.have_crop} onChange={e => setFilters(f=>({...f,have_crop:e.target.value}))}>
          <option value="">Has any crop</option>
          {crops.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={filters.want_crop} onChange={e => setFilters(f=>({...f,want_crop:e.target.value}))}>
          <option value="">Wants any crop</option>
          {crops.map(c=><option key={c}>{c}</option>)}
        </select>
        <button className="btn-primary" onClick={fetchListings}>Search</button>
      </div>

      {loading && <div className="loading">Loading listings...</div>}
      {!loading && listings.length === 0 && (
        <div className="empty-state">
          <div className="icon">🔄</div>
          <h3>No barter listings found</h3>
          <p>Be the first to post what you want to swap!</p>
          <button className="btn-primary" style={{ marginTop:16 }} onClick={() => setShowPost(true)}>Post Barter</button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {listings.map(l => (
          <div key={l.id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ fontWeight:700, fontSize:15, color:'#374151' }}>
                <span style={{ color:'#2d6a2d' }}>Has: {l.have_quantity} {l.have_unit} {l.have_crop}</span>
              </div>
              <span style={{ fontSize:12, color:'#9ca3af' }}>{new Date(l.posted_at).toLocaleDateString()}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12, padding:'10px 14px', background:'#f0fdf4', borderRadius:8 }}>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontWeight:700, color:'#2d6a2d', fontSize:16 }}>{l.have_crop}</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>{l.have_quantity} {l.have_unit}</div>
              </div>
              <div style={{ fontSize:24 }}>⇄</div>
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontWeight:700, color:'#e65100', fontSize:16 }}>{l.want_crop}</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>{l.want_quantity} {l.want_unit}</div>
              </div>
            </div>
            {l.description && <p style={{ fontSize:13, color:'#6b7280', marginBottom:12, lineHeight:1.6 }}>{l.description}</p>}
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:12 }}>📍 {l.village}{l.district ? `, ${l.district}` : ''}, {l.state}</div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-primary btn-sm" onClick={() => setContactItem(l)}>Contact Farmer</button>
              <span style={{ fontSize:13, color:'#374151', alignSelf:'center' }}>👤 {l.farmer_name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Contact modal */}
      {contactItem && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e => { if(e.target===e.currentTarget) setContactItem(null); }}>
          <div style={{ background:'white', borderRadius:16, maxWidth:400, width:'100%', padding:28 }}>
            <h3 style={{ fontWeight:700, marginBottom:4 }}>{contactItem.farmer_name}</h3>
            <p style={{ color:'#6b7280', fontSize:13, marginBottom:16 }}>📍 {contactItem.village}, {contactItem.state}</p>
            <div style={{ background:'#f0fdf4', borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Offering to swap:</div>
              <div style={{ fontWeight:700, color:'#2d6a2d' }}>{contactItem.have_quantity} {contactItem.have_unit} {contactItem.have_crop}</div>
              <div style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>In exchange for: {contactItem.want_quantity} {contactItem.want_unit} {contactItem.want_crop}</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <a href={`tel:${contactItem.farmer_phone}`} style={{ flex:1 }}><button className="btn-primary btn-full">📞 Call {contactItem.farmer_phone}</button></a>
              <a href={`https://wa.me/91${contactItem.farmer_phone}?text=Hi ${contactItem.farmer_name}, I saw your barter listing on Kisan Platform. I am interested in exchanging ${contactItem.want_crop} for your ${contactItem.have_crop}.`} target="_blank" rel="noopener noreferrer" style={{ flex:1 }}><button style={{ background:'#25D366', color:'white', width:'100%' }}>💬 WhatsApp</button></a>
            </div>
            <button className="btn-secondary btn-full" style={{ marginTop:10 }} onClick={() => setContactItem(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Post modal */}
      {showPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={e => { if(e.target===e.currentTarget) setShowPost(false); }}>
          <div style={{ background:'white', borderRadius:16, maxWidth:540, width:'100%', maxHeight:'90vh', overflow:'auto', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontWeight:700 }}>Post a Barter</h2>
              <button onClick={() => setShowPost(false)} style={{ background:'none', fontSize:22, color:'#6b7280', padding:0 }}>✕</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Your Name *</label><input value={form.farmer_name} onChange={e=>setForm(f=>({...f,farmer_name:e.target.value}))} /></div>
              <div className="form-group"><label>Phone *</label><input value={form.farmer_phone} onChange={e=>setForm(f=>({...f,farmer_phone:e.target.value}))} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Village</label><input value={form.village} onChange={e=>setForm(f=>({...f,village:e.target.value}))} /></div>
              <div className="form-group"><label>State *</label>
                <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}>
                  {states.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ fontWeight:600, marginBottom:10, color:'#2d6a2d' }}>What you HAVE</div>
            <div className="form-row">
              <div className="form-group"><label>Crop *</label><select value={form.have_crop} onChange={e=>setForm(f=>({...f,have_crop:e.target.value}))}>{crops.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>Quantity</label><input type="number" value={form.have_quantity} onChange={e=>setForm(f=>({...f,have_quantity:e.target.value}))} /></div>
              <div className="form-group"><label>Unit</label><select value={form.have_unit} onChange={e=>setForm(f=>({...f,have_unit:e.target.value}))}>{['quintal','kg','tonne','bag (50kg)'].map(u=><option key={u}>{u}</option>)}</select></div>
            </div>
            <div style={{ fontWeight:600, marginBottom:10, color:'#e65100' }}>What you WANT</div>
            <div className="form-row">
              <div className="form-group"><label>Crop *</label><select value={form.want_crop} onChange={e=>setForm(f=>({...f,want_crop:e.target.value}))}>{crops.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>Quantity</label><input type="number" value={form.want_quantity} onChange={e=>setForm(f=>({...f,want_quantity:e.target.value}))} /></div>
              <div className="form-group"><label>Unit</label><select value={form.want_unit} onChange={e=>setForm(f=>({...f,want_unit:e.target.value}))}>{['quintal','kg','tonne','bag (50kg)'].map(u=><option key={u}>{u}</option>)}</select></div>
            </div>
            <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Quality, variety, pickup location details..." /></div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-primary btn-full" onClick={submitBarter} disabled={posting}>{posting ? 'Posting...' : 'Post Barter'}</button>
              <button className="btn-secondary" onClick={() => setShowPost(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}