import React, { useState, useEffect, useCallback } from 'react';
import { getSubsidyMeta, getSubsidies, applySubsidy } from '../utils/api';

// ─── Constants ──────────────────────────────────────────────────────────────
const TYPE_BADGE = { central: 'badge-blue', state: 'badge-green' };
const TYPE_LABEL = { central: '🇮🇳 Central', state: '📍 State' };

const BENEFIT_COLORS = {
    percent_subsidy: { bg: '#e8f5e9', color: '#2d6a2d' },
    free: { bg: '#e3f2fd', color: '#1565c0' },
    grant: { bg: '#fff3e0', color: '#e65100' },
    mixed: { bg: '#f3e5f5', color: '#6a1b9a' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function DetailModal({ sub, onClose, onApply }) {
    if (!sub) return null;
    const bc = BENEFIT_COLORS[sub.benefit_type] || BENEFIT_COLORS.percent_subsidy;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: 'white', borderRadius: 16, maxWidth: 620, width: '100%', maxHeight: '92vh', overflow: 'auto', padding: 28 }}>
                {/* Header */}
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

                {/* Benefit highlight */}
                <div style={{ background: bc.bg, borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                        {sub.subsidy_percent && (
                            <div style={{ fontSize: 36, fontWeight: 900, color: bc.color, lineHeight: 1 }}>{sub.subsidy_percent}%</div>
                        )}
                        {sub.benefit_type === 'free' && <div style={{ fontSize: 28, fontWeight: 900, color: bc.color }}>FREE</div>}
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Subsidy</div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{sub.description}</p>
                        {sub.max_benefit_inr && (
                            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: bc.color }}>
                                Maximum benefit: ₹{sub.max_benefit_inr.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Eligibility */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>ELIGIBILITY</div>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{sub.eligibility.description}</p>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {sub.eligibility.min_land_acres > 0 && <span className="tag">Min land: {sub.eligibility.min_land_acres} acre</span>}
                        <span className="tag">Crops: {sub.eligibility.crops}</span>
                    </div>
                </div>

                {/* How to Apply */}
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

                {/* Documents */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>DOCUMENTS NEEDED</div>
                    <div>{sub.documents.map(d => <span key={d} className="tag" style={{ margin: 3 }}>{d}</span>)}</div>
                </div>

                {/* Deadline & Helpline */}
                <div style={{ marginBottom: 20, padding: 12, background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#6b7280' }}>
                    <div><strong>Deadline:</strong> {sub.deadline}</div>
                    {sub.helpline && <div style={{ marginTop: 4 }}>📞 Helpline: <strong>{sub.helpline}</strong></div>}
                </div>

                {/* Action buttons */}
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
    const [form, setForm] = useState({
        farmer_name: '',
        mobile: '',
        state: sub?.state || '',
        village: '',
        land_acres: '',
        farmer_category: 'small',
        crop: '',
        aadhaar_last4: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    if (!sub) return null;

    function setF(key, val) {
        setForm(f => ({ ...f, [key]: val }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.farmer_name.trim()) return setError('Please enter your name.');
        if (!/^\d{10}$/.test(form.mobile)) return setError('Mobile number must be exactly 10 digits.');
        if (!form.state) return setError('Please select your state.');

        setSubmitting(true);
        try {
            const res = await applySubsidy({ subsidy_id: sub.id, ...form });
            setResult(res);
        } catch (err) {
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: 'white', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '92vh', overflow: 'auto', padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 19, fontWeight: 700 }}>Apply for Subsidy</h2>
                        <p style={{ fontSize: 13, color: '#6b7280' }}>{sub.name}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: '#6b7280', padding: 0 }}>✕</button>
                </div>

                {result ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2d6a2d', marginBottom: 8 }}>Application Submitted!</h3>
                        <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Your Reference Number</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#2d6a2d', letterSpacing: 2 }}>{result.data.reference_number}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Save this number for status tracking</div>
                        </div>
                        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 14, marginBottom: 20, textAlign: 'left' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>NEXT STEP</div>
                            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{result.data.next_step}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <a href={sub.apply_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Go to Official Site ↗</a>
                            <button className="btn-secondary" onClick={onClose}>Close</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-msg">{error}</div>}

                        <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: '#e65100' }}>
                            💡 This registers your interest. You must also visit the official government portal or office to complete the application.
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input value={form.farmer_name} onChange={e => setF('farmer_name', e.target.value)} placeholder="Your name as in Aadhaar" />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number *</label>
                                <input value={form.mobile} onChange={e => setF('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>State *</label>
                                <select value={form.state} onChange={e => setF('state', e.target.value)}>
                                    <option value="">Select State</option>
                                    {['Karnataka', 'Maharashtra', 'Punjab', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu',
                                        'Madhya Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Haryana', 'Bihar'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Village / Taluk</label>
                                <input value={form.village} onChange={e => setF('village', e.target.value)} placeholder="Your village or taluk" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Land Area (acres)</label>
                                <input type="number" step="0.5" min="0.1" value={form.land_acres} onChange={e => setF('land_acres', e.target.value)} placeholder="E.g. 2.5" />
                            </div>
                            <div className="form-group">
                                <label>Farmer Category</label>
                                <select value={form.farmer_category} onChange={e => setF('farmer_category', e.target.value)}>
                                    <option value="marginal">Marginal (less than 1 acre)</option>
                                    <option value="small">Small (1–5 acres)</option>
                                    <option value="large">Large (more than 5 acres)</option>
                                    <option value="sc_st">SC/ST Farmer</option>
                                    <option value="women">Women Farmer</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Main Crop</label>
                                <input value={form.crop} onChange={e => setF('crop', e.target.value)} placeholder="E.g. Paddy, Tomato, Cotton" />
                            </div>
                            <div className="form-group">
                                <label>Aadhaar Last 4 Digits</label>
                                <input value={form.aadhaar_last4} onChange={e => setF('aadhaar_last4', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Last 4 digits only" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Additional Notes</label>
                            <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} placeholder="Any special requirements or questions..." style={{ resize: 'vertical' }} />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="btn-primary" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// ─── Main Subsidy Page ───────────────────────────────────────────────────────
export default function Subsidy() {
    const [subsidies, setSubsidies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [meta, setMeta] = useState({ categories: [], states: [], farmer_categories: [], crop_types: [] });
    const [filters, setFilters] = useState({ state: '', category: '', crop_type: '', farmer_category: '', type: '', search: '' });
    const [selectedSub, setSelectedSub] = useState(null);
    const [applyingSub, setApplyingSub] = useState(null);

    // Load metadata on mount
    useEffect(() => {
        getSubsidyMeta()
            .then(r => setMeta(r.data))
            .catch(console.error);
        fetchSubsidies();
    }, []); // eslint-disable-line

    const fetchSubsidies = useCallback(async (customFilters) => {
        setLoading(true);
        setError('');
        try {
            const params = customFilters || filters;
            const res = await getSubsidies(params);
            setSubsidies(res.data || []);
        } catch (e) {
            setError('Could not load subsidies. Please check your connection and try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
        // eslint-disable-line
    }, [filters]);

    function setF(key, val) {
        setFilters(f => ({ ...f, [key]: val }));
    }

    function handleApplyFilters() {
        fetchSubsidies(filters);
    }

    function handleReset() {
        const empty = { state: '', category: '', crop_type: '', farmer_category: '', type: '', search: '' };
        setFilters(empty);
        fetchSubsidies(empty);
    }

    const centralCount = subsidies.filter(s => s.type === 'central').length;
    const stateCount = subsidies.filter(s => s.type === 'state').length;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
            {/* Page Header */}
            <div className="page-header">
                <h1>💰 Government Subsidies</h1>
                <p>Capital subsidies on irrigation, machinery, solar, storage & more — central and state schemes</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Subsidies', val: subsidies.length || '16+' },
                    { label: 'Central Schemes', val: centralCount || '8' },
                    { label: 'State Schemes', val: stateCount || '8+' },
                    { label: 'States Covered', val: '6+' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 16px' }}>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{s.label}: </span>
                        <span style={{ fontWeight: 700, color: '#2d6a2d' }}>{s.val}</span>
                    </div>
                ))}
            </div>

            {/* Info Banner */}
            <div style={{ background: 'linear-gradient(135deg, #1b5e20, #2d6a2d)', borderRadius: 12, padding: '16px 20px', marginBottom: 22, color: 'white', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>💡</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>What is a Subsidy?</div>
                    <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.7, margin: 0 }}>
                        A subsidy means the government pays a percentage of the cost for you. Example: 55% drip irrigation subsidy means if the system costs ₹1 lakh, you pay only ₹45,000 and government pays ₹55,000.
                        Subsidies are different from schemes — they're capital investments in your farm that save you money for years.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>🔍 Filter Subsidies</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Search</label>
                        <input
                            placeholder="drip, tractor, solar..."
                            value={filters.search}
                            onChange={e => setF('search', e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                        />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Your State</label>
                        <select value={filters.state} onChange={e => setF('state', e.target.value)}>
                            <option value="">All States</option>
                            {meta.states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Category</label>
                        <select value={filters.category} onChange={e => setF('category', e.target.value)}>
                            <option value="">All Categories</option>
                            {meta.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Farmer Category</label>
                        <select value={filters.farmer_category} onChange={e => setF('farmer_category', e.target.value)}>
                            <option value="">All Farmers</option>
                            {meta.farmer_categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Type</label>
                        <select value={filters.type} onChange={e => setF('type', e.target.value)}>
                            <option value="">Central + State</option>
                            <option value="central">Central Only</option>
                            <option value="state">State Only</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="btn-primary" onClick={handleApplyFilters}>Apply Filters</button>
                    <button className="btn-secondary" onClick={handleReset}>Reset</button>
                </div>
            </div>

            {/* Error */}
            {error && <div className="error-msg">{error}</div>}

            {/* Loading */}
            {loading && (
                <div className="loading" style={{ padding: 60 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                    <div>Loading subsidies...</div>
                </div>
            )}

            {/* Empty */}
            {!loading && subsidies.length === 0 && !error && (
                <div className="empty-state">
                    <div className="icon">💰</div>
                    <h3>No subsidies found</h3>
                    <p>Try clearing the filters or searching with different keywords</p>
                    <button className="btn-secondary" style={{ marginTop: 12 }} onClick={handleReset}>Clear Filters</button>
                </div>
            )}

            {/* Central Subsidies */}
            {!loading && subsidies.filter(s => s.type === 'central').length > 0 && (
                <div style={{ marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1565c0', marginBottom: 12, padding: '8px 14px', background: '#e3f2fd', borderRadius: 8 }}>
                        🇮🇳 Central Government Subsidies ({subsidies.filter(s => s.type === 'central').length}) — Available in all states
                    </h3>
                    {subsidies.filter(s => s.type === 'central').map(s => (
                        <SubsidyCard key={s.id} sub={s} onOpen={setSelectedSub} onApply={setApplyingSub} />
                    ))}
                </div>
            )}

            {/* State Subsidies */}
            {!loading && subsidies.filter(s => s.type === 'state').length > 0 && (
                <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d6a2d', marginBottom: 12, padding: '8px 14px', background: '#e8f5e9', borderRadius: 8 }}>
                        📍 State Government Subsidies ({subsidies.filter(s => s.type === 'state').length})
                    </h3>
                    {subsidies.filter(s => s.type === 'state').map(s => (
                        <SubsidyCard key={s.id} sub={s} onOpen={setSelectedSub} onApply={setApplyingSub} />
                    ))}
                </div>
            )}

            {/* Tip Footer */}
            {!loading && subsidies.length > 0 && (
                <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center', padding: '20px', marginTop: 20 }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>📋</div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                        <strong>Pro Tip:</strong> Apply for subsidies early in the financial year (April-June). Most subsidies have limited annual budgets and are allotted on first-come-first-served basis.
                        Always apply through both the official government portal AND your nearest agriculture office.
                    </p>
                </div>
            )}

            {/* Modals */}
            <DetailModal sub={selectedSub} onClose={() => setSelectedSub(null)} onApply={sub => { setSelectedSub(null); setApplyingSub(sub); }} />
            <ApplicationModal sub={applyingSub} onClose={() => setApplyingSub(null)} />
        </div>
    );
}