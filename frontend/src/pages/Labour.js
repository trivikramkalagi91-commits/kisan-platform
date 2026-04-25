import React, { useState, useEffect } from 'react';
import { getJobs, postJob, applyJob, getWorkTypes } from '../utils/api';

function JobCard({ job, onApply }) {
  const spotsLeft = job.workers_needed - job.workers_applied;
  const urgency = spotsLeft <= 2 ? 'badge-red' : spotsLeft <= 5 ? 'badge-amber' : 'badge-green';

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span className="tag">{job.work_type}</span>
            <span className="tag">🌾 {job.crop}</span>
            <span className={`badge ${urgency}`}>{spotsLeft} spots left</span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</h3>
          <p style={{ color: '#6b7280', fontSize: 13 }}>📍 {job.village}, {job.district}, {job.state}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#2d6a2d' }}>₹{job.wage_per_day}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>per day</div>
        </div>
      </div>

      <p style={{ fontSize: 14, color: '#374151', marginBottom: 12, lineHeight: 1.6 }}>{job.description}</p>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280', marginBottom: 12, flexWrap: 'wrap' }}>
        <span>📅 {job.start_date} to {job.end_date}</span>
        <span>👥 {job.workers_needed} workers needed</span>
        <span>{job.food_included ? '🍽️ Food included' : 'Food not included'}</span>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary btn-sm" onClick={() => onApply(job)} disabled={job.status !== 'open'}>
          {job.status === 'open' ? 'Apply Now' : 'Filled'}
        </button>
        <a href={`tel:${job.farmer_phone}`} style={{ fontSize: 13, color: '#2d6a2d', textDecoration: 'none' }}>
          📞 Call {job.farmer_name}
        </a>
        <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
          Posted: {new Date(job.posted_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function PostJobModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    farmer_name: '', farmer_phone: '', village: '', district: '', state: 'Karnataka',
    crop: '', work_type: 'Harvesting', workers_needed: 5, wage_per_day: 400,
    food_included: false, start_date: '', end_date: '', description: '', title: ''
  });
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getWorkTypes().then(r => setWorkTypes(r.data)); }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.farmer_name || !form.farmer_phone || !form.village || !form.start_date) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true); setError('');
    try {
      await postJob(form);
      onSuccess();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Post a Labour Job</h2>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: '#6b7280', padding: 0 }}>✕</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-row">
          <div className="form-group"><label>Your Name *</label><input value={form.farmer_name} onChange={e => set('farmer_name', e.target.value)} placeholder="Ramaiah Gowda" /></div>
          <div className="form-group"><label>Your Phone *</label><input value={form.farmer_phone} onChange={e => set('farmer_phone', e.target.value)} placeholder="9876543210" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Village *</label><input value={form.village} onChange={e => set('village', e.target.value)} /></div>
          <div className="form-group"><label>District</label><input value={form.district} onChange={e => set('district', e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>State *</label>
            <select value={form.state} onChange={e => set('state', e.target.value)}>
              {['Karnataka','Maharashtra','Punjab','Andhra Pradesh','Tamil Nadu','Uttar Pradesh'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Work Type</label>
            <select value={form.work_type} onChange={e => set('work_type', e.target.value)}>
              {workTypes.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Crop</label><input value={form.crop} onChange={e => set('crop', e.target.value)} placeholder="Paddy, Cotton, Tomato..." /></div>
          <div className="form-group"><label>Workers Needed</label><input type="number" min="1" value={form.workers_needed} onChange={e => set('workers_needed', e.target.value)} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Wage per Day (₹)</label><input type="number" value={form.wage_per_day} onChange={e => set('wage_per_day', e.target.value)} /></div>
          <div className="form-group"><label>Food Included?</label>
            <select value={form.food_included} onChange={e => set('food_included', e.target.value === 'true')}>
              <option value="true">Yes</option><option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Start Date *</label><input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
          <div className="form-group"><label>End Date</label><input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} /></div>
        </div>
        <div className="form-group">
          <label>Job Description</label>
          <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the work, any requirements, transport arrangements..." />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary btn-full" onClick={submit} disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState({ worker_name: '', worker_phone: '', workers_count: 1, message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    if (!form.worker_name || !form.worker_phone) { setError('Name and phone required'); return; }
    setLoading(true);
    try {
      const res = await applyJob(job.id, form);
      setSuccess(res.message);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 440, width: '100%', padding: 28 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 4 }}>Apply for Job</h2>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>{job.title} — ₹{job.wage_per_day}/day</p>

        {success ? (
          <div>
            <div className="success-msg">{success}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Farmer's phone: <strong>{job.farmer_phone}</strong></div>
            <button className="btn-primary btn-full" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-row">
              <div className="form-group"><label>Your Name *</label><input value={form.worker_name} onChange={e => setForm(f => ({ ...f, worker_name: e.target.value }))} /></div>
              <div className="form-group"><label>Phone Number *</label><input value={form.worker_phone} onChange={e => setForm(f => ({ ...f, worker_phone: e.target.value }))} /></div>
            </div>
            <div className="form-group">
              <label>How many workers? (including yourself)</label>
              <input type="number" min="1" value={form.workers_count} onChange={e => setForm(f => ({ ...f, workers_count: parseInt(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Message to farmer (optional)</label>
              <textarea rows={2} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Experience, availability note..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary btn-full" onClick={submit} disabled={loading}>{loading ? 'Applying...' : 'Apply Now'}</button>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Labour() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', work_type: '' });
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyJob, setApplyJobState] = useState(null);
  const [tab, setTab] = useState('browse');

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    setLoading(true);
    try { const res = await getJobs(filters); setJobs(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>👷 Labour Hiring</h1>
          <p>Find harvest workers or farm work near you</p>
        </div>
        <button className="btn-amber" onClick={() => setShowPostModal(true)}>+ Post a Job</button>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {[['browse', '🔍 Find Work'], ['urgent', '🔥 Urgent']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ background: tab === id ? 'white' : 'none', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: tab === id ? 600 : 400, color: tab === id ? '#2d6a2d' : '#6b7280', boxShadow: tab === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <select value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))}>
          <option value="">All States</option>
          {['Karnataka','Maharashtra','Punjab','Andhra Pradesh','Tamil Nadu','Uttar Pradesh'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.work_type} onChange={e => setFilters(f => ({ ...f, work_type: e.target.value }))}>
          <option value="">All Work Types</option>
          {['Harvesting','Planting','Weeding','Spraying','Irrigation','Land Preparation','Sorting & Packing'].map(w => <option key={w}>{w}</option>)}
        </select>
        <button className="btn-primary" onClick={fetchJobs}>Search</button>
      </div>

      {loading && <div className="loading">Loading jobs...</div>}
      {!loading && jobs.length === 0 && (
        <div className="empty-state">
          <div className="icon">👷</div>
          <h3>No jobs found</h3>
          <p>Be the first to post a job in your area!</p>
          <button className="btn-amber" style={{ marginTop: 16 }} onClick={() => setShowPostModal(true)}>Post a Job</button>
        </div>
      )}

      {(tab === 'urgent' ? jobs.filter(j => (j.workers_needed - j.workers_applied) <= 3) : jobs)
        .map(job => <JobCard key={job.id} job={job} onApply={setApplyJobState} />)}

      {showPostModal && <PostJobModal onClose={() => setShowPostModal(false)} onSuccess={fetchJobs} />}
      {applyJob && <ApplyModal job={applyJob} onClose={() => { setApplyJobState(null); fetchJobs(); }} />}
    </div>
  );
}
