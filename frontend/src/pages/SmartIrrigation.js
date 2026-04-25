import React, { useState, useEffect, useCallback } from 'react';
import { predictIrrigation, predictAllIrrigation, getIrrigationOptions } from '../utils/api';

// ─── Translation helper ───────────────────────────────────────────────────────
const T = {
  title: 'Smart Irrigation Advisor',
  subtitle: 'Live weather-based irrigation recommendations for all your crops.',
  loadingOpts: 'Loading options...',
  fetchingData: 'Fetching data...',
  farmDetails: '🌾 Farm Details',
  selectCrop: 'Select Crop',
  selectSoil: 'Select Soil Type',
  temperature: 'Temperature (°C)',
  humidity: 'Humidity (%)',
  rainPrediction: 'Rain Expected Today?',
  noRain: '☀️ No Rain',
  rainYes: '🌧️ Rain Expected',
  calculate: 'Calculating...',
  getAll: '📊 Get Irrigation Plan for All Crops',
  getSingle: '💧 Get Recommendation',
  irrigationTime: 'Irrigation Duration',
  waterVolume:    'Total Water Volume',
  farmArea:       'Farm Area (Acres)',
  refresh: 'Refresh Weather',
  detecting: '📡 Detecting your location & live weather...',
  weather: 'Live Weather',
  allCrops: 'All Crops Water Plan',
  singleResult: 'Recommendation',
};

// ─── WMO lookup (client-side, mirrors backend) ───────────────────────────────
const WMO_ICONS = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 73: '🌨️', 75: '❄️', 80: '🌦️', 81: '🌧️', 82: '⛈️', 95: '⛈️', 96: '⛈️', 99: '⛈️' };
const WMO_DESC = { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snowfall', 73: 'Moderate snowfall', 75: 'Heavy snowfall', 80: 'Rain showers', 81: 'Moderate showers', 82: 'Violent showers', 95: 'Thunderstorm', 96: 'Thunderstorm + hail', 99: 'Thunderstorm + heavy hail' };
const RAINY_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

// ─── Urgency colour helper ────────────────────────────────────────────────────
const urgencyStyle = (u) => ({
  high: { bg: '#fef2f2', border: '#fca5a5', badge: '#dc2626', text: 'High Need' },
  medium: { bg: '#fffbeb', border: '#fcd34d', badge: '#d97706', text: 'Medium Need' },
  low: { bg: '#f0fdf4', border: '#86efac', badge: '#16a34a', text: 'Low Need' },
}[u] || { bg: '#f9fafb', border: '#e5e7eb', badge: '#6b7280', text: '' });

export default function Irrigation() {
  const [crops, setCrops] = useState([]);
  const [soils, setSoils] = useState([]);
  const [optLoading, setOptLoad] = useState(true);

  const [form, setForm] = useState({
    cropType: '',
    soilType: '',
    temperature: '',
    humidity: '',
    rainPrediction: 'no',
    area: '1',
  });

  // Weather
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle');

  // Results
  const [singleResult, setSingleResult] = useState(null);
  const [allResult, setAllResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'all'

  // ── Load crops & soils from backend ─────────────────────────────────────────
  useEffect(() => {
    setOptLoad(true);
    getIrrigationOptions()
      .then(data => {
        setCrops(data.crops || []);
        setSoils(data.soils || []);
        if (data.crops?.length) setForm(f => ({ ...f, cropType: data.crops[0].value }));
        if (data.soils?.length) setForm(f => ({ ...f, soilType: data.soils[0].value }));
      })
      .catch(() => setError('Failed to load options. Is the backend running?'))
      .finally(() => setOptLoad(false));
  }, []);

  // ── Detect location & fetch live weather from Open-Meteo ────────────────────
  const detectWeather = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setWeatherError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('detecting');
    setWeatherLoading(true);
    setWeatherError('');
    setWeather(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocationStatus('found');
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&hourly=precipitation_probability,temperature_2m,weather_code&forecast_days=1&timezone=auto`;
          const res = await fetch(url);
          const data = await res.json();

          const current = data.current || {};
          const hourly = data.hourly || {};
          const code = current.weather_code ?? 0;
          const precipProbs = (hourly.precipitation_probability || []).slice(0, 6);
          const maxRainProb = precipProbs.length ? Math.max(...precipProbs) : 0;
          const isRaining = RAINY_CODES.includes(code);

          const w = {
            temperature: current.temperature_2m,
            feelsLike: current.apparent_temperature,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            pressure: current.surface_pressure,
            weatherCode: code,
            description: WMO_DESC[code] || 'Unknown',
            icon: WMO_ICONS[code] || '🌡️',
            rainProbability: maxRainProb,
            rainPrediction: (maxRainProb >= 50 || isRaining) ? 'yes' : 'no',
            isCurrentlyRaining: isRaining,
          };
          setWeather(w);
          // Auto-fill form with live data
          setForm(f => ({
            ...f,
            temperature: w.temperature != null ? String(Math.round(w.temperature * 10) / 10) : f.temperature,
            humidity: w.humidity != null ? String(Math.round(w.humidity)) : f.humidity,
            rainPrediction: w.rainPrediction || f.rainPrediction,
          }));
        } catch {
          setWeatherError('Could not fetch weather. Enter details manually.');
        } finally {
          setWeatherLoading(false);
        }
      },
      (geoErr) => {
        setLocationStatus('error');
        setWeatherLoading(false);
        setWeatherError(
          geoErr.code === 1
            ? 'Location permission denied. Enter details manually.'
            : 'Could not detect location. Enter details manually.'
        );
      },
      { timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => { detectWeather(); }, [detectWeather]);

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate(requireCrop = true) {
    if (requireCrop && !form.cropType) return 'Please select a crop type.';
    if (!form.soilType) return 'Please select a soil type.';
    if (form.temperature === '') return 'Temperature is required.';
    const temp = Number(form.temperature);
    if (isNaN(temp)) return 'Temperature must be a valid number.';
    if (temp < -10 || temp > 60) return 'Temperature must be between -10°C and 60°C.';
    if (form.humidity !== '') {
      const hum = Number(form.humidity);
      if (isNaN(hum) || hum < 0 || hum > 100) return 'Humidity must be 0–100%.';
    }
    return null;
  }

  // ── Submit single crop ────────────────────────────────────────────────────────
  async function handleSubmitSingle(e) {
    e.preventDefault();
    setError(''); setSingleResult(null);
    const err = validate(true);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const data = await predictIrrigation({
        cropType: form.cropType,
        soilType: form.soilType,
        temperature: Number(form.temperature),
        humidity: form.humidity !== '' ? Number(form.humidity) : 50,
        rainPrediction: form.rainPrediction,
        area: Number(form.area) || 1,
      });
      setSingleResult(data);
      setActiveTab('single');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Submit all crops ──────────────────────────────────────────────────────────
  async function handleSubmitAll(e) {
    e.preventDefault();
    setError(''); setAllResult(null);
    const err = validate(false); // false = crop not required for "all crops" mode
    if (err) { setError(err); return; }
    setAllLoading(true);
    try {
      const data = await predictAllIrrigation({
        soilType: form.soilType,
        temperature: Number(form.temperature),
        humidity: form.humidity !== '' ? Number(form.humidity) : 50,
        rainPrediction: form.rainPrediction,
        area: Number(form.area) || 1,
      });
      if (!data.success) throw new Error(data.error || 'Failed to get plan');
      setAllResult(data);
      setActiveTab('all');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setAllLoading(false);
    }
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setSingleResult(null); setAllResult(null); setError('');
  };

  // ── Styles ────────────────────────────────────────────────────────────────────
  const s = {
    page: { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' },
    card: { background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,.08)', padding: '20px 24px', marginBottom: 20 },
    label: { display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 5 },
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', background: '#fff' },
    row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 },
    btnPrimary: { background: 'linear-gradient(135deg,#2d6a2d,#1b5e20)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%' },
    btnSecondary: { background: 'linear-gradient(135deg,#1565c0,#0d47a1)', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%' },
    tabActive: { background: '#2d6a2d', color: '#fff', border: 'none', borderRadius: '8px 8px 0 0', padding: '10px 24px', fontWeight: 700, cursor: 'pointer' },
    tabInactive: { background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px 8px 0 0', padding: '10px 24px', fontWeight: 600, cursor: 'pointer' },
  };

  if (optLoading) {
    return (
      <div style={s.page}>
        <h1>💧 {T.title}</h1>
        <p>⏳ {T.loadingOpts}</p>
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1b5e20', margin: 0 }}>💧 {T.title}</h1>
        <p style={{ color: '#6b7280', marginTop: 6 }}>{T.subtitle}</p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { num: crops.length, lbl: 'Crops' },
          { num: soils.length, lbl: 'Soil Types' },
          { num: weather ? `${Math.round(weather.temperature)}°C` : '--', lbl: 'Live Temp' },
          { num: weather ? `${Math.round(weather.humidity)}%` : '--', lbl: 'Humidity' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '16px 12px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#2d6a2d' }}>{stat.num}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{stat.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── Weather card ── */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>🌤️ {T.weather}</h3>
          {locationStatus !== 'detecting' && (
            <button onClick={detectWeather} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: '#2d6a2d' }}>
              🔄 {T.refresh}
            </button>
          )}
        </div>

        {locationStatus === 'detecting' && (
          <div style={{ background: '#e3f2fd', borderRadius: 10, padding: '14px 18px', color: '#1565c0', fontWeight: 600, fontSize: 14 }}>
            {T.detecting}
          </div>
        )}

        {weatherError && locationStatus !== 'detecting' && (
          <div style={{ background: '#fff3e0', borderRadius: 10, padding: '12px 16px', color: '#e65100', fontSize: 13 }}>
            ⚠️ {weatherError}
          </div>
        )}

        {weather && locationStatus === 'found' && (
          <div style={{ background: 'linear-gradient(135deg,#1565c0,#01579b)', borderRadius: 12, padding: '20px 24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 90, opacity: 0.12 }}>{weather.icon}</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', position: 'relative' }}>
              <div>
                <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1 }}>{Math.round(weather.temperature)}°</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Feels like {Math.round(weather.feelsLike)}°C</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, marginBottom: 4 }}>{weather.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{weather.description}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span>💧 Humidity: {Math.round(weather.humidity)}%</span>
                  <span>💨 Wind: {weather.windSpeed} km/h</span>
                  <span>🌧️ Rain chance: {weather.rainProbability}%</span>
                </div>
                {weather.isCurrentlyRaining && (
                  <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 10px', display: 'inline-block', fontSize: 13, fontWeight: 600 }}>
                    🌧️ Currently raining — irrigation auto-set to "Rain Expected"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Form ── */}
      <div style={s.card}>
        <h3 style={{ fontWeight: 700, marginTop: 0, marginBottom: 18, fontSize: 15 }}>{T.farmDetails}</h3>
        <form onSubmit={e => e.preventDefault()}>
          <div style={s.row}>
            <div>
              <label style={s.label}>Crop Type</label>
              <select style={s.select} value={form.cropType} onChange={set('cropType')}>
                <option value="">{T.selectCrop}</option>
                {crops.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Soil Type</label>
              <select style={s.select} value={form.soilType} onChange={set('soilType')}>
                <option value="">{T.selectSoil}</option>
                {soils.map(soil => <option key={soil.value} value={soil.value}>{soil.label}</option>)}
              </select>
            </div>
          </div>

          <div style={s.row}>
            <div>
              <label style={s.label}>{T.temperature}</label>
              <input style={s.input} type="number" step="0.1" value={form.temperature} onChange={set('temperature')} placeholder="Auto-detected or enter manually" />
            </div>
            <div>
              <label style={s.label}>{T.humidity}</label>
              <input style={s.input} type="number" step="1" min="0" max="100" value={form.humidity} onChange={set('humidity')} placeholder="Auto-detected or enter manually" />
            </div>
          </div>

          <div style={s.row}>
            <div>
              <label style={s.label}>{T.farmArea}</label>
              <input style={s.input} type="number" step="0.1" min="0.1" value={form.area} onChange={set('area')} placeholder="Enter farm size in acres" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <label style={s.label}>{T.rainPrediction}</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['no', 'yes'].map(v => (
                  <button key={v} type="button"
                    onClick={() => setForm(f => ({ ...f, rainPrediction: v }))}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                      border: form.rainPrediction === v ? (v === 'no' ? '2px solid #e65100' : '2px solid #1565c0') : '1.5px solid #e5e7eb',
                      background: form.rainPrediction === v ? (v === 'no' ? '#fff3e0' : '#e3f2fd') : '#f9fafb',
                      color: form.rainPrediction === v ? (v === 'no' ? '#e65100' : '#1565c0') : '#374151',
                    }}>
                    {v === 'no' ? T.noRain : T.rainYes}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button type="button" style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
              disabled={loading} onClick={handleSubmitSingle}>
              {loading ? T.calculate : T.getSingle}
            </button>
            <button type="button" style={{ ...s.btnSecondary, opacity: allLoading ? 0.7 : 1 }}
              disabled={allLoading} onClick={handleSubmitAll}>
              {allLoading ? T.calculate : T.getAll}
            </button>
          </div>
        </form>
      </div>

      {/* ── Results ── */}
      {(singleResult || allResult) && (
        <div style={s.card}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {singleResult && (
              <button style={activeTab === 'single' ? s.tabActive : s.tabInactive} onClick={() => setActiveTab('single')}>
                💧 Single Crop
              </button>
            )}
            {allResult && (
              <button style={activeTab === 'all' ? s.tabActive : s.tabInactive} onClick={() => setActiveTab('all')}>
                📊 All Crops ({allResult.crops?.length})
              </button>
            )}
          </div>

          {/* Single result */}
          {activeTab === 'single' && singleResult && (
            singleResult.irrigationNeeded === false ? (
              <div style={{ background: '#e3f2fd', border: '1.5px solid #90caf9', borderRadius: 12, padding: '20px 24px' }}>
                <h3 style={{ color: '#1565c0', margin: '0 0 8px' }}>{T.noIrrigation}</h3>
                <p style={{ color: '#1e40af', margin: 0 }}>{singleResult.details?.reason}</p>
              </div>
            ) : (
              <div>
                <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2d6a2d)', borderRadius: 12, padding: '20px 24px', color: '#fff', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {crops.find(c => c.value === singleResult.details?.cropType)?.label || singleResult.details?.cropType} — {soils.find(soil => soil.value === singleResult.details?.soilType)?.label || singleResult.details?.soilType} soil
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, margin: '8px 0' }}>{singleResult.irrigationTime}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.9 }}>{singleResult.totalLitres?.toLocaleString()} Litres</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>total for {singleResult.area} acre(s) of farmland</div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#374151' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Calculation Breakdown</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                    <div>🌡️ Temp: <b>{singleResult.details?.temperature}°C</b></div>
                    <div>💧 Humidity: <b>{singleResult.details?.humidity}%</b></div>
                    <div>🌱 Soil factor: <b>{singleResult.details?.soilFactor}</b></div>
                    <div>🌦️ Climate factor: <b>{singleResult.details?.climateFactor}</b></div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                    ℹ️ Duration assumes a pump flow rate of <b>200 L/min</b> (standard for 3-5HP pumps).
                  </div>
                  <div style={{ marginTop: 8, fontFamily: 'monospace', background: '#fff', padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                    {singleResult.details?.formula}
                  </div>
                </div>
              </div>
            )
          )}

          {/* All crops result */}
          {activeTab === 'all' && allResult && (
            allResult.rainPrediction === 'yes' ? (
              <div style={{ background: '#e3f2fd', border: '1.5px solid #90caf9', borderRadius: 12, padding: '20px 24px' }}>
                <h3 style={{ color: '#1565c0', margin: '0 0 8px' }}>{T.noIrrigation}</h3>
                <p style={{ color: '#1e40af', margin: 0 }}>Rain is predicted — no irrigation needed for any crop today.</p>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#374151', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <span>🌡️ <b>{allResult.temperature}°C</b></span>
                  <span>💧 <b>{allResult.humidity}%</b> humidity</span>
                  <span>🌱 Soil: <b>{soils.find(soil => soil.value === allResult.soilType)?.label || allResult.soilType}</b></span>
                  <span>🌦️ Climate factor: <b>{allResult.climateFactor}</b></span>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  {['high', 'medium', 'low'].map(u => {
                    const us = urgencyStyle(u);
                    return (
                      <span key={u} style={{ background: us.bg, border: `1px solid ${us.border}`, color: us.badge, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                        ● {us.text}
                      </span>
                    );
                  })}
                  <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>Sorted by water need (highest first)</span>
                </div>

                {/* Crop grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {allResult.crops.map(crop => {
                    const us = urgencyStyle(crop.urgency);
                    return (
                      <div key={crop.value} style={{ background: us.bg, border: `1.5px solid ${us.border}`, borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{crop.label}</div>
                          <span style={{ background: us.badge, color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {us.text}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 24, fontWeight: 800, color: us.badge }}>{crop.minutes}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: us.badge }}>mins</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', marginTop: 2 }}>
                          {crop.totalLitres?.toLocaleString()} Litres
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                          ({crop.litresPerSqM} L/m²) for {allResult.area} acre(s)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        select:focus, input:focus { outline: none; border-color: #2d6a2d; box-shadow: 0 0 0 3px rgba(45,106,45,.12); }
      `}</style>
    </div>
  );
}