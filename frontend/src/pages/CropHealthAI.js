import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = process.env.REACT_APP_CROP_HEALTH_API || 'http://localhost:5001';

const MAX_IMAGE_DIMENSION = 800; // px — compress before sending

// Simple scan history (in-memory for the session; persisted to localStorage)
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('cropHealthHistory') || '[]'); }
  catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem('cropHealthHistory', JSON.stringify(h.slice(0, 20))); }
  catch {}
}

// ─── Image compression helper ─────────────────────────────────────────────────
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (Math.max(width, height) > MAX_IMAGE_DIMENSION) {
          const ratio = MAX_IMAGE_DIMENSION / Math.max(width, height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        canvas.toBlob((blob) => {
          if (blob) resolve({ blob, dataUrl });
          else reject(new Error("Failed to compress image"));
        }, 'image/jpeg', 0.82);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Confidence bar ───────────────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  // Parse value if it's a string like "95%"
  const numericValue = typeof value === 'string' ? parseInt(value) : value;
  const color = numericValue >= 75 ? '#16a34a' : numericValue >= 50 ? '#d97706' : '#dc2626';
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: '#6b7280' }}>Confidence</span>
        <span style={{ fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${numericValue}%`, background: color,
          borderRadius: 99, transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
}


// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({ result, imageUrl }) {
  const noCropDetected = result.isCropDetected === false || !result.crop || result.crop.toLowerCase() === 'none' || result.crop.toLowerCase().includes('not detected') || result.crop.toLowerCase().includes('unknown') || result.crop.toLowerCase().includes('not a plant') || result.crop.toLowerCase().includes('not a crop');
  
  const isHealthy = result.isHealthy;
  const accent = noCropDetected ? '#6b7280' : (isHealthy ? '#16a34a' : '#dc2626');
  const accentBg = noCropDetected ? '#f3f4f6' : (isHealthy ? '#f0fdf4' : '#fef2f2');
  const accentBorder = noCropDetected ? '#d1d5db' : (isHealthy ? '#bbf7d0' : '#fecaca');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 28 }} className="result-grid">
      {/* Left — image + status */}
      <div style={{ background: 'white', borderRadius: 16, border: `2px solid ${accentBorder}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ position: 'relative' }}>
          <img src={imageUrl} alt="Scanned crop" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: accent,
            color: 'white', borderRadius: 99, padding: '5px 14px',
            fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            <span>{noCropDetected ? '❓' : (isHealthy ? '✅' : '⚠️')}</span>
            <span>{noCropDetected ? 'Crop Not Detected' : (isHealthy ? 'Healthy' : 'Disease Detected')}</span>
          </div>

        </div>
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
            🌿 <strong>Crop:</strong> {noCropDetected ? 'Not Detected' : result.crop}
          </div>
          {noCropDetected ? (
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4b5563', marginBottom: 10 }}>
              <span>No crop was detected in this image. Please upload a clear photo of a plant leaf.</span>
            </div>
          ) : (
            <>
              {!isHealthy && (
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                  🦠 <strong>Disease:</strong>{' '}
                  <span style={{ color: accent, fontWeight: 600 }}>{result.disease}</span>
                </div>
              )}
              {isHealthy && (
                <div style={{ fontSize: 15, fontWeight: 600, color: '#16a34a', marginBottom: 10 }}>
                  <span>Your crop looks healthy! 🎉</span>
                </div>
              )}
            </>
          )}
          <ConfidenceBar value={result.confidence} />
          {result.lowConfidence && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
              <span>⚡ Low confidence — try a clearer, well-lit photo</span>
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 11, color: '#9ca3af' }}>
            ⏱ {result.processingMs} ms · {new Date(result.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Right — recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!noCropDetected && (
          <>
            {/* Prevention always shown */}
            {result.prevention.length > 0 && (
              <Section icon="🛡️" title="Preventive Measures" color="#1d4ed8" bg="#eff6ff" border="#bfdbfe" items={result.prevention} />
            )}
            {!isHealthy && (
              <>
                {result.treatment.length > 0 && (
                  <Section icon="💊" title="Treatment Steps" color="#dc2626" bg="#fef2f2" border="#fecaca" items={result.treatment} />
                )}
                {result.fertilizers.length > 0 && (
                  <Section icon="🌱" title="Recommended Fertilizers" color="#16a34a" bg="#f0fdf4" border="#bbf7d0" items={result.fertilizers} />
                )}
                {result.pesticides.length > 0 && (
                  <Section icon="🧪" title="Pesticides / Chemicals" color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" items={result.pesticides} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, color, bg, border, items }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: 13, color, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 13, color: '#374151', display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.5 }}>
            <span style={{ color, flexShrink: 0, marginTop: 1 }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── History panel ────────────────────────────────────────────────────────────
function HistoryPanel({ history, onSelect, onClear }) {
  if (history.length === 0) return null;
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>📋 Scan History</h3>
        <button onClick={onClear} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
          Clear
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {history.map((h, i) => {
          const noCropDetected = h.result.isCropDetected === false || !h.result.crop || h.result.crop.toLowerCase() === 'none' || h.result.crop.toLowerCase().includes('not detected') || h.result.crop.toLowerCase().includes('unknown') || h.result.crop.toLowerCase().includes('not a plant') || h.result.crop.toLowerCase().includes('not a crop');
          return (
          <div key={i} onClick={() => onSelect(h)}
            style={{ flexShrink: 0, width: 120, cursor: 'pointer', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <img src={h.imageUrl} alt="scan" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: noCropDetected ? '#6b7280' : (h.result.isHealthy ? '#16a34a' : '#dc2626'), marginBottom: 2 }}>
                <span>{noCropDetected ? '❓ Not Detected' : (h.result.isHealthy ? '✅ Healthy' : '⚠️ ' + (h.result.disease || 'Disease'))}</span>
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}><span>{noCropDetected ? 'Unknown' : h.result.crop}</span></div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CropHealthAI() {
  const [imageFile, setImageFile]   = useState(null);
  const [imageUrl, setImageUrl]     = useState(null);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [history, setHistory]       = useState(loadHistory);
  const [datasetStatus, setDatasetStatus] = useState('Checking...');

  const fileInputRef  = useRef();
  const videoRef      = useRef();
  const streamRef     = useRef(null);

  // ── Health check on mount ──
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setDatasetStatus(data.datasetStatus || 'Not found'))
      .catch(() => setDatasetStatus('API Offline'));

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    stopCamera();
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target.result);
      setResult(null);
      setError(null);
    };
    reader.onerror = () => setError("Failed to read selected image.");
    reader.readAsDataURL(file);
  };

  // ── Camera ──────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280 } });
      streamRef.current = stream;
      setCameraActive(true);
      setResult(null);
      setImageUrl(null);
    } catch (err) {
      setError('Camera access denied. Please allow camera permission and try again.');
    }
  };

  // Bind stream to video element when it renders
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    
    // Check if video is actually ready
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      setError("Camera stream not ready. Please wait a moment.");
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Failed to capture image from camera. Please try again.");
        return;
      }
      
      stopCamera();
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setImageFile(file);
      setImageUrl(dataUrl);
      setResult(null);
    }, 'image/jpeg', 0.9);
  };

  // ── Analyse ─────────────────────────────────────────────────────────────────
  const analyseImage = useCallback(async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { blob, dataUrl } = await compressImage(imageFile);
      setImageUrl(dataUrl); // Use compressed version for UI and history
      
      const formData   = new FormData();
      formData.append('image', blob, 'crop.jpg');
      
      const lang = localStorage.getItem('kisan_lang') || 'en';
      formData.append('language', lang);

      const res = await fetch(`${API_URL}/analyze-crop`, { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);

      // Save to history (now uses Data URL which persists and won't be revoked)
      const entry = { result: data, imageUrl: dataUrl, ts: Date.now() };
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Cannot reach the AI server. Make sure the Python backend is running on port 5001.');
      } else {
        setError(err.message || 'Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [imageFile, imageUrl, history]);

  const reset = () => {
    setImageFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
    stopCamera();
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg,#14532d 0%,#166534 60%,#15803d 100%)',
        borderRadius: 18, padding: '36px 28px', color: 'white', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 14px', borderRadius: 99 }}>
              🧪 AI-Powered · 38 Disease Classes
            </div>
            <div style={{ fontSize: 11, background: '#16a34a', display: 'inline-block', padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.3)' }}>
              📦 Gemini 1.5 Flash AI Active
            </div>

          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>
            🔬 Crop Health AI
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, maxWidth: 500, lineHeight: 1.7 }}>
            Upload or capture a photo of your crop leaf. Our AI instantly detects diseases and provides fertilizer, pesticide &amp; treatment recommendations in simple language.
          </p>
        </div>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 140, opacity: 0.06 }}>🌿</div>
      </div>

      {/* ── Action buttons ── */}
      {!imageUrl && !cameraActive && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }} className="action-grid">
          {/* Upload */}
          <button id="btn-upload-image"
            onClick={() => fileInputRef.current.click()}
            style={{
              background: 'white', border: '2px dashed #16a34a', borderRadius: 16,
              padding: '32px 20px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 12, cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#15803d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#16a34a'; }}>
            <div style={{ width: 64, height: 64, background: '#dcfce7', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#166534' }}>Upload Image</div>
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>Select a photo from your gallery or device</div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} id="file-input-crop" />

          {/* Camera */}
          <button id="btn-capture-image"
            onClick={startCamera}
            style={{
              background: 'white', border: '2px dashed #2563eb', borderRadius: 16,
              padding: '32px 20px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 12, cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#1d4ed8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#2563eb'; }}>
            <div style={{ width: 64, height: 64, background: '#dbeafe', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎥</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1e40af' }}>Capture Image</div>
            <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>Use your device camera for a live photo</div>
          </button>
        </div>
      )}

      {/* ── Camera view ── */}
      {cameraActive && (
        <div style={{ background: 'black', borderRadius: 16, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <button id="btn-stop-camera" onClick={stopCamera}
              style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
              ✕ Cancel
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', gap: 12 }}>
            <button id="btn-take-photo" onClick={captureFrame}
              style={{ background: 'white', color: '#166534', border: 'none', borderRadius: 99, padding: '14px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              📸 Take Photo
            </button>
          </div>
        </div>
      )}

      {/* ── Preview + Analyse ── */}
      {imageUrl && !cameraActive && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 20, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <img src={imageUrl} alt="Preview" style={{ width: 120, height: 100, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 4 }}>Image ready for analysis</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
                Image will be compressed for fast upload, even on slow networks.
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button id="btn-analyse-crop" onClick={analyseImage} disabled={loading}
                  style={{ background: loading ? '#9ca3af' : '#16a34a', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}>
                  {loading ? (
                    <>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                      <span>Analysing…</span>
                    </>
                  ) : (
                    <span>🔬 Analyse Crop</span>
                  )}
                </button>
                <button id="btn-reset-scan" onClick={reset} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 18px', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
                  ✕ Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#991b1b', fontSize: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14, animation: 'pulse 1.5s ease-in-out infinite' }}>🔬</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#374151', marginBottom: 6 }}>Analysing your crop…</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>AI is detecting disease patterns. Usually takes 2–4 seconds.</div>
          <div style={{ marginTop: 20, height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#16a34a', borderRadius: 99, animation: 'progress 3s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {result && imageUrl && !loading && (
        <ResultCard result={result} imageUrl={imageUrl} />
      )}

      {/* ── Tip box ── */}
      {!result && !loading && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '16px 20px', marginTop: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e', marginBottom: 8 }}>💡 Tips for best results</div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, color: '#78350f', lineHeight: 1.9 }}>
            <li>Photograph the leaf clearly — avoid blurry or dark photos</li>
            <li>Make sure the diseased area fills most of the frame</li>
            <li>Use natural daylight for better colour accuracy</li>
            <li>Supported crops: Tomato, Potato, Maize, Apple, Grape, Pepper, Peach & more</li>
          </ul>
        </div>
      )}

      {/* ── History ── */}
      <HistoryPanel
        history={history}
        onSelect={(h) => { setResult(h.result); setImageUrl(h.imageUrl); setImageFile(null); setError(null); }}
        onClear={() => { setHistory([]); saveHistory([]); }}
      />

      {/* ── Offline notice ── */}
      <div style={{ marginTop: 28, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px' }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#475569', marginBottom: 6 }}>📶 Works on slow networks</div>
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
          Images are automatically compressed before sending — works well on 2G/3G rural networks.
          If no internet is available, check the Scan History for your previous results.
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes progress {
          0%   { width: 0%; margin-left: 0; }
          50%  { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
        @media (max-width: 640px) {
          .result-grid  { grid-template-columns: 1fr !important; }
          .action-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
