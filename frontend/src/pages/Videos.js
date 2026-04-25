import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = (url, opts) => axios({ url: `${API_BASE}${url}`, ...opts }).then(r => r.data);

const LEVEL_COLOR = {
  Beginner:     { bg: '#dcfce7', color: '#166534' },
  Intermediate: { bg: '#fef9c3', color: '#854d0e' },
  Advanced:     { bg: '#dbeafe', color: '#1e40af' },
};

const CHANNEL_COLOR = {
  'DD Kisan':     '#d32f2f',
  'ICAR':         '#1565c0',
  'Krishi Jagran':'#2d6a2d',
  'UAS Dharwad':  '#6a1b9a',
  'PAU Ludhiana': '#e65100',
};

// Hint text shown below search box
const SEARCH_HINT = 'Search in English, ಕನ್ನಡ or हिंदी — e.g. "ಭತ್ತ", "धान", "paddy"';

export default function Videos() {
  const [videos, setVideos]       = useState([]);
  const [crops, setCrops]         = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ crop: '', language: '', level: '', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchVideos = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const r = await api('/videos', { params: currentFilters });
      setVideos(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      api('/videos/crops').then(r => setCrops(r.data)),
      api('/videos/languages').then(r => setLanguages(r.data)),
    ]);
    fetchVideos({ crop: '', language: '', level: '', search: '' });
  }, [fetchVideos]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (key !== 'search') {
      fetchVideos(updated);
    }
  };

  const handleSearch = () => {
    const updated = { ...filters, search: searchInput };
    setFilters(updated);
    fetchVideos(updated);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const updated = { ...filters, search: '' };
    setFilters(updated);
    fetchVideos(updated);
  };

  // Group videos by crop (only crops that have videos after filtering)
  const grouped = crops.reduce((acc, crop) => {
    const vids = videos.filter(v => v.crop === crop);
    if (vids.length) acc[crop] = vids;
    return acc;
  }, {});

  const showFlat = !!(filters.crop || filters.search);
  const totalCropsWithVideos = Object.keys(grouped).length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div className="page-header">
        <h1>🎬 Learn Farming Videos</h1>
        <p>DD Kisan, ICAR, Krishi Jagran, UAS Dharwad tutorials — click any title to watch on YouTube</p>
      </div>

      {/* Stats bar */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        {[
          { num: crops.length, label: 'Crops covered', color:'#2d6a2d', bg:'#e8f5e9' },
          { num: '3', label: 'Languages (English, ಕನ್ನಡ, हिंदी)', color:'#1565c0', bg:'#e3f2fd' },
          { num: videos.length, label: 'Videos available', color:'#c62828', bg:'#ffebee' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:10, padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontWeight:800, fontSize:20, color:s.color }}>{s.num}</span>
            <span style={{ fontSize:12, color:'#374151' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:12, padding:'14px 16px', marginBottom:6 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ position:'relative', flex:1 }}>
            <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:16 }}>🔍</span>
            <input
              placeholder='Search: paddy / ಭತ್ತ / धान / tomato / ಟೊಮೆಟೊ / टमाटर...'
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              style={{
                width:'100%', border:'1px solid #e5e7eb', borderRadius:8,
                padding:'9px 36px 9px 36px', fontSize:14, outline:'none',
                fontFamily:'inherit', boxSizing:'border-box'
              }}
            />
            {searchInput && (
              <button onClick={handleClearSearch}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'#9ca3af', fontSize:16, padding:0 }}>
                ✕
              </button>
            )}
          </div>
          <button className="btn-primary" onClick={handleSearch}
            style={{ whiteSpace:'nowrap', padding:'9px 18px' }}>
            Search
          </button>
        </div>
      </div>
      <div style={{ fontSize:12, color:'#9ca3af', marginBottom:14, paddingLeft:4 }}>
        💡 {SEARCH_HINT}
      </div>

      {/* Dropdown filters */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <select value={filters.crop} onChange={e => handleFilterChange('crop', e.target.value)}
          style={{ flex:1, minWidth:150, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', fontSize:13, background:'white' }}>
          <option value="">🌾 All Crops ({crops.length})</option>
          {crops.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.language} onChange={e => handleFilterChange('language', e.target.value)}
          style={{ flex:1, minWidth:130, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', fontSize:13, background:'white' }}>
          <option value="">🌐 All Languages</option>
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filters.level} onChange={e => handleFilterChange('level', e.target.value)}
          style={{ flex:1, minWidth:130, border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', fontSize:13, background:'white' }}>
          <option value="">📊 All Levels</option>
          <option value="Beginner">🟢 Beginner</option>
          <option value="Intermediate">🟡 Intermediate</option>
          <option value="Advanced">🔵 Advanced</option>
        </select>
        {(filters.crop || filters.language || filters.level || filters.search) && (
          <button onClick={() => {
            setSearchInput('');
            const reset = { crop:'', language:'', level:'', search:'' };
            setFilters(reset);
            fetchVideos(reset);
          }} style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 14px', fontSize:13, background:'white', cursor:'pointer', color:'#6b7280' }}>
            ✕ Clear All
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'#6b7280' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🎬</div>
          <div>Loading videos...</div>
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 20px', background:'white', borderRadius:12, border:'1px solid #e5e7eb' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
          <h3 style={{ fontWeight:700, marginBottom:8 }}>No videos found</h3>
          <p style={{ color:'#6b7280', fontSize:13 }}>
            Try searching in a different language or use the dropdown filters.
          </p>
        </div>
      )}

      {/* Flat list when filtering by crop or search */}
      {!loading && showFlat && videos.length > 0 && (
        <>
          <div style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>
            Found <strong>{videos.length}</strong> video{videos.length !== 1 ? 's' : ''}
            {filters.search ? ` for "${filters.search}"` : ''}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {videos.map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        </>
      )}

      {/* Grouped by crop — shown when no crop/search filter */}
      {!loading && !showFlat && (
        <>
          {filters.language || filters.level ? (
            <div style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>
              Showing <strong>{videos.length}</strong> videos across <strong>{totalCropsWithVideos}</strong> crops
            </div>
          ) : (
            <div style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>
              All <strong>{crops.length}</strong> crops — 3 videos each (Kannada · Hindi · English)
            </div>
          )}

          {Object.entries(grouped).map(([crop, vids]) => (
            <div key={crop} style={{ marginBottom:26 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10,
                paddingBottom:8, borderBottom:'2px solid #e5e7eb' }}>
                <h3 style={{ fontSize:16, fontWeight:700, margin:0 }}>🌾 {crop}</h3>
                <div style={{ display:'flex', gap:4 }}>
                  {vids.map(v => (
                    <span key={v.id} style={{
                      fontSize:11, padding:'2px 7px', borderRadius:20,
                      background: v.language==='Kannada' ? '#f3e5f5' : v.language==='Hindi' ? '#fff3e0' : '#e3f2fd',
                      color:       v.language==='Kannada' ? '#6a1b9a' : v.language==='Hindi' ? '#e65100' : '#1565c0',
                      fontWeight:600
                    }}>
                      {v.language}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {vids.map(v => <VideoCard key={v.id} video={v} />)}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function VideoCard({ video }) {
  const lc = LEVEL_COLOR[video.level] || LEVEL_COLOR.Beginner;
  const channelColor = CHANNEL_COLOR[video.channel] || '#6b7280';
  const langBg = video.language === 'Kannada' ? '#f3e5f5'
               : video.language === 'Hindi'   ? '#fff3e0'
               : '#e3f2fd';
  const langColor = video.language === 'Kannada' ? '#6a1b9a'
                  : video.language === 'Hindi'   ? '#e65100'
                  : '#1565c0';

  return (
    <a href={video.youtube_url} target="_blank" rel="noopener noreferrer"
      style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
        background:'#fff', border:'1px solid #e5e7eb', borderRadius:10,
        textDecoration:'none', color:'inherit', transition:'background 0.15s, border-color 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.borderColor='#d1d5db'; }}
      onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e5e7eb'; }}>

      {/* Red play button */}
      <div style={{ flexShrink:0, width:34, height:34, background:'#ff0000', borderRadius:8,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ color:'#fff', fontSize:13, marginLeft:2 }}>▶</span>
      </div>

      {/* Title + meta */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {video.title}
        </div>
        <div style={{ fontSize:12, marginTop:3, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ color:channelColor, fontWeight:600 }}>{video.channel}</span>
          <span style={{ color:'#9ca3af' }}>·</span>
          <span style={{ background:langBg, color:langColor, fontWeight:600,
            padding:'1px 7px', borderRadius:12, fontSize:11 }}>{video.language}</span>
          <span style={{ color:'#9ca3af' }}>· {video.duration}</span>
          {video.views && <span style={{ color:'#9ca3af' }}>· 👁 {video.views}</span>}
        </div>
      </div>

      {/* Level badge */}
      <span style={{ flexShrink:0, fontSize:11, fontWeight:600, padding:'3px 9px',
        borderRadius:20, background:lc.bg, color:lc.color }}>
        {video.level}
      </span>

      {/* Arrow */}
      <span style={{ color:'#9ca3af', fontSize:16, flexShrink:0 }}>↗</span>
    </a>
  );
}
