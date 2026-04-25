import React, { useState, useEffect } from 'react';
import { getSchemes, checkEligibility } from '../utils/api';
import axios from 'axios';

const TYPE_LABEL = { central: '🇮🇳 Central', state: '📍 State' };
const TYPE_BADGE = { central: 'badge-blue', state: 'badge-green' };

function SchemeCard({ scheme, onOpen }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
            <span className={`badge ${TYPE_BADGE[scheme.type]}`}>{TYPE_LABEL[scheme.type]}{scheme.state ? ` — ${scheme.state}` : ''}</span>
            <span className="tag">{scheme.category.replace(/_/g, ' ')}</span>
            {scheme.last_updated && <span style={{ fontSize: 11, color: '#9ca3af' }}>Updated: {scheme.last_updated}</span>}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{scheme.name}</h3>
          <p style={{ color: '#6b7280', fontSize: 13 }}>{scheme.full_name}</p>
        </div>
        {scheme.benefit_amount > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#2d6a2d' }}>₹{scheme.benefit_amount.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>benefit amount</div>
          </div>
        )}
        {scheme.benefit_amount === 0 && (
          <span style={{ background: '#e8f5e9', color: '#2d6a2d', fontWeight: 700, padding: '4px 10px', borderRadius: 20, fontSize: 13 }}>FREE</span>
        )}
      </div>

      <p style={{ fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 1.7 }}>{scheme.benefit}</p>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 5 }}>Documents needed:</div>
        <div>{scheme.documents.slice(0, 3).map(d => <span key={d} className="tag">{d}</span>)}{scheme.documents.length > 3 && <span className="tag">+{scheme.documents.length - 3} more</span>}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-primary btn-sm" onClick={() => onOpen(scheme)}>How to Apply →</button>
        <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1565c0' }}>Official Site ↗</a>
        {scheme.helpline && <span style={{ fontSize: 12, color: '#6b7280' }}>📞 {scheme.helpline}</span>}
        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>Deadline: {scheme.deadline?.split('.')[0]}</span>
      </div>
    </div>
  );
}

function SchemeModal({ scheme, onClose }) {
  if (!scheme) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 580, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span className={`badge ${TYPE_BADGE[scheme.type]}`}>{TYPE_LABEL[scheme.type]}{scheme.state ? ` — ${scheme.state}` : ''}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: '#6b7280', padding: 0 }}>✕</button>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{scheme.name}</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>{scheme.full_name}</p>
        <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 16 }}>Ministry: {scheme.ministry}</p>

        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#2d6a2d', marginBottom: 4 }}>BENEFIT</div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{scheme.benefit}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>ELIGIBILITY</div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{scheme.eligibility.description}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>HOW TO APPLY — STEP BY STEP</div>
          {scheme.apply_steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8f5e9', color: '#2d6a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, paddingTop: 4 }}>{step}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>DOCUMENTS NEEDED</div>
          <div>{scheme.documents.map(d => <span key={d} className="tag" style={{ margin: 3 }}>{d}</span>)}</div>
        </div>

        <div style={{ marginBottom: 20, fontSize: 13, color: '#6b7280' }}>
          <strong>Deadline:</strong> {scheme.deadline}
          {scheme.helpline && <span style={{ marginLeft: 16 }}>📞 Helpline: <strong>{scheme.helpline}</strong></span>}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer">
            <button className="btn-primary">Apply at Official Site ↗</button>
          </a>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allStates, setAllStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ state: '', category: '', search: '', type: '' });
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showEligibility, setShowEligibility] = useState(false);
  const [eligForm, setEligForm] = useState({ state: 'Karnataka', land_acres: 2, farmer_type: 'small' });
  const [eligResult, setEligResult] = useState(null);
  const [eligLoading, setEligLoading] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/schemes/meta`).then(r => {
      setAllStates(r.data.states);
      setCategories(r.data.categories);
    }).catch(console.error);
    fetchSchemes();
  }, []);

  async function fetchSchemes() {
    setLoading(true);
    try {
      const res = await getSchemes(filters);
      setSchemes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleCheckEligibility() {
    setEligLoading(true);
    try {
      const res = await checkEligibility(eligForm);
      setEligResult(res);
    } catch (e) { console.error(e); }
    finally { setEligLoading(false); }
  }

  const centralCount = schemes.filter(s => s.type === 'central').length;
  const stateCount = schemes.filter(s => s.type === 'state').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header">
        <h1>🏛️ Government Schemes</h1>
        <p>Real government schemes with official apply links — central + all state schemes</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Schemes', val: schemes.length || '20+' },
          { label: 'Central Schemes', val: centralCount || '10' },
          { label: 'State Schemes', val: stateCount || '10+' },
          { label: 'States Covered', val: '15+' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 16px' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{s.label}: </span>
            <span style={{ fontWeight: 700, color: '#2d6a2d' }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Eligibility checker */}
      <div className="card" style={{ background: '#e3f2fd', border: '1px solid #90caf9', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>🎯 Check Your Eligibility</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Enter your details — see exactly which schemes you qualify for</div>
          </div>
          <button className="btn-primary btn-sm" style={{ background: '#1565c0' }} onClick={() => setShowEligibility(!showEligibility)}>
            {showEligibility ? 'Hide' : 'Check Now'}
          </button>
        </div>

        {showEligibility && (
          <div style={{ marginTop: 16 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Your State</label>
                <select value={eligForm.state} onChange={e => setEligForm(f => ({ ...f, state: e.target.value }))}>
                  {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Land you own (acres)</label>
                <input type="number" min="0.1" max="100" step="0.5" value={eligForm.land_acres}
                  onChange={e => setEligForm(f => ({ ...f, land_acres: parseFloat(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label>Farmer Type</label>
                <select value={eligForm.farmer_type} onChange={e => setEligForm(f => ({ ...f, farmer_type: e.target.value }))}>
                  <option value="marginal">Marginal (less than 1 acre)</option>
                  <option value="small">Small (1–5 acres)</option>
                  <option value="large">Large (more than 5 acres)</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" onClick={handleCheckEligibility} disabled={eligLoading}>
              {eligLoading ? 'Checking...' : 'Show My Schemes'}
            </button>

            {eligResult && (
              <div style={{ marginTop: 16, padding: 14, background: '#f0fdf4', borderRadius: 10 }}>
                <div style={{ fontWeight: 700, color: '#2d6a2d', marginBottom: 12 }}>
                  ✅ You qualify for {eligResult.count} schemes!
                </div>
                {eligResult.data.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #d1fae5', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      {s.benefit_amount > 0 && <span style={{ fontSize: 13, color: '#2d6a2d', marginLeft: 8, fontWeight: 700 }}>₹{s.benefit_amount.toLocaleString()}</span>}
                      <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{s.benefit.slice(0, 50)}...</span>
                    </div>
                    <button className="btn-primary btn-sm" onClick={() => setSelectedScheme(s)}>View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input placeholder="Search schemes..." value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && fetchSchemes()} />
        <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}>
          <option value="">All States</option>
          {allStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">Central + State</option>
          <option value="central">Central Only</option>
          <option value="state">State Only</option>
        </select>
        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn-primary" onClick={fetchSchemes}>Filter</button>
      </div>

      {loading && <div className="loading">Loading schemes...</div>}

      {!loading && schemes.length === 0 && (
        <div className="empty-state">
          <div className="icon">🏛️</div>
          <h3>No schemes found</h3>
          <p>Try clearing the filters or searching differently</p>
        </div>
      )}

      {/* Central schemes section */}
      {!loading && schemes.filter(s => s.type === 'central').length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1565c0', marginBottom: 12, padding: '8px 14px', background: '#e3f2fd', borderRadius: 8 }}>
            🇮🇳 Central Government Schemes ({schemes.filter(s => s.type === 'central').length}) — Available in all states
          </h3>
          {schemes.filter(s => s.type === 'central').map(s => <SchemeCard key={s.id} scheme={s} onOpen={setSelectedScheme} />)}
        </div>
      )}

      {/* State schemes section */}
      {!loading && schemes.filter(s => s.type === 'state').length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d6a2d', marginBottom: 12, padding: '8px 14px', background: '#e8f5e9', borderRadius: 8 }}>
            📍 State Government Schemes ({schemes.filter(s => s.type === 'state').length})
          </h3>
          {schemes.filter(s => s.type === 'state').map(s => <SchemeCard key={s.id} scheme={s} onOpen={setSelectedScheme} />)}
        </div>
      )}

      <SchemeModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
    </div>
  );
}