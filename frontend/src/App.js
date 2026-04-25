import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CropPrices from './pages/CropPrices';
import Schemes from './pages/Schemes';
import Labour from './pages/Labour';
import Marketplace from './pages/Marketplace';
import Barter from './pages/Barter';
import CropAdvisor from './pages/CropAdvisor';
import FearCrusher from './pages/FearCrusher';
import Videos from './pages/Videos';
import Finance from './pages/Finance';
import BusinessHub from './pages/BusinessHub';
import SmartIrrigation from './pages/SmartIrrigation';
import Subsidy from './pages/Subsidy';
import CropHealthAI from './pages/CropHealthAI';
import UserGuide from './pages/UserGuide';
import CropBuyers from './pages/CropBuyers';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prices" element={<CropPrices />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/labour" element={<Labour />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/barter" element={<Barter />} />
          <Route path="/advisor" element={<CropAdvisor />} />
          <Route path="/fear" element={<FearCrusher />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/business" element={<BusinessHub />} />
          <Route path="/irrigation" element={<SmartIrrigation />} />
          <Route path="/subsidy" element={<Subsidy />} />
          <Route path="/crop-health" element={<CropHealthAI />} />
          <Route path="/guide" element={<UserGuide />} />
          <Route path="/buyers" element={<CropBuyers />} />
        </Routes>
      </main>
      <footer style={{ textAlign: 'center', padding: '24px 16px', color: '#9ca3af', fontSize: 13, borderTop: '1px solid #e5e7eb', background: 'white', marginTop: 40 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🌾</div>
        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Kisan Platform</div>
        <div>Made with care for Indian farmers · Free forever · No commission</div>
        <div style={{ marginTop: 8 }}>Data source: AgMarknet, Government of India</div>
      </footer>
    </BrowserRouter>
  );
}
