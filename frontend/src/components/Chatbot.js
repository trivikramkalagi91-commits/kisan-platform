import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const KNOWLEDGE_BASE = [
  { keywords: ['price', 'mandi', 'rate', 'cost'], response: 'You can check real-time Mandi prices across India on our Prices page. For example, Wheat is currently trading around ₹2,400/quintal in Punjab.', link: '/prices', label: 'View Prices' },
  { keywords: ['health', 'disease', 'leaf', 'sick', 'pest', 'ai'], response: 'Our🔬 Crop AI can diagnose plant diseases from a photo. It can identify 20+ diseases in Rice, Wheat, Tomato, and more.', link: '/crop-health', label: 'Check Crop Health' },
  { keywords: ['best scheme', 'which scheme', 'popular scheme', 'recommend'], response: 'The PM-KISAN scheme is considered best for most farmers, providing ₹6,000 annually. For equipment, the SMAM (Sub-Mission on Agricultural Mechanization) is excellent for subsidies.', link: '/schemes?q=pm-kisan&tab=schemes', label: 'View PM-KISAN' },
  { keywords: ['tractor', 'machinery', 'equipment', 'power tiller'], response: 'Tractor subsidies are available under the SMAM scheme, offering 40% to 50% (and up to 80% for some groups) on purchase.', link: '/schemes?q=tractor&tab=subsidies', label: 'Tractor Subsidies' },
  { keywords: ['solar', 'pump', 'kusum', 'electricity'], response: 'The PM-KUSUM scheme provides up to 60% subsidy for installing solar pumps, helping you save on diesel and electricity costs.', link: '/schemes?q=solar&tab=subsidies', label: 'Solar Pump Scheme' },
  { keywords: ['water', 'irrigation', 'pump', 'drip', 'sprinkler', 'pmksy'], response: 'Under PMKSY (Per Drop More Crop), you can get up to 55% subsidy on drip and sprinkler irrigation systems.', link: '/schemes?q=drip&tab=subsidies', label: 'Irrigation Subsidies' },
  { keywords: ['market', 'sell', 'buy', 'equipment', 'tractor', 'seeds'], response: 'Visit the Marketplace to buy or sell farm equipment, seeds, and produce directly with other farmers.', link: '/marketplace', label: 'Go to Marketplace' },
  { keywords: ['worker', 'labour', 'job', 'hire', 'work'], response: 'Looking for workers or farm jobs? Our Labour module connects local farmers with skilled help.', link: '/labour', label: 'Find Labour' },
  { keywords: ['loan', 'finance', 'bank', 'insurance', 'kcc', 'credit'], response: 'The Kisan Credit Card (KCC) offers loans at low interest (4%). You can check more details in our Finance section.', link: '/finance', label: 'Finance & Loans' },
  { keywords: ['business', 'idea', 'startup', 'income', 'money'], response: 'Get 50+ modern agricultural business ideas like Mushroom Farming or Organic Fertilizers in our Business Hub.', link: '/business', label: 'Business Hub' },
  { keywords: ['video', 'learn', 'watch', 'youtube'], response: 'We have curated thousands of agriculture videos in local languages covering modern farming techniques.', link: '/videos', label: 'Watch Videos' },
  { keywords: ['barter', 'exchange', 'swap'], response: 'Trade your excess crops with other farmers without using money! Perfect for local exchanges.', link: '/barter', label: 'Barter Exchange' },
  { keywords: ['guide', 'help', 'tutorial', 'how to'], response: 'Read our comprehensive User Guide to learn how to use every feature of this platform.', link: '/guide', label: 'User Guide' },
  { keywords: ['hi', 'hello', 'hey', 'namaste'], response: 'Namaste! 🙏 I am here to help you with prices, schemes, crop health, and more. What is on your mind?', link: null },
  { keywords: ['thank', 'thanks', 'dhanyawad'], response: 'You are very welcome! Always happy to help my fellow farmers. Is there anything else?', link: null },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Namaste! 🙏 I am your Kisan Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 84, y: window.innerHeight - 84 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Draggable logic
  const onMouseDown = (e) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };
    const onMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMsg.toLowerCase());
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800);
  };

  const generateResponse = (text) => {
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(k => text.includes(k))) {
        return { text: item.response, isBot: true, link: item.link, label: item.label };
      }
    }
    return { text: "I'm not sure about that. You can check our User Guide or ask about prices, crop health, or schemes!", isBot: true, link: '/guide', label: 'See User Guide' };
  };

  return (
    <>
      {/* Floating Draggable Bubble */}
      <div 
        onMouseDown={onMouseDown}
        style={{
          position: 'fixed', left: position.x, top: position.y, width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2d6a2d, #1b5e20)', color: 'white',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)', cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          animation: 'float 3s ease-in-out infinite'
        }}
        onClick={(e) => { if (!isDragging) setIsOpen(!isOpen); }}
      >
        {isOpen ? '✕' : '💬'}
      </div>

      {/* Chat Window Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed', 
          left: Math.min(Math.max(20, position.x - 320), window.innerWidth - 380), 
          top: Math.min(Math.max(20, position.y - 520), window.innerHeight - 540), 
          width: 360, height: 500,
          background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
          borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.4)', animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {/* Header */}
          <div style={{ background: 'rgba(45, 106, 45, 0.9)', color: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧑‍🌾</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Kisan Assistant</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Online · Interactive Expert</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                maxWidth: '85%', padding: '12px 16px', borderRadius: 16, fontSize: 14, lineHeight: 1.5,
                alignSelf: m.isBot ? 'flex-start' : 'flex-end',
                background: m.isBot ? 'white' : '#2d6a2d',
                color: m.isBot ? '#1f2937' : 'white',
                borderBottomLeftRadius: m.isBot ? 4 : 16,
                borderBottomRightRadius: m.isBot ? 16 : 4,
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                {m.text}
                {m.link && (
                  <button 
                    onClick={() => { navigate(m.link); setIsOpen(false); }}
                    style={{ 
                      marginTop: 10, display: 'block', width: '100%', padding: '8px',
                      background: '#f0fdf4', border: '1px solid #2d6a2d', borderRadius: 10,
                      color: '#2d6a2d', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                  >
                    {m.label} →
                  </button>
                )}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'white', padding: '10px 16px', borderRadius: 16, fontSize: 12, color: '#6b7280', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <span className="dot-typing"></span> Assistant is thinking...
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }} className="hide-scrollbar">
            {['Prices', 'Crop AI', 'Best Scheme', 'Tractor'].map(tag => (
              <button key={tag} 
                onClick={() => { setInput(tag); handleSend(); }}
                style={{ background: 'white', border: '1px solid #e5e7eb', padding: '6px 14px', borderRadius: 20, color: '#2d6a2d', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                {tag}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '12px 16px 20px', background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
              style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 14, padding: '12px 16px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
            />
            <button type="submit" style={{ background: '#2d6a2d', color: 'white', border: 'none', borderRadius: 14, width: 48, height: 48, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ➢
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .dot-typing {
          display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: #6b7280;
          animation: dot-pulse 1s infinite linear; margin-right: 4px;
        }
        @keyframes dot-pulse {
          0% { box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.4); }
          100% { box-shadow: 0 0 0 8px rgba(107, 114, 128, 0); }
        }
      `}</style>
    </>
  );
}
