import React, { useState, useEffect } from 'react';
import { getListings, createListing, getCategories } from '../utils/api';

const CONDITION_LABELS = { new: '✨ New', good: '👍 Good Condition', fair: '⚠️ Fair' };
const STATES = ['Karnataka','Maharashtra','Punjab','Andhra Pradesh','Tamil Nadu','Uttar Pradesh','Rajasthan','Madhya Pradesh'];

function ListingCard({ listing, onContact }) {
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => onContact(listing)}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span className="tag">{listing.sub_category || listing.category}</span>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{listing.views} views</span>
      </div>
      <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.4 }}>{listing.title}</h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
        {listing.description.slice(0, 100)}{listing.description.length > 100 ? '...' : ''}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#2d6a2d' }}>₹{listing.price.toLocaleString()}</div>
          {listing.is_negotiable && <div style={{ fontSize: 11, color: '#9ca3af' }}>Negotiable</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>📍 {listing.village}, {listing.state}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{CONDITION_LABELS[listing.condition]}</div>
        </div>
      </div>
    </div>
  );
}

function ListingModal({ listing, onClose }) {
  if (!listing) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="tag">{listing.sub_category || listing.category}</span>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: '#6b7280', padding: 0 }}>✕</button>
        </div>
        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{listing.title}</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>📍 {listing.village}{listing.district ? `, ${listing.district}` : ''}, {listing.state}</p>

        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 28, color: '#2d6a2d' }}>₹{listing.price.toLocaleString()}</div>
            {listing.price_unit && <div style={{ fontSize: 12, color: '#9ca3af' }}>{listing.price_unit}</div>}
            {listing.is_negotiable && <span className="badge badge-green" style={{ marginTop: 4 }}>Negotiable</span>}
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: '#6b7280' }}>
            <div>{CONDITION_LABELS[listing.condition]}</div>
            <div style={{ marginTop: 4 }}>{listing.views} people viewed</div>
          </div>
        </div>

        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20 }}>{listing.description}</p>

        <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Contact Seller</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2d6a2d' }}>
              {listing.seller_name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{listing.seller_name}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>📞 {listing.seller_phone}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={`tel:${listing.seller_phone}`} style={{ flex: 1 }}>
              <button className="btn-primary btn-full">📞 Call Now</button>
            </a>
            <a href={`https://wa.me/91${listing.seller_phone}?text=Hi, I saw your listing "${listing.title}" on Kisan Platform. Is it still available?`} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
              <button style={{ background: '#25D366', color: 'white', width: '100%' }}>💬 WhatsApp</button>
            </a>
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Listed on {new Date(listing.posted_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function PostListingModal({ onClose, onSuccess, categories }) {
  const [form, setForm] = useState({
    title: '', category: 'equipment', sub_category: '', price: '', is_negotiable: true,
    seller_name: '', seller_phone: '', village: '', district: '', state: 'Karnataka',
    description: '', condition: 'good'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  const cat = categories.find(c => c.id === form.category);

  async function submit() {
    if (!form.title || !form.price || !form.seller_name || !form.seller_phone || !form.state) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true); setError('');
    try { await createListing(form); onSuccess(); onClose(); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Post a Listing</h2>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: '#6b7280', padding: 0 }}>✕</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Sub-category</label>
            <select value={form.sub_category} onChange={e => set('sub_category', e.target.value)}>
              <option value="">Select...</option>
              {cat?.sub.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Mahindra 575 DI Tractor — 2018 model" /></div>
        <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what you're selling — age, condition, why selling..." /></div>
        <div className="form-row">
          <div className="form-group"><label>Price (₹) *</label><input type="number" value={form.price} onChange={e => set('price', e.target.value)} /></div>
          <div className="form-group"><label>Negotiable?</label>
            <select value={form.is_negotiable} onChange={e => set('is_negotiable', e.target.value === 'true')}>
              <option value="true">Yes</option><option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Condition</label>
            <select value={form.condition} onChange={e => set('condition', e.target.value)}>
              <option value="new">New</option><option value="good">Good</option><option value="fair">Fair</option>
            </select>
          </div>
          <div className="form-group"><label>State *</label>
            <select value={form.state} onChange={e => set('state', e.target.value)}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Village</label><input value={form.village} onChange={e => set('village', e.target.value)} /></div>
          <div className="form-group"><label>District</label><input value={form.district} onChange={e => set('district', e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Your Name *</label><input value={form.seller_name} onChange={e => set('seller_name', e.target.value)} /></div>
          <div className="form-group"><label>Phone *</label><input value={form.seller_phone} onChange={e => set('seller_phone', e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary btn-full" onClick={submit} disabled={loading}>{loading ? 'Posting...' : 'Post Listing'}</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', state: '', search: '' });
  const [selectedListing, setSelectedListing] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    try { const res = await getListings(filters); setListings(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>🛒 Farmer Marketplace</h1>
          <p>Buy and sell equipment, seeds, livestock and produce — farmer to farmer</p>
        </div>
        <button className="btn-primary" onClick={() => setShowPostModal(true)}>+ Sell Something</button>
      </div>

      {/* Category quick filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        <button onClick={() => { setFilters(f => ({ ...f, category: '' })); fetchListings(); }}
          style={{ background: !filters.category ? '#2d6a2d' : 'white', color: !filters.category ? 'white' : '#374151', border: '1.5px solid', borderColor: !filters.category ? '#2d6a2d' : '#e5e7eb', whiteSpace: 'nowrap', padding: '6px 14px' }}>
          All
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilters(f => ({ ...f, category: c.id }))}
            style={{ background: filters.category === c.id ? '#2d6a2d' : 'white', color: filters.category === c.id ? 'white' : '#374151', border: '1.5px solid', borderColor: filters.category === c.id ? '#2d6a2d' : '#e5e7eb', whiteSpace: 'nowrap', padding: '6px 14px' }}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <input placeholder="Search listings..." value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && fetchListings()} />
        <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}>
          <option value="">All States</option>
          {STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-primary" onClick={fetchListings}>Search</button>
      </div>

      {loading && <div className="loading">Loading listings...</div>}
      {!loading && listings.length === 0 && (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>No listings found</h3>
          <p>Be the first to sell something!</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowPostModal(true)}>Post a Listing</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {listings.map(l => <ListingCard key={l.id} listing={l} onContact={setSelectedListing} />)}
      </div>

      {selectedListing && <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
      {showPostModal && <PostListingModal onClose={() => setShowPostModal(false)} onSuccess={fetchListings} categories={categories} />}
    </div>
  );
}
