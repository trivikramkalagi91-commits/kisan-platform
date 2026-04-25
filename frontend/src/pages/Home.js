import React from 'react';
import { useNavigate } from 'react-router-dom';

const MODULES = [
  { path: '/prices', icon: '📈', title: 'Live Crop Prices', desc: 'Real-time mandi prices from AgMarknet. 30-day trends, price alerts, best mandi finder.', color: '#2d6a2d', bg: '#e8f5e9', tag: 'Free Data' },
  { path: '/schemes', icon: '🏛️', title: 'Govt Schemes Finder', desc: 'All central and state schemes. Auto eligibility check. Step-by-step apply guide.', color: '#1565c0', bg: '#e3f2fd', tag: 'Free Money' },
  { path: '/labour', icon: '👷', title: 'Labour Hiring', desc: 'Post harvest jobs or find farm work. Direct farmer-worker connect. SMS alerts.', color: '#e65100', bg: '#fff3e0', tag: 'No Middlemen' },
  { path: '/marketplace', icon: '🛒', title: 'Farmer Marketplace', desc: 'Buy and sell equipment, seeds, livestock, produce. OLX for farmers.', color: '#6a1b9a', bg: '#f3e5f5', tag: 'Zero Commission' },
  { path: '/barter', icon: '🔄', title: 'Barter System', desc: 'Swap rice for wheat, dal for jowar. No cash needed. Geo-matched farmers.', color: '#00695c', bg: '#e0f2f1', tag: 'No Cash' },
  { path: '/advisor', icon: '🤖', title: 'AI Crop Advisor', desc: 'Soil, climate and market data combined. Recommends most profitable crop for your land.', color: '#1565c0', bg: '#e8eaf6', tag: 'AI Powered' },
  { path: '/fear', icon: '💪', title: 'Fear Crusher', desc: 'District success rates, real farmer stories, week-by-week guide and risk meter.', color: '#c62828', bg: '#ffebee', tag: 'Build Courage' },
  { path: '/videos', icon: '🎬', title: 'Learn Farming Videos', desc: 'Best tutorials from DD Kisan, ICAR, Krishi Jagran in Kannada, Hindi, Telugu.', color: '#c62828', bg: '#fce4ec', tag: 'Multi-Language' },
  { path: '/finance', icon: '💰', title: 'Finance Section', desc: 'Compare all bank loans. Lowest interest rates. EMI calculator. Crop insurance.', color: '#f57f17', bg: '#fff8e1', tag: 'Save Money' },
  { path: '/business', icon: '🏪', title: 'Business Hub', desc: 'Start a pipe shop, dairy or tractor rental. Mudra loan guide and business plan.', color: '#4527a0', bg: '#ede7f6', tag: 'New Income' },
  { path: '/subsidy', icon: '💰', title: 'Govt Subsidies', desc: 'Direct capital subsidies on drip, machinery, solar pumps, cold storage & polyhouse. Up to 90% subsidy.', color: '#00695c', bg: '#e0f2f1', tag: 'Save Money' },
  { path: '/crop-health', icon: '🔬', title: 'Crop Health AI', desc: 'Upload or capture a leaf photo. AI detects 38 plant diseases instantly with fertilizer & treatment advice.', color: '#b45309', bg: '#fef3c7', tag: 'AI Powered' },
  { path: '/buyers', icon: '🏪', title: 'Crop Buyers & Tenders', desc: 'Find government APMC mandis, FCI, private companies & export channels to sell your crops at the best price.', color: '#c2410c', bg: '#fff7ed', tag: 'Best Price' },
  { path: '/guide', icon: '📘', title: 'User Guide', desc: 'Step-by-step guide for every feature. Learn how to use the platform easily, even if you are new to technology.', color: '#2563eb', bg: '#eff6ff', tag: 'Help' },
];

const STATS = [
  { num: '14', label: 'Complete modules' },
  { num: '7,000+', label: 'Mandis tracked' },
  { num: '38', label: 'Disease classes' },
  { num: '0%', label: 'Commission' },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20 0%,#2d6a2d 60%,#33691e 100%)', borderRadius: 16, padding: '44px 28px', color: 'white', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 14 }}>🇮🇳 Complete Super App for Indian Farmers — All 14 Modules</div>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>Kisan Platform 🌾</h1>
          <p style={{ fontSize: 15, opacity: 0.9, maxWidth: 520, marginBottom: 24, lineHeight: 1.7 }}>
            Live crop prices, government schemes &amp; subsidies, labour hiring, marketplace, barter, AI crop advisor, fear crusher, videos, finance and business hub — everything a farmer needs, free forever.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/prices')} style={{ background: 'white', color: '#2d6a2d', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Check Crop Prices →</button>
            <button onClick={() => navigate('/advisor')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '10px 20px', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>AI Crop Advisor</button>
          </div>
        </div>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 130, opacity: 0.07 }}>🌾</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#2d6a2d' }}>{s.num}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>All 14 Modules</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14, marginBottom: 36 }}>
        {MODULES.map(mod => (
          <div key={mod.path} className="card" onClick={() => navigate(mod.path)}
            style={{ cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: mod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{mod.icon}</div>
              <span style={{ background: mod.bg, color: mod.color, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>{mod.tag}</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, color: mod.color }}>{mod.title}</h3>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{mod.desc}</p>
            <div style={{ marginTop: 12, fontSize: 12, color: mod.color, fontWeight: 600 }}>Open →</div>
          </div>
        ))}
      </div>

      {/* Trust */}
      <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center', padding: '28px 20px' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🤝</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Built for farmers, free forever</h3>
        <p style={{ color: '#6b7280', maxWidth: 480, margin: '0 auto', fontSize: 13, lineHeight: 1.7 }}>
          No commission. No ads. No middlemen. All 10 modules are completely free. Data from AgMarknet and official government portals.
        </p>
      </div>
    </div>
  );
}
