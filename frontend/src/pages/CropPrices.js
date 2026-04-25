import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Safe JSON fetch — never throws a SyntaxError, returns null on any failure
async function safeJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.warn(`API ${res.status} for ${url}`); return null; }
    const text = await res.text();
    return JSON.parse(text);
  } catch (e) {
    console.error('safeJson error:', e.message, 'url:', url);
    return null;
  }
}

export default function CropPrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [filters, setFilters] = useState({ state: '', commodity: '' });
  const [alertTarget, setAlertTarget] = useState('');
  const [alertSet, setAlertSet] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLive, setIsLive] = useState(false);

  // Dynamic dropdown options — only what has real data
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const LIMIT = 50;

  // On mount: load available states and crops from API
  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [statesRes, cropsRes] = await Promise.all([
          safeJson(`${API_BASE}/prices/states`),
          safeJson(`${API_BASE}/prices/commodities`),
        ]);
        if (statesRes?.data) setAvailableStates(statesRes.data);
        if (cropsRes?.data) setAvailableCrops(cropsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
    fetchPrices(0, { state: '', commodity: '' });
  }, []);

  // When state changes, reload crops available for that state
  async function handleStateChange(newState) {
    const newFilters = { state: newState, commodity: '' };
    setFilters(newFilters);

    if (newState) {
      try {
        const data = await safeJson(`${API_BASE}/prices?state=${encodeURIComponent(newState)}&limit=500`);
        if (data?.data?.length > 0) {
          const uniqueCrops = [...new Set(data.data.map(p => p.commodity))].sort();
          setAvailableCrops(uniqueCrops);
        }
      } catch (e) { console.error(e); }
    } else {
      const d = await safeJson(`${API_BASE}/prices/commodities`);
      if (d?.data) setAvailableCrops(d.data);
    }
    fetchPrices(0, newFilters);
  }

  async function fetchPrices(newOffset = 0, customFilters) {
    setLoading(true);
    setOffset(newOffset);
    const f = customFilters || filters;
    try {
      const params = new URLSearchParams();
      if (f.state)     params.set('state', f.state);
      if (f.commodity) params.set('commodity', f.commodity);
      params.set('limit', LIMIT);
      params.set('offset', newOffset);

      const data = await safeJson(`${API_BASE}/prices?${params}`);
      setPrices(data?.data || []);
      setTotal(data?.total || 0);
      setIsLive(data?.live || false);
      if (data?.data?.length > 0) setSelectedPrice(data.data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleSetAlert() {
    if (!alertTarget) return;
    setAlertSet(true);
    setTimeout(() => setAlertSet(false), 4000);
  }

  const quickCrops = availableCrops.slice(0, 10);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>📈 Live Crop Prices</h1>
          <p>Official AgMarknet data — all states, all mandis, updated daily</p>
        </div>
        <span style={{ background: isLive ? '#e8f5e9' : '#fff3e0', color: isLive ? '#2d6a2d' : '#e65100', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: `1px solid ${isLive ? '#a5d6a7' : '#ffcc80'}`, alignSelf: 'center' }}>
          {isLive ? '🟢 Live — AgMarknet' : '🟡 Sample data'}
        </span>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Records found', val: total.toLocaleString() },
            { label: 'Showing', val: `${offset + 1}–${Math.min(offset + LIMIT, total)}` },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px' }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{s.label}: </span>
              <span style={{ fontWeight: 600, color: '#374151' }}>{s.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select
          value={filters.state}
          onChange={e => handleStateChange(e.target.value)}
          style={{ minWidth: 190 }}
          disabled={loadingOptions}
        >
          <option value="">All States ({availableStates.length} available)</option>
          {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.commodity}
          onChange={e => {
            const newFilters = { ...filters, commodity: e.target.value };
            setFilters(newFilters);
            fetchPrices(0, newFilters);
          }}
          style={{ minWidth: 180 }}
          disabled={loadingOptions}
        >
          <option value="">All Crops ({availableCrops.length} available)</option>
          {availableCrops.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button className="btn-primary" onClick={() => fetchPrices(0)}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Quick crop chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {quickCrops.map(crop => (
          <button key={crop}
            onClick={() => {
              const newFilters = { ...filters, commodity: crop };
              setFilters(newFilters);
              fetchPrices(0, newFilters);
            }}
            style={{
              background: filters.commodity === crop ? '#2d6a2d' : 'white',
              color: filters.commodity === crop ? 'white' : '#374151',
              border: '1.5px solid',
              borderColor: filters.commodity === crop ? '#2d6a2d' : '#e5e7eb',
              padding: '5px 12px',
              fontSize: 13,
              borderRadius: 8,
            }}>
            {crop}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌾</div>
          <p style={{ color: '#6b7280' }}>Fetching prices from AgMarknet...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && prices.length === 0 && (
        <div className="empty-state">
          <div className="icon">📊</div>
          <h3>No prices found</h3>
          <p>Try selecting a different state or crop from the dropdowns above.</p>
        </div>
      )}

      {/* Results */}
      {!loading && prices.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedPrice ? '1fr 380px' : '1fr', gap: 20 }}>

          {/* Price list */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {prices.map((p, i) => {
                const isSelected = selectedPrice === p;
                const up = parseFloat(p.change_pct) >= 0;
                return (
                  <div key={i} className="card" onClick={() => setSelectedPrice(p)}
                    style={{ cursor: 'pointer', border: isSelected ? '2px solid #2d6a2d' : '1px solid #e5e7eb', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                          {p.commodity}
                          <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}> — {p.variety}</span>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                          📍 {p.market}, {p.district}, {p.state}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                          Date: {p.arrival_date}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#2d6a2d' }}>₹{p.modal_price.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>/quintal (modal)</div>
                        <div style={{ fontSize: 13, color: up ? '#2e7d32' : '#c62828', fontWeight: 500, marginTop: 2 }}>
                          {up ? '▲' : '▼'} {Math.abs(p.change_pct)}%
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                      <span>Min: ₹{p.min_price.toLocaleString()}</span>
                      <span>Max: ₹{p.max_price.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, alignItems: 'center' }}>
                <button className="btn-secondary btn-sm" disabled={offset === 0} onClick={() => fetchPrices(Math.max(0, offset - LIMIT))}>← Previous</button>
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  Page {Math.floor(offset / LIMIT) + 1} of {Math.ceil(total / LIMIT)}
                </span>
                <button className="btn-secondary btn-sm" disabled={offset + LIMIT >= total} onClick={() => fetchPrices(offset + LIMIT)}>Next →</button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedPrice && (
            <div>
              <div className="card" style={{ position: 'sticky', top: 76 }}>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{selectedPrice.commodity}</h3>
                <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>📍 {selectedPrice.market} Mandi, {selectedPrice.state}</p>

                {/* Min / Modal / Max */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {[
                    { label: 'Min Price', val: `₹${selectedPrice.min_price.toLocaleString()}` },
                    { label: 'Modal Price', val: `₹${selectedPrice.modal_price.toLocaleString()}` },
                    { label: 'Max Price', val: `₹${selectedPrice.max_price.toLocaleString()}` },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#2d6a2d' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* 30-day trend chart */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>30-Day Price Trend</div>
                  {selectedPrice.price_history && selectedPrice.price_history.length > 0 ? (
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={selectedPrice.price_history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 9 }}
                          tickFormatter={d => d.slice(5)}
                          interval={Math.floor(selectedPrice.price_history.length / 5)}
                        />
                        <YAxis
                          tick={{ fontSize: 9 }}
                          tickFormatter={v => `₹${Math.round(v / 100) * 100}`}
                          width={60}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          formatter={v => [`₹${Number(v).toLocaleString()}`, 'Modal Price']}
                          labelFormatter={l => `Date: ${l}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="modal_price"
                          stroke="#2d6a2d"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                      No trend data yet — check back tomorrow
                    </div>
                  )}
                </div>

                {/* Price alert */}
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🔔 Set Price Alert</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Alert me at ₹..."
                      value={alertTarget}
                      onChange={e => setAlertTarget(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button className="btn-primary btn-sm" onClick={handleSetAlert}>Set</button>
                  </div>
                  {alertSet && <div style={{ fontSize: 12, color: '#2d6a2d', marginTop: 6 }}>✅ Alert set for ₹{alertTarget}/quintal!</div>}
                </div>

                {/* Find best mandi */}
                <button className="btn-secondary btn-full btn-sm" onClick={async () => {
                  const res = await fetch(`${API_BASE}/prices/top?commodity=${encodeURIComponent(selectedPrice.commodity)}`);
                  const d = await res.json();
                  if (d.data?.length > 0) {
                    alert(`Best mandi for ${selectedPrice.commodity}:\n\n${d.data.slice(0, 5).map((m, i) => `${i + 1}. ${m.market}, ${m.state} — ₹${m.modal_price.toLocaleString()}/qtl`).join('\n')}`);
                  }
                }}>
                  🏆 Find Best Paying Mandi
                </button>

                <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
                  Source: AgMarknet — {selectedPrice.arrival_date}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}