import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Guide Data ──────────────────────────────────────────────────────────────
const GUIDE_SECTIONS = [
  {
    id: 'getting-started',
    icon: '🚀',
    title: 'Getting Started',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    steps: [
      { title: 'Open the App', desc: 'Visit the Kisan Platform from your phone or computer. No login or sign-up needed — it\'s completely free!' },
      { title: 'Choose Your Language', desc: 'Click the 🌐 language button on the top right corner. We support Hindi, Kannada, Telugu, Tamil, Marathi, Gujarati, Bengali, Punjabi, Malayalam, Odia and Urdu.' },
      { title: 'Explore Modules', desc: 'The Home page shows all available modules. Tap any card to open that feature. Each module is designed to solve a specific problem for farmers.' },
    ]
  },
  {
    id: 'crop-prices',
    icon: '📈',
    title: 'Live Crop Prices',
    color: '#2d6a2d',
    bg: '#e8f5e9',
    border: '#a5d6a7',
    path: '/prices',
    steps: [
      { title: 'Select Your State & District', desc: 'Choose your state and district from the dropdown menus. The app will fetch real-time prices from nearby mandis.' },
      { title: 'View Mandi Prices', desc: 'See current buy prices for all crops in your area. Prices are updated daily from the AgMarknet government database.' },
      { title: 'Find Best Selling Mandi', desc: 'The system shows which mandi is offering the highest price for your crop, helping you decide where to sell for maximum profit.' },
      { title: 'Check 30-Day Trends', desc: 'View price history charts to understand if prices are going up or down, so you can time your sale better.' },
    ]
  },
  {
    id: 'crop-health',
    icon: '🔬',
    title: 'Crop Health AI',
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
    path: '/crop-health',
    steps: [
      { title: 'Upload or Capture a Leaf Photo', desc: 'Click "Upload Image" to select a photo from your gallery, or "Capture Image" to take a new photo with your camera.' },
      { title: 'Click "Analyse Crop"', desc: 'The AI will analyze the leaf image in 2-4 seconds. Make sure the photo is clear and well-lit for best results.' },
      { title: 'View Disease Detection', desc: 'The AI identifies 38+ crop diseases and tells you if your crop is healthy or diseased, with confidence percentage.' },
      { title: 'Get Treatment Advice', desc: 'If disease is detected, you\'ll get specific fertilizer, pesticide, and step-by-step treatment recommendations.' },
      { title: 'Important: Only Upload Crop Photos', desc: 'The AI only works with plant/crop/leaf images. If you upload a non-crop image (human, animal, etc.), it will show "Crop Not Detected".' },
    ]
  },
  {
    id: 'schemes',
    icon: '🏛️',
    title: 'Government Schemes',
    color: '#1565c0',
    bg: '#e3f2fd',
    border: '#90caf9',
    path: '/schemes',
    steps: [
      { title: 'Browse All Schemes', desc: 'View all central and state government schemes available for farmers — PM-KISAN, crop insurance, subsidies, and more.' },
      { title: 'Check Eligibility', desc: 'The auto-eligibility checker tells you which schemes you qualify for based on your details.' },
      { title: 'Apply Step-by-Step', desc: 'Get detailed, simple instructions on how to apply for each scheme, including required documents and where to go.' },
    ]
  },
  {
    id: 'subsidy',
    icon: '💰',
    title: 'Government Subsidies',
    color: '#00695c',
    bg: '#e0f2f1',
    border: '#80cbc4',
    path: '/subsidy',
    steps: [
      { title: 'Find Capital Subsidies', desc: 'Discover subsidies for drip irrigation, machinery, solar pumps, cold storage, and polyhouse — up to 90% subsidy available.' },
      { title: 'Calculate Your Savings', desc: 'See exactly how much money you can save with each subsidy scheme before investing.' },
      { title: 'Get Application Help', desc: 'Step-by-step guide to apply, with links to official portals and helpline numbers.' },
    ]
  },
  {
    id: 'marketplace',
    icon: '🛒',
    title: 'Farmer Marketplace',
    color: '#6a1b9a',
    bg: '#f3e5f5',
    border: '#ce93d8',
    path: '/marketplace',
    steps: [
      { title: 'Browse Listings', desc: 'See what other farmers are selling — equipment, seeds, livestock, produce, and more.' },
      { title: 'Post Your Items', desc: 'List your items for sale with photos and price. Direct farmer-to-farmer sales with zero commission.' },
      { title: 'Connect Directly', desc: 'No middlemen. Contact sellers/buyers directly through the platform.' },
    ]
  },
  {
    id: 'advisor',
    icon: '🤖',
    title: 'AI Crop Advisor',
    color: '#1565c0',
    bg: '#e8eaf6',
    border: '#9fa8da',
    path: '/advisor',
    steps: [
      { title: 'Enter Your Land Details', desc: 'Provide information about your soil type, land area, and location.' },
      { title: 'Get AI Recommendations', desc: 'The AI analyzes soil, climate, and market data to recommend the most profitable crops for your land.' },
      { title: 'Plan Your Season', desc: 'Get a complete plan including when to sow, expected yield, and projected income.' },
    ]
  },
  {
    id: 'labour',
    icon: '👷',
    title: 'Labour Hiring',
    color: '#e65100',
    bg: '#fff3e0',
    border: '#ffcc80',
    path: '/labour',
    steps: [
      { title: 'Post a Job', desc: 'Need workers for harvest, sowing, or other farm work? Post a job with details and daily wages.' },
      { title: 'Find Work', desc: 'Looking for farm work? Browse available jobs near your area and connect directly with farmers.' },
      { title: 'No Middlemen', desc: 'Direct farmer-worker connection. No agents, no commission.' },
    ]
  },
  {
    id: 'barter',
    icon: '🔄',
    title: 'Barter System',
    color: '#00695c',
    bg: '#e0f2f1',
    border: '#80cbc4',
    path: '/barter',
    steps: [
      { title: 'List What You Have', desc: 'Have excess rice but need wheat? List what you want to swap.' },
      { title: 'Find Matches', desc: 'The system finds nearby farmers who want what you have and have what you need.' },
      { title: 'Swap Without Cash', desc: 'Exchange crops directly — no money needed. Great during cash-flow tight seasons.' },
    ]
  },
  {
    id: 'finance',
    icon: '💰',
    title: 'Finance & Loans',
    color: '#f57f17',
    bg: '#fff8e1',
    border: '#fff176',
    path: '/finance',
    steps: [
      { title: 'Compare Bank Loans', desc: 'See interest rates from all major banks side-by-side. Find the lowest EMI for your needs.' },
      { title: 'EMI Calculator', desc: 'Calculate exactly how much you\'ll pay monthly before taking any loan.' },
      { title: 'Crop Insurance', desc: 'Understand crop insurance options and how to protect your investment.' },
    ]
  },
  {
    id: 'irrigation',
    icon: '💧',
    title: 'Smart Irrigation',
    color: '#0277bd',
    bg: '#e1f5fe',
    border: '#81d4fa',
    path: '/irrigation',
    steps: [
      { title: 'Enter Crop & Location', desc: 'Select your crop type and provide your farm location for weather-based irrigation advice.' },
      { title: 'Get Watering Schedule', desc: 'AI-powered recommendations tell you exactly when and how much to water based on weather, soil, and crop stage.' },
      { title: 'Save Water & Money', desc: 'Optimized irrigation reduces water waste by up to 40% while improving crop yield.' },
    ]
  },
];

const FAQ_DATA = [
  { q: 'Is Kisan Platform free?', a: 'Yes! Kisan Platform is 100% free forever. No charges, no commission, no hidden fees. All modules are completely free to use.' },
  { q: 'Do I need to sign up or login?', a: 'No sign-up or login is required. You can start using all features immediately. Just open the website and explore.' },
  { q: 'Does it work on slow 2G/3G networks?', a: 'Yes! The platform is optimized for slow rural networks. Images are automatically compressed, and pages load fast even on 2G connections.' },
  { q: 'Where does the crop price data come from?', a: 'All crop prices come directly from AgMarknet, the official Government of India agricultural marketing database. Prices are updated daily.' },
  { q: 'How accurate is the Crop Health AI?', a: 'The AI uses Google Gemini and can detect 38+ plant diseases. For best results, take a clear, well-lit photo of the affected leaf. Accuracy is typically 85-95%.' },
  { q: 'Can I use this on my phone?', a: 'Absolutely! The platform is designed mobile-first for smartphones. It works on any phone with a web browser — Android, iPhone, or feature phones.' },
  { q: 'What languages are supported?', a: 'We support 12 Indian languages: English, Hindi, Marathi, Kannada, Telugu, Tamil, Gujarati, Bengali, Punjabi, Malayalam, Odia, and Urdu.' },
  { q: 'Is my data safe?', a: 'We don\'t collect personal data. No login means no personal information stored. Crop images are analyzed in real-time and not permanently stored.' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function UserGuide() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = searchQuery
    ? GUIDE_SECTIONS.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.steps.some(step =>
          step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          step.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : GUIDE_SECTIONS;

  const currentSection = GUIDE_SECTIONS.find(s => s.id === activeSection);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)',
        borderRadius: 18, padding: '40px 28px', color: 'white', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 14px', borderRadius: 99 }}>
              📖 Complete Guide · Step-by-Step
            </div>
            <div style={{ fontSize: 11, background: '#2563eb', display: 'inline-block', padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.3)' }}>
              🌾 For Indian Farmers
            </div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>
            📘 User Guide
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, maxWidth: 520, lineHeight: 1.7 }}>
            Learn how to use every feature of Kisan Platform. Simple step-by-step instructions for all 14 modules — designed for farmers who are new to technology.
          </p>
        </div>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 140, opacity: 0.06 }}>📖</div>
      </div>

      {/* ── Quick Start Cards ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚡ Quick Start — 3 Easy Steps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="quick-start-grid">
          {[
            { num: '1', icon: '🌐', title: 'Open & Choose Language', desc: 'Open the app and select your preferred language from the top right corner.', color: '#2563eb', bg: '#eff6ff' },
            { num: '2', icon: '📱', title: 'Pick a Module', desc: 'Go to Home page and tap on the feature you need — prices, schemes, crop health, etc.', color: '#16a34a', bg: '#f0fdf4' },
            { num: '3', icon: '✅', title: 'Follow the Steps', desc: 'Each module has simple instructions. Just follow them to get the help you need!', color: '#7c3aed', bg: '#f5f3ff' },
          ].map((step, i) => (
            <div key={i} style={{
              background: step.bg, borderRadius: 16, padding: '24px 20px',
              border: `1px solid ${step.color}22`, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -8, right: -4, fontSize: 80, fontWeight: 900,
                color: step.color, opacity: 0.06,
              }}>{step.num}</div>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{step.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: step.color, marginBottom: 6 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'white', border: '2px solid #e5e7eb', borderRadius: 14,
          padding: '12px 18px', transition: 'border-color 0.2s',
        }}>
          <span style={{ fontSize: 18, color: '#9ca3af' }}>🔍</span>
          <input
            type="text"
            placeholder="Search guides... (e.g., 'crop prices', 'disease detection', 'loan')"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 14,
              color: '#1f2937', background: 'transparent',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content: Sidebar + Detail ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 36 }} className="guide-layout">
        {/* Sidebar */}
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #e5e7eb',
          padding: '8px', height: 'fit-content', position: 'sticky', top: 72,
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <div style={{ padding: '12px 14px 8px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            All Modules
          </div>
          {filteredSections.map(section => (
            <button
              key={section.id}
              onClick={() => { setActiveSection(section.id); setSearchQuery(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 14px', border: 'none', borderRadius: 10,
                background: activeSection === section.id ? section.bg : 'transparent',
                color: activeSection === section.id ? section.color : '#374151',
                fontWeight: activeSection === section.id ? 700 : 400,
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', marginBottom: 2,
              }}
              onMouseEnter={e => { if (activeSection !== section.id) e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (activeSection !== section.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 18 }}>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {currentSection && (
            <div style={{
              background: 'white', borderRadius: 16, border: `2px solid ${currentSection.border}`,
              overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
              {/* Section Header */}
              <div style={{
                background: currentSection.bg, padding: '28px 24px',
                borderBottom: `1px solid ${currentSection.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    {currentSection.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: currentSection.color, marginBottom: 4 }}>
                      {currentSection.title}
                    </h2>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {currentSection.steps.length} steps to follow
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div style={{ padding: '24px' }}>
                {currentSection.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 16, marginBottom: i < currentSection.steps.length - 1 ? 20 : 0,
                    position: 'relative',
                  }}>
                    {/* Step Number Line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: currentSection.color, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      {i < currentSection.steps.length - 1 && (
                        <div style={{
                          width: 2, flex: 1, background: currentSection.border,
                          marginTop: 4, minHeight: 20,
                        }} />
                      )}
                    </div>

                    {/* Step Content */}
                    <div style={{ paddingBottom: 4, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Go to module button */}
                {currentSection.path && (
                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${currentSection.border}` }}>
                    <button
                      onClick={() => navigate(currentSection.path)}
                      style={{
                        background: currentSection.color, color: 'white', border: 'none',
                        borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {currentSection.icon} Open {currentSection.title} →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FAQ Section ── */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          ❓ Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ_DATA.map((faq, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 14, border: '1px solid #e5e7eb',
              overflow: 'hidden', transition: 'box-shadow 0.2s',
              boxShadow: expandedFaq === i ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
            }}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '16px 20px', border: 'none',
                  background: expandedFaq === i ? '#f8fafc' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', gap: 12,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', flex: 1 }}>{faq.q}</span>
                <span style={{
                  fontSize: 16, color: '#9ca3af', flexShrink: 0,
                  transform: expandedFaq === i ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}>▼</span>
              </button>
              {expandedFaq === i && (
                <div style={{
                  padding: '0 20px 18px', fontSize: 13, color: '#4b5563',
                  lineHeight: 1.8, borderTop: '1px solid #f3f4f6',
                  paddingTop: 14,
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Help Contact ── */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '1px solid #fbbf24', borderRadius: 16, padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20,
      }} className="help-contact-box">
        <div style={{ fontSize: 44, flexShrink: 0 }}>🆘</div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
            Need More Help?
          </h3>
          <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7, marginBottom: 10 }}>
            If you're stuck or need assistance, you can call the Kisan Call Centre for free help in your language.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              background: 'white', borderRadius: 10, padding: '8px 16px',
              fontSize: 14, fontWeight: 700, color: '#92400e',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              📞 Kisan Helpline: 1800-180-1551 (Toll Free)
            </div>
            <div style={{
              background: 'white', borderRadius: 10, padding: '8px 16px',
              fontSize: 14, fontWeight: 700, color: '#92400e',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              📞 PM-KISAN: 155261
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .guide-layout { grid-template-columns: 1fr !important; }
          .quick-start-grid { grid-template-columns: 1fr !important; }
          .help-contact-box { flex-direction: column; text-align: center; }
        }
      `}</style>
    </div>
  );
}
