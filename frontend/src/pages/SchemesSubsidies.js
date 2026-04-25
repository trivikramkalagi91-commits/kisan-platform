import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getSchemes, checkEligibility, getSubsidyMeta, getSubsidies, applySubsidy } from '../utils/api';
import axios from 'axios';

// ─── Constants ──────────────────────────────────────────────────────────────
const TYPE_LABEL = { central: '🇮🇳 Central', state: '📍 State' };
const TYPE_BADGE = { central: 'badge-blue', state: 'badge-green' };

const BENEFIT_COLORS = {
  percent_subsidy: { bg: '#e8f5e9', color: '#2d6a2d' },
  free: { bg: '#e3f2fd', color: '#1565c0' },
  grant: { bg: '#fff3e0', color: '#e65100' },
  mixed: { bg: '#f3e5f5', color: '#6a1b9a' },
};

const BENEFIT_LABELS = {
  irrigation: '💧 Irrigation',
  mechanization: '🚜 Machinery',
  solar: '☀️ Solar',
  storage: '🏭 Storage',
  seeds: '🌱 Seeds',
  protective_cultivation: '🏗️ Polyhouse',
  fpo: '👥 FPO',
  organic: '🌿 Organic',
  water_conservation: '🪣 Water Conservation',
  horticulture: '🍎 Horticulture',
};

// ─── Sub-components for Schemes ──────────────────────────────────────────────

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
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

// ─── Sub-components for Subsidies ────────────────────────────────────────────

function SubsidyBenefit({ sub }) {
  const bc = BENEFIT_COLORS[sub.benefit_type] || BENEFIT_COLORS.percent_subsidy;
  if (sub.benefit_type === 'free') {
    return (
      <span style={{ background: bc.bg, color: bc.color, fontWeight: 700, padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>
        100% FREE
      </span>
    );
  }
  if (sub.subsidy_percent) {
    return (
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: bc.color }}>{sub.subsidy_percent}%</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>subsidy</div>
      </div>
    );
  }
  return null;
}

function SubsidyCard({ sub, onOpen, onApply }) {
  return (
    <div className="card" style={{ marginBottom: 14, transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
            <span className={`badge ${TYPE_BADGE[sub.type]}`}>{TYPE_LABEL[sub.type]}{sub.state ? ` — ${sub.state}` : ''}</span>
            <span className="tag">{BENEFIT_LABELS[sub.category] || sub.category.replace(/_/g, ' ')}</span>
            {sub.last_updated && <span style={{ fontSize: 11, color: '#9ca3af' }}>Updated: {sub.last_updated}</span>}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{sub.name}</h3>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 0 }}>{sub.short_name}</p>
        </div>
        <SubsidyBenefit sub={sub} />
      </div>
      <p style={{ fontSize: 14, color: '#374151', marginBottom: 10, lineHeight: 1.7 }}>{sub.description}</p>
      {sub.max_benefit_inr && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
          Max benefit: <strong style={{ color: '#2d6a2d' }}>₹{sub.max_benefit_inr.toLocaleString()}</strong>
        </div>
      )}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Documents needed:</div>
        <div>
          {sub.documents.slice(0, 3).map(d => <span key={d} className="tag">{d}</span>)}
          {sub.documents.length > 3 && <span className="tag">+{sub.documents.length - 3} more</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn-primary btn-sm" onClick={() => onOpen(sub)}>View Details →</button>
        <button className="btn-secondary btn-sm" onClick={() => onApply(sub)}>Apply Now</button>
        <a href={sub.apply_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#1565c0' }}>Official Site ↗</a>
        {sub.helpline && <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>📞 {sub.helpline}</span>}
      </div>
    </div>
  );
}

function SubsidyDetailModal({ sub, onClose, onApply }) {
  if (!sub) return null;
  const bc = BENEFIT_COLORS[sub.benefit_type] || BENEFIT_COLORS.percent_subsidy;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 620, width: '100%', maxHeight: '92vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className={`badge ${TYPE_BADGE[sub.type]}`}>{TYPE_LABEL[sub.type]}{sub.state ? ` — ${sub.state}` : ''}</span>
              <span className="tag">{BENEFIT_LABELS[sub.category] || sub.category}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{sub.name}</h2>
            <p style={{ color: '#6b7280', fontSize: 13 }}>{sub.short_name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: '#6b7280', padding: 0, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ background: bc.bg, borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            {sub.subsidy_percent && <div style={{ fontSize: 36, fontWeight: 900, color: bc.color, lineHeight: 1 }}>{sub.subsidy_percent}%</div>}
            {sub.benefit_type === 'free' && <div style={{ fontSize: 28, fontWeight: 900, color: bc.color }}>FREE</div>}
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Subsidy</div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{sub.description}</p>
            {sub.max_benefit_inr && <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: bc.color }}>Maximum benefit: ₹{sub.max_benefit_inr.toLocaleString()}</div>}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>ELIGIBILITY</div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{sub.eligibility.description}</p>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sub.eligibility.min_land_acres > 0 && <span className="tag">Min land: {sub.eligibility.min_land_acres} acre</span>}
            <span className="tag">Crops: {sub.eligibility.crops}</span>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>HOW TO APPLY — STEP BY STEP</div>
          {sub.apply_steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8f5e9', color: '#2d6a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, paddingTop: 4 }}>{step}</p>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>DOCUMENTS NEEDED</div>
          <div>{sub.documents.map(d => <span key={d} className="tag" style={{ margin: 3 }}>{d}</span>)}</div>
        </div>
        <div style={{ marginBottom: 20, padding: 12, background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#6b7280' }}>
          <div><strong>Deadline:</strong> {sub.deadline}</div>
          {sub.helpline && <div style={{ marginTop: 4 }}>📞 Helpline: <strong>{sub.helpline}</strong></div>}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => { onClose(); onApply(sub); }}>Apply Now</button>
          <a href={sub.apply_link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>Official Site ↗</a>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ApplicationModal({ sub, onClose }) {
  const [form, setForm] = useState({ farmer_name: '', mobile: '', state: sub?.state || '', village: '', land_acres: '', farmer_category: 'small', crop: '', aadhaar_last4: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!sub) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.farmer_name.trim()) return setError('Please enter your name.');
    if (!/^\d{10}$/.test(form.mobile)) return setError('Mobile number must be exactly 10 digits.');
    setSubmitting(true);
    try {
      const res = await applySubsidy({ subsidy_id: sub.id, ...form });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to submit.');
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '92vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div><h2 style={{ fontSize: 19, fontWeight: 700 }}>Apply for Subsidy</h2><p style={{ fontSize: 13, color: '#6b7280' }}>{sub.name}</p></div>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: '#6b7280', padding: 0 }}>✕</button>
        </div>
        {result ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <h3>Application Submitted!</h3>
            <div style={{ background: '#e8f5e9', padding: 16, borderRadius: 10, margin: '16px 0' }}>
              <div style={{ fontSize: 13 }}>Reference Number</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{result.data.reference_number}</div>
            </div>
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group"><label>Full Name *</label><input value={form.farmer_name} onChange={e => setForm({ ...form, farmer_name: e.target.value })} /></div>
            <div className="form-group"><label>Mobile *</label><input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} /></div>
            <div className="form-group"><label>State *</label>
              <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
                <option value="">Select State</option>
                {['Karnataka', 'Maharashtra', 'Punjab', 'Andhra Pradesh', 'Tamil Nadu'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Interest'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Unified Page ───────────────────────────────────────────────────────

export default function SchemesSubsidies() {
  const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' or 'subsidies'
  
  // Schemes State
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [allStates, setAllStates] = useState([]);
  const [schemeCategories, setSchemeCategories] = useState([]);
  const [schemeFilters, setSchemeFilters] = useState({ state: '', category: '', search: '', type: '' });
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showEligibility, setShowEligibility] = useState(false);
  const [eligForm, setEligForm] = useState({ state: 'Karnataka', land_acres: 2, farmer_type: 'small' });
  const [eligResult, setEligResult] = useState(null);
  const [eligLoading, setEligLoading] = useState(false);

  // Subsidies State
  const [subsidies, setSubsidies] = useState([]);
  const [subsidiesLoading, setSubsidiesLoading] = useState(true);
  const [subsidyMeta, setSubsidyMeta] = useState({ categories: [], states: [], farmer_categories: [] });
  const [subsidyFilters, setSubsidyFilters] = useState({ state: '', category: '', type: '', search: '' });
  const [selectedSub, setSelectedSub] = useState(null);
  const [applyingSub, setApplyingSub] = useState(null);

  const location = useLocation();

  useEffect(() => {
    // Parse URL params for deep linking
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const tab = params.get('tab');

    if (tab === 'schemes' || tab === 'subsidies') {
      setActiveTab(tab);
    }

    // Load meta for both
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/schemes/meta`).then(r => {
      setAllStates(r.data.states);
      setSchemeCategories(r.data.categories);
    }).catch(console.error);

    getSubsidyMeta().then(r => setSubsidyMeta(r.data)).catch(console.error);

    // Initial fetch with potential deep links
    if (tab === 'subsidies') {
      const newFilters = { ...subsidyFilters, search: query };
      setSubsidyFilters(newFilters);
      getSubsidies(newFilters).then(res => setSubsidies(res.data)).finally(() => setSubsidiesLoading(false));
      fetchSchemes(); // Still load schemes in background
    } else {
      const newFilters = { ...schemeFilters, search: query };
      setSchemeFilters(newFilters);
      getSchemes(newFilters).then(res => setSchemes(res.data)).finally(() => setSchemesLoading(false));
      fetchSubsidies(); // Still load subsidies in background
    }
  }, [location.search]); // eslint-disable-line

  async function fetchSchemes() {
    setSchemesLoading(true);
    try {
      const res = await getSchemes(schemeFilters);
      setSchemes(res.data);
    } catch (e) { console.error(e); }
    finally { setSchemesLoading(false); }
  }

  async function fetchSubsidies() {
    setSubsidiesLoading(true);
    try {
      const res = await getSubsidies(subsidyFilters);
      setSubsidies(res.data);
    } catch (e) { console.error(e); }
    finally { setSubsidiesLoading(false); }
  }

  async function handleCheckEligibility() {
    setEligLoading(true);
    try {
      const res = await checkEligibility(eligForm);
      setEligResult(res);
    } catch (e) { console.error(e); }
    finally { setEligLoading(false); }
  }

  function resetSchemes() {
    setEligResult(null);
    setSchemeFilters({ state: '', category: '', search: '', type: '' });
    fetchSchemes();
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header">
        <h1>🏛️ Government Benefits</h1>
        <p>One-stop shop for all direct schemes and capital subsidies for farmers</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#f3f4f6', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        <button 
          onClick={() => setActiveTab('schemes')}
          style={{ 
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            background: activeTab === 'schemes' ? 'white' : 'transparent',
            color: activeTab === 'schemes' ? '#2d6a2d' : '#6b7280',
            boxShadow: activeTab === 'schemes' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          💰 Direct Schemes
        </button>
        <button 
          onClick={() => setActiveTab('subsidies')}
          style={{ 
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            background: activeTab === 'subsidies' ? 'white' : 'transparent',
            color: activeTab === 'subsidies' ? '#1565c0' : '#6b7280',
            boxShadow: activeTab === 'subsidies' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🚜 Capital Subsidies
        </button>
      </div>

      {activeTab === 'schemes' ? (
        <>
          {/* Eligibility checker */}
          <div className="card" style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>🎯 Check Scheme Eligibility</div>
                <div style={{ fontSize: 13, color: '#4b5563' }}>Enter details to see which schemes you can apply for</div>
              </div>
              <button className="btn-primary btn-sm" onClick={() => setShowEligibility(!showEligibility)}>
                {showEligibility ? 'Hide' : 'Check Now'}
              </button>
            </div>
            {showEligibility && (
              <div style={{ marginTop: 16 }}>
                <div className="form-row">
                  <div className="form-group"><label>State</label>
                    <select value={eligForm.state} onChange={e => setEligForm({...eligForm, state: e.target.value})}>
                      {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Land (acres)</label><input type="number" value={eligForm.land_acres} onChange={e => setEligForm({...eligForm, land_acres: e.target.value})} /></div>
                </div>
                <button className="btn-primary" onClick={handleCheckEligibility} disabled={eligLoading}>{eligLoading ? 'Checking...' : 'Find My Schemes'}</button>
                {eligResult && (
                  <div style={{ marginTop: 12, padding: '12px 16px', background: 'white', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#2d6a2d', fontWeight: 600 }}>✅ You qualify for {eligResult.count} schemes!</div>
                    <button className="btn-secondary btn-sm" onClick={resetSchemes}>View All Schemes</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="filter-bar">
            <input placeholder="Search schemes..." value={schemeFilters.search} onChange={e => setSchemeFilters({...schemeFilters, search: e.target.value})} onKeyDown={e => e.key === 'Enter' && fetchSchemes()} />
            <select value={schemeFilters.state} onChange={e => setSchemeFilters({...schemeFilters, state: e.target.value})}><option value="">All States</option>{allStates.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <button className="btn-primary" onClick={fetchSchemes}>Filter</button>
          </div>

          {schemesLoading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {eligResult ? (
                <>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ height: 2, flex: 1, background: '#e5e7eb' }}></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2d6a2d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🌟 Your Recommended Schemes ({eligResult.data.length})
                    </span>
                    <div style={{ height: 2, flex: 1, background: '#e5e7eb' }}></div>
                  </div>
                  {eligResult.data.map(s => (
                    <div key={s.id} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: -8, left: 16, zIndex: 10, background: '#2d6a2d', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>MATCHED</div>
                      <SchemeCard scheme={s} onOpen={setSelectedScheme} />
                    </div>
                  ))}

                  <div style={{ marginTop: 40, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ height: 2, flex: 1, background: '#e5e7eb' }}></div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Explore Other Schemes
                    </span>
                    <div style={{ height: 2, flex: 1, background: '#e5e7eb' }}></div>
                  </div>
                  {schemes
                    .filter(s => !eligResult.data.find(e => e.id === s.id))
                    .map(s => (
                      <div key={s.id} style={{ opacity: 0.7 }}>
                        <SchemeCard scheme={s} onOpen={setSelectedScheme} />
                      </div>
                    ))}
                </>
              ) : (
                schemes.map(s => <SchemeCard key={s.id} scheme={s} onOpen={setSelectedScheme} />)
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div style={{ background: 'linear-gradient(135deg, #1565c0, #1976d2)', color: 'white', padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>💡 What is a Capital Subsidy?</h3>
            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 0, marginTop: 8 }}>The government pays a percentage (usually 30-90%) of your equipment cost. You pay the rest. Great for tractors, drip systems, and solar pumps.</p>
          </div>

          <div className="filter-bar">
            <input placeholder="Search subsidies..." value={subsidyFilters.search} onChange={e => setSubsidyFilters({...subsidyFilters, search: e.target.value})} onKeyDown={e => e.key === 'Enter' && fetchSubsidies()} />
            <select value={subsidyFilters.state} onChange={e => setSubsidyFilters({...subsidyFilters, state: e.target.value})}><option value="">All States</option>{subsidyMeta.states.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <button className="btn-primary" onClick={fetchSubsidies}>Filter</button>
          </div>

          {subsidiesLoading ? <div className="loading">Loading...</div> : subsidies.map(s => <SubsidyCard key={s.id} sub={s} onOpen={setSelectedSub} onApply={setApplyingSub} />)}
        </>
      )}

      <SchemeModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
      <SubsidyDetailModal sub={selectedSub} onClose={() => setSelectedSub(null)} onApply={sub => { setSelectedSub(null); setApplyingSub(sub); }} />
      <ApplicationModal sub={applyingSub} onClose={() => setApplyingSub(null)} />
    </div>
  );
}
