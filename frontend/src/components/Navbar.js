import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/prices', label: 'Prices' },
  { path: '/schemes', label: 'Schemes' },
  { path: '/subsidy', label: 'Subsidy' },
  { path: '/crop-health', label: '🔬 Crop AI' },
  { path: '/labour', label: 'Labour' },
  { path: '/marketplace', label: 'Market' },
  { path: '/barter', label: 'Barter' },
  { path: '/advisor', label: 'Advisor' },
  { path: '/fear', label: 'Fear' },
  { path: '/videos', label: 'Videos' },
  { path: '/finance', label: 'Finance' },
  { path: '/business', label: 'Business' },
  { path: '/irrigation', label: 'Irrigation' },
  { path: '/buyers', label: '🏪 Buyers' },
  { path: '/guide', label: '📘 Guide' },
];

// ─── Language Switcher ──────────────────────────────────────────────────────
// Uses Google Translate's standard widget with URL-based language persistence.
// We avoid the default Google Translate widget UI (which distorts layout) and
// instead build our own dropdown that calls the translate function directly.
// Language preference is saved to localStorage so it persists across pages/reloads.

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
];

const STORAGE_KEY = 'kisan_lang';

function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  );
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply saved language on mount (after Google Translate script loads)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved !== 'en') {
      let attempts = 0;
      const tryApply = setInterval(() => {
        attempts++;
        if (attempts > 30) { clearInterval(tryApply); return; }
        if (applyGoogleTranslate(saved)) clearInterval(tryApply);
      }, 300);
    }
  }, []);

  function applyGoogleTranslate(langCode) {
    try {
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        selectEl.value = langCode;
        selectEl.dispatchEvent(new Event('change'));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function handleLanguageChange(lang) {
    setActiveLang(lang.code);
    localStorage.setItem(STORAGE_KEY, lang.code);
    setOpen(false);

    if (lang.code === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
      window.location.reload();
      return;
    }

    document.cookie = `googtrans=/en/${lang.code}; path=/`;
    document.cookie = `googtrans=/en/${lang.code}; path=/; domain=.${window.location.hostname}`;

    if (!applyGoogleTranslate(lang.code)) {
      window.location.reload();
    }
  }

  const currentLang = LANGUAGES.find(l => l.code === activeLang) || LANGUAGES[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }} className="lang-switcher">
      <button
        onClick={() => setOpen(o => !o)}
        className="notranslate"
        style={{
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: 12,
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 600,
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
        aria-label="Change language"
      >
        <span style={{ fontSize: 16 }}>🌐</span>
        <span>{currentLang.native}</span>
        <span style={{ fontSize: 10, color: '#9ca3af', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          minWidth: 200,
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '6px',
        }}>
          <div style={{ padding: '8px 12px', fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Language
          </div>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang)}
              className="notranslate"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                background: activeLang === lang.code ? '#f0f9ff' : 'transparent',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                color: activeLang === lang.code ? '#0284c7' : '#374151',
                fontWeight: activeLang === lang.code ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (activeLang !== lang.code) e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (activeLang !== lang.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: activeLang === lang.code ? 700 : 500 }}>{lang.native}</span>
                <span style={{ fontSize: 11, color: activeLang === lang.code ? '#0284c7' : '#9ca3af', opacity: 0.8 }}>{lang.label}</span>
              </div>
              {activeLang === lang.code && <span style={{ fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Navbar Component ────────────────────────────────────────────────────────
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {/* Google Translate hidden widget container — must be in DOM */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 12px', display: 'flex', alignItems: 'center', height: 56, gap: 8 }}>
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 24 }}>🌾</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2d6a2d', lineHeight: 1.1 }}>Kisan Platform</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>ಕಿಸಾನ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್</div>
          </div>
        </NavLink>

        <div style={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center', overflowX: 'auto' }} className="desktop-nav">
          {NAV_ITEMS.slice(1).map(item => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              padding: '5px 9px', borderRadius: 7, fontSize: 12, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#2d6a2d' : '#374151', background: isActive ? '#e8f5e9' : 'transparent',
              textDecoration: 'none', whiteSpace: 'nowrap',
            })}>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', fontSize: 22, padding: 4, display: 'none', cursor: 'pointer' }} className="mobile-menu-btn">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '8px 12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? '#2d6a2d' : '#374151', background: isActive ? '#e8f5e9' : 'transparent', textDecoration: 'none' })}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .lang-switcher button span:not(:first-child) { display: none; }
          .lang-switcher button { padding: 6px 8px !important; }
        }
        /* Page transition enhancement */
        body { opacity: 0; animation: fadeInPage 0.6s ease-out forwards; }
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Completely hide the Google Translate toolbar that appears at top */
        .goog-te-banner-frame, .skiptranslate { display: none !important; }
        body { top: 0px !important; }
        /* Prevent Google Translate from distorting fonts */
        .goog-text-highlight { background: none !important; box-shadow: none !important; }
        font { color: inherit !important; }
        /* Language switcher improvements */
        .lang-switcher button:hover { border-color: #0284c7 !important; background: #f0f9ff !important; }
      `}</style>
    </nav>
  );
}
