import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = (url, opts) => axios({ url: `${API_BASE}${url}`, ...opts }).then(r => r.data);

const RISK_COLOR = { low: '#2d6a2d', medium: '#e65100', high: '#c62828' };
const RISK_BG   = { low: '#e8f5e9', medium: '#fff3e0', high: '#ffebee' };
const WATER_ICON = { low: '💧', medium: '💧💧', high: '💧💧💧' };

const SOIL_COLOR = {
  Black:    { bg: '#1c1c1c', text: '#fff', label: '⬛ Black' },
  Alluvial: { bg: '#c8a96e', text: '#fff', label: '🟤 Alluvial' },
  Red:      { bg: '#b94040', text: '#fff', label: '🔴 Red' },
  Laterite: { bg: '#a05c2c', text: '#fff', label: '🟫 Laterite' },
  Desert:   { bg: '#e8d5a3', text: '#555', label: '🏜️ Desert' },
};

const PH_STATUS = (ph) => {
  if (ph < 5.5) return { label: 'Very Acidic', color: '#c62828', bg: '#ffebee' };
  if (ph < 6.0) return { label: 'Acidic', color: '#e65100', bg: '#fff3e0' };
  if (ph <= 7.5) return { label: 'Optimal', color: '#2d6a2d', bg: '#e8f5e9' };
  if (ph <= 8.0) return { label: 'Slightly Alkaline', color: '#e65100', bg: '#fff3e0' };
  return { label: 'Alkaline', color: '#c62828', bg: '#ffebee' };
};

const SCORE_COLOR = (s) => {
  if (s >= 80) return { color: '#2d6a2d', bg: '#e8f5e9', label: 'Excellent' };
  if (s >= 60) return { color: '#1565c0', bg: '#e3f2fd', label: 'Good' };
  if (s >= 40) return { color: '#e65100', bg: '#fff3e0', label: 'Moderate' };
  return { color: '#c62828', bg: '#ffebee', label: 'Low' };
};

// Reverse-geocode lat/lng using free Nominatim API
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    return {
      state: addr.state || '',
      district: addr.county || addr.state_district || addr.city_district || addr.district || '',
      city: addr.city || addr.town || addr.village || '',
      display: data.display_name || '',
    };
  } catch {
    return null;
  }
}

export default function CropAdvisor() {
  const [states, setStates]         = useState([]);
  const [districts, setDistricts]   = useState([]);
  const [form, setForm] = useState({
    state: 'Karnataka', district: 'Raichur', land_acres: 2,
    soil_type: 'Black cotton', water_availability: 'medium', season: ''
  });

  const [locationMode, setLocationMode] = useState('manual'); // 'manual' | 'gps'
  const [gpsStatus, setGpsStatus]       = useState('idle');   // 'idle'|'locating'|'found'|'error'
  const [gpsInfo, setGpsInfo]           = useState(null);     // { lat, lng, state, district, display }
  const [gpsCoords, setGpsCoords]       = useState(null);

  const [results, setResults]     = useState(null);
  const [soilData, setSoilData]   = useState(null);
  const [climateInfo, setClimate] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null);

  useEffect(() => { api('/advisor/states').then(r => setStates(r.data)); }, []);

  useEffect(() => {
    const s = locationMode === 'gps' && gpsInfo ? gpsInfo.state : form.state;
    if (s) {
      api(`/advisor/districts/${s}`)
        .then(r => setDistricts(r.data))
        .catch(() => setDistricts([]));
    }
  }, [form.state, locationMode, gpsInfo]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('locating');
    setGpsInfo(null);
    setGpsCoords(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGpsCoords({ lat, lng });
        const geo = await reverseGeocode(lat, lng);
        if (geo) {
          setGpsInfo({ lat, lng, ...geo });
          setGpsStatus('found');
        } else {
          setGpsStatus('error');
        }
      },
      () => setGpsStatus('error'),
      { timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  async function getRecommendations() {
    setLoading(true); setResults(null); setSoilData(null); setClimate(null);
    try {
      const useGps = locationMode === 'gps' && gpsInfo;
      const payload = {
        ...form,
        state:    useGps ? gpsInfo.state    : form.state,
        district: useGps ? gpsInfo.district : form.district,
        lat:      useGps ? gpsInfo.lat      : undefined,
        lng:      useGps ? gpsInfo.lng      : undefined,
      };
      const r = await api('/advisor/recommend', { method: 'POST', data: payload });
      setResults(r.data);
      if (r.soil_data)    setSoilData(r.soil_data);
      if (r.climate_used) setClimate(r.climate_used);
      if (r.data?.length > 0) setSelected(r.data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const activeState    = locationMode === 'gps' && gpsInfo ? gpsInfo.state    : form.state;
  const activeDistrict = locationMode === 'gps' && gpsInfo ? gpsInfo.district : form.district;
  const soilMeta  = soilData ? SOIL_COLOR[soilData.soil_type] || {} : {};
  const phStatus  = soilData ? PH_STATUS(soilData.soil_ph) : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div className="page-header">
        <h1>🤖 AI Crop Advisor</h1>
        <p>Share your location and farm details — get data-driven crop recommendations matched to your climate, soil, and resources</p>
      </div>

      {/* ── Location Mode Toggle ──────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>📍 How should we detect your location?</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setLocationMode('manual')}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
              border: locationMode === 'manual' ? '2px solid #2d6a2d' : '1.5px solid #e5e7eb',
              background: locationMode === 'manual' ? '#e8f5e9' : '#f9fafb',
              color: locationMode === 'manual' ? '#2d6a2d' : '#374151',
            }}
          >
            🗺️ Select Manually<br />
            <span style={{ fontWeight: 400, fontSize: 12 }}>Choose state &amp; district</span>
          </button>
          <button
            onClick={() => { setLocationMode('gps'); if (gpsStatus === 'idle') detectLocation(); }}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
              border: locationMode === 'gps' ? '2px solid #1565c0' : '1.5px solid #e5e7eb',
              background: locationMode === 'gps' ? '#e3f2fd' : '#f9fafb',
              color: locationMode === 'gps' ? '#1565c0' : '#374151',
            }}
          >
            📡 Auto-Detect via GPS<br />
            <span style={{ fontWeight: 400, fontSize: 12 }}>Use my device location</span>
          </button>
        </div>

        {/* GPS status feedback */}
        {locationMode === 'gps' && (
          <div style={{ marginTop: 14 }}>
            {gpsStatus === 'locating' && (
              <div style={{ background: '#e3f2fd', borderRadius: 8, padding: '10px 14px', color: '#1565c0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                Detecting your location via GPS...
              </div>
            )}
            {gpsStatus === 'found' && gpsInfo && (
              <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '12px 14px', border: '1px solid #c8e6c9' }}>
                <div style={{ fontWeight: 700, color: '#2d6a2d', marginBottom: 4, fontSize: 14 }}>
                  ✅ Location Detected
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>
                  <strong>State:</strong> {gpsInfo.state} &nbsp;|&nbsp; <strong>District:</strong> {gpsInfo.district}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                  📌 {gpsInfo.lat?.toFixed(4)}°N, {gpsInfo.lng?.toFixed(4)}°E &nbsp;·&nbsp; {gpsInfo.city && `Near ${gpsInfo.city}`}
                </div>
                <button onClick={detectLocation} style={{ marginTop: 8, background: 'none', border: '1px solid #2d6a2d', color: '#2d6a2d', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                  🔄 Re-detect
                </button>
              </div>
            )}
            {gpsStatus === 'error' && (
              <div style={{ background: '#ffebee', borderRadius: 8, padding: '10px 14px', border: '1px solid #ffcdd2' }}>
                <div style={{ fontWeight: 700, color: '#c62828', marginBottom: 4, fontSize: 14 }}>❌ GPS Detection Failed</div>
                <div style={{ fontSize: 13, color: '#374151' }}>Location permission denied or unavailable.</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={detectLocation} style={{ background: '#c62828', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Try Again
                  </button>
                  <button onClick={() => setLocationMode('manual')} style={{ background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Use Manual
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual dropdowns — always shown for district override, shown prominently when manual */}
        {locationMode === 'manual' && (
          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label>Your State</label>
              <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value, district: '' }))}>
                <option value="">Select state</option>
                {states.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Your District</label>
              <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                <option value="">Select district</option>
                {districts.map(d => <option key={d}>{d}</option>)}
                <option value="Other">Other district</option>
              </select>
            </div>
          </div>
        )}

        {/* GPS mode: allow district override */}
        {locationMode === 'gps' && gpsStatus === 'found' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
              ✏️ Wrong district? Override below:
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>District (optional override)</label>
                <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))}>
                  <option value="">Use auto-detected ({gpsInfo?.district})</option>
                  {districts.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Farm Details ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🌾 Tell us about your farm</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Land (acres)</label>
            <input type="number" min="0.5" max="100" step="0.5" value={form.land_acres}
              onChange={e => setForm(f => ({ ...f, land_acres: parseFloat(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>Soil Type</label>
            <select value={form.soil_type} onChange={e => setForm(f => ({ ...f, soil_type: e.target.value }))}>
              {['Black cotton', 'Red loamy', 'Sandy loam', 'Alluvial', 'Clay', 'Mixed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Water Availability</label>
            <select value={form.water_availability} onChange={e => setForm(f => ({ ...f, water_availability: e.target.value }))}>
              <option value="high">High (canal / borewell)</option>
              <option value="medium">Medium (seasonal / limited)</option>
              <option value="low">Low (rainfed only)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Season (optional)</label>
            <select value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))}>
              <option value="">Any season</option>
              <option value="Kharif">Kharif (June–Oct)</option>
              <option value="Rabi">Rabi (Oct–Mar)</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}
          onClick={getRecommendations}
          disabled={loading || (locationMode === 'gps' && gpsStatus === 'locating')}>
          {loading ? '🔍 Analyzing your location & soil...' : '🤖 Get Recommendations'}
        </button>
      </div>

      {/* ── Climate Info Card ─────────────────────────────────────────── */}
      {climateInfo && (
        <div style={{ marginBottom: 16, background: '#fffde7', borderRadius: 10, border: '1px solid #fff176', padding: '12px 18px', fontSize: 13 }}>
          <strong>🌤 Climate Profile Used:</strong>&nbsp;
          Temp {climateInfo.temp}°C · Humidity {climateInfo.humidity}% · Annual Rainfall ~{climateInfo.rainfall}mm
          &nbsp;<span style={{ color: '#9e9e9e', fontSize: 11 }}>({climateInfo.source})</span>
        </div>
      )}

      {/* ── Soil Data Card ────────────────────────────────────────────── */}
      {soilData && (
        <div style={{ marginBottom: 24, borderRadius: 12, border: '1.5px solid #d1fae5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ background: 'linear-gradient(90deg, #14532d 0%, #166534 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🌍</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Real Soil Data · {soilData.region_matched}</div>
              <div style={{ color: '#bbf7d0', fontSize: 12 }}>Sourced from India Soil Dataset · Matched to your region</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', background: '#f0fdf4', padding: '16px 20px', gap: 12 }}>
            {[
              { label: 'Soil Type', content: <span style={{ display:'inline-block', background: soilMeta.bg||'#e5e7eb', color: soilMeta.text||'#111', borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: 13 }}>{soilMeta.label || soilData.soil_type}</span> },
              { label: 'Soil pH', content: <span style={{ display:'inline-block', background: phStatus.bg, color: phStatus.color, borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: 13 }}>{soilData.soil_ph} · {phStatus.label}</span> },
              { label: 'Moisture Level', content: <span style={{ display:'inline-block', background: soilData.moisture_level==='High'?'#e0f2fe':soilData.moisture_level==='Low'?'#fef9c3':'#f0f9ff', color: soilData.moisture_level==='High'?'#0369a1':soilData.moisture_level==='Low'?'#854d0e':'#0c4a6e', borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: 13 }}>{soilData.moisture_level==='High'?'💧💧💧':soilData.moisture_level==='Moderate'?'💧💧':'💧'} {soilData.moisture_level}</span> },
              { label: 'Organic Carbon', content: <span style={{ display:'inline-block', background: soilData.organic_carbon==='High'?'#e8f5e9':soilData.organic_carbon==='Low'?'#ffebee':'#fffde7', color: soilData.organic_carbon==='High'?'#2d6a2d':soilData.organic_carbon==='Low'?'#c62828':'#f57f17', borderRadius: 20, padding: '4px 14px', fontWeight: 700, fontSize: 13 }}>{soilData.organic_carbon}</span> },
            ].map(({ label, content }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                {content}
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderTop: '1px solid #d1fae5', padding: '12px 20px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, marginTop: 1 }}>🌱</span>
            <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              <strong>Soil Health Tip: </strong>{soilData.health_tip}
            </p>
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────── */}
      {results && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Recommendations for your {form.land_acres} acre farm
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
            Ranked by climate suitability + profit potential · {activeState} · {activeDistrict || 'All districts'}
            {soilData && <span style={{ marginLeft: 8, color: '#2d6a2d', fontWeight: 600 }}>· Soil-matched ✓</span>}
            {locationMode === 'gps' && gpsStatus === 'found' && <span style={{ marginLeft: 8, color: '#1565c0', fontWeight: 600 }}>· GPS-located 📡</span>}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((crop, i) => {
                const sc = SCORE_COLOR(crop.location_score || 0);
                return (
                  <div key={crop.crop} className="card" onClick={() => setSelected(crop)}
                    style={{ cursor: 'pointer', border: selected?.crop === crop.crop ? '2px solid #2d6a2d' : '1px solid #e5e7eb', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          {i === 0 && <span className="badge badge-green">🏆 Best Match</span>}
                          <span style={{ background: RISK_BG[crop.risk], color: RISK_COLOR[crop.risk] }} className="badge">Risk: {crop.risk}</span>
                          <span className="tag">{crop.season}</span>
                          <span className="tag">{WATER_ICON[crop.water_need]} water</span>
                          {/* Location score badge */}
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                            🎯 {crop.location_score}% match
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 17 }}>{crop.crop}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{crop.duration_days} days</div>
                        {crop.location_match_note && (
                          <div style={{ fontSize: 11, color: '#1565c0', marginTop: 4, fontStyle: 'italic' }}>
                            📍 {crop.location_match_note}
                          </div>
                        )}
                        {crop.climate_used && (
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                            Climate: {crop.climate_used.source}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#2d6a2d' }}>₹{crop.expected_profit.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>expected profit</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Invest: ₹{crop.total_investment.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="card" style={{ position: 'sticky', top: 76, alignSelf: 'flex-start' }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{selected.crop}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{selected.season} · {selected.duration_days} days</p>

                {/* Location match bar */}
                {selected.location_score != null && (() => {
                  const sc = SCORE_COLOR(selected.location_score);
                  return (
                    <div style={{ background: sc.bg, borderRadius: 8, padding: '8px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: sc.color, marginBottom: 4 }}>
                        🎯 Location Match: {selected.location_score}% ({sc.label})
                      </div>
                      <div style={{ background: '#e5e7eb', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${selected.location_score}%`, background: sc.color, height: '100%', borderRadius: 4, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Investment', val: `₹${selected.total_investment.toLocaleString()}` },
                    { label: 'Expected Revenue', val: `₹${selected.total_revenue.toLocaleString()}` },
                    { label: 'Expected Profit', val: `₹${selected.expected_profit.toLocaleString()}` },
                    { label: 'Yield', val: `${selected.expected_yield_quintal * form.land_acres} qtl` },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#f9fafb', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#2d6a2d' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#2d6a2d', marginBottom: 6 }}>💡 EXPERT TIP</div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{selected.tips}</p>
                </div>

                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
                  <div>Water: {WATER_ICON[selected.water_need]} {selected.water_need}</div>
                  <div>Risk: <span style={{ color: RISK_COLOR[selected.risk], fontWeight: 600 }}>{selected.risk}</span></div>
                  <div>Market: ₹{selected.market_price_per_quintal}/qtl</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
