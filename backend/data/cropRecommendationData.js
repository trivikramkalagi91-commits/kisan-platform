// ─── Crop Recommendation Dataset ─────────────────────────────────────────────
// Derived from Crop_recommendation.csv (2200 samples, 22 crops)
// Each entry: per-crop mean & range for N, P, K, temperature, humidity, pH, rainfall

const CROP_STATS = {
  rice:         { N_mean:79.9,  P_mean:47.6,  K_mean:39.9,  temp_min:20.0, temp_max:26.9, temp_mean:23.7, humidity_min:80.1, humidity_max:85.0, humidity_mean:82.3, ph_min:5.01, ph_max:7.87, ph_mean:6.43, rainfall_min:182.6, rainfall_max:298.6, rainfall_mean:236.2 },
  maize:        { N_mean:77.8,  P_mean:48.4,  K_mean:19.8,  temp_min:18.0, temp_max:26.5, temp_mean:22.4, humidity_min:55.3, humidity_max:74.8, humidity_mean:65.1, ph_min:5.51, ph_max:7.00, ph_mean:6.25, rainfall_min:60.7,  rainfall_max:109.8, rainfall_mean:84.8  },
  chickpea:     { N_mean:40.1,  P_mean:67.8,  K_mean:79.9,  temp_min:17.0, temp_max:21.0, temp_mean:18.9, humidity_min:14.3, humidity_max:20.0, humidity_mean:16.9, ph_min:5.99, ph_max:8.87, ph_mean:7.34, rainfall_min:65.1,  rainfall_max:94.8,  rainfall_mean:80.1  },
  kidneybeans:  { N_mean:20.8,  P_mean:67.5,  K_mean:20.0,  temp_min:15.3, temp_max:24.9, temp_mean:20.1, humidity_min:18.1, humidity_max:25.0, humidity_mean:21.6, ph_min:5.50, ph_max:6.00, ph_mean:5.75, rainfall_min:60.3,  rainfall_max:149.7, rainfall_mean:105.9 },
  pigeonpeas:   { N_mean:20.7,  P_mean:67.7,  K_mean:20.3,  temp_min:18.3, temp_max:37.0, temp_mean:27.7, humidity_min:30.4, humidity_max:69.7, humidity_mean:48.1, ph_min:4.55, ph_max:7.45, ph_mean:5.79, rainfall_min:90.1,  rainfall_max:198.8, rainfall_mean:149.5 },
  mothbeans:    { N_mean:21.4,  P_mean:48.0,  K_mean:20.2,  temp_min:24.0, temp_max:32.0, temp_mean:28.2, humidity_min:40.0, humidity_max:65.0, humidity_mean:53.2, ph_min:3.50, ph_max:9.94, ph_mean:6.83, rainfall_min:30.9,  rainfall_max:74.4,  rainfall_mean:51.2  },
  mungbean:     { N_mean:21.0,  P_mean:47.3,  K_mean:19.9,  temp_min:27.0, temp_max:29.9, temp_mean:28.5, humidity_min:80.0, humidity_max:90.0, humidity_mean:85.5, ph_min:6.22, ph_max:7.20, ph_mean:6.72, rainfall_min:36.1,  rainfall_max:59.9,  rainfall_mean:48.4  },
  blackgram:    { N_mean:40.0,  P_mean:67.5,  K_mean:19.2,  temp_min:25.1, temp_max:34.9, temp_mean:30.0, humidity_min:60.1, humidity_max:70.0, humidity_mean:65.1, ph_min:6.50, ph_max:7.78, ph_mean:7.13, rainfall_min:60.4,  rainfall_max:74.9,  rainfall_mean:67.9  },
  lentil:       { N_mean:18.8,  P_mean:68.4,  K_mean:19.4,  temp_min:18.1, temp_max:29.9, temp_mean:24.5, humidity_min:60.1, humidity_max:69.9, humidity_mean:64.8, ph_min:5.92, ph_max:7.84, ph_mean:6.93, rainfall_min:35.0,  rainfall_max:54.9,  rainfall_mean:45.7  },
  pomegranate:  { N_mean:18.9,  P_mean:18.8,  K_mean:40.2,  temp_min:18.1, temp_max:25.0, temp_mean:21.8, humidity_min:85.1, humidity_max:95.0, humidity_mean:90.1, ph_min:5.56, ph_max:7.20, ph_mean:6.43, rainfall_min:102.5, rainfall_max:112.5, rainfall_mean:107.5 },
  banana:       { N_mean:100.2, P_mean:82.0,  K_mean:50.0,  temp_min:25.0, temp_max:29.9, temp_mean:27.4, humidity_min:75.0, humidity_max:85.0, humidity_mean:80.4, ph_min:5.51, ph_max:6.49, ph_mean:5.98, rainfall_min:90.1,  rainfall_max:119.8, rainfall_mean:104.6 },
  mango:        { N_mean:20.1,  P_mean:27.2,  K_mean:29.9,  temp_min:27.0, temp_max:36.0, temp_mean:31.2, humidity_min:45.0, humidity_max:55.0, humidity_mean:50.2, ph_min:4.51, ph_max:6.97, ph_mean:5.77, rainfall_min:89.3,  rainfall_max:100.8, rainfall_mean:94.7  },
  grapes:       { N_mean:23.2,  P_mean:132.5, K_mean:200.1, temp_min:8.8,  temp_max:41.9, temp_mean:23.8, humidity_min:80.0, humidity_max:84.0, humidity_mean:81.9, ph_min:5.51, ph_max:6.50, ph_mean:6.03, rainfall_min:65.0,  rainfall_max:74.9,  rainfall_mean:69.6  },
  watermelon:   { N_mean:99.4,  P_mean:17.0,  K_mean:50.2,  temp_min:24.0, temp_max:27.0, temp_mean:25.6, humidity_min:80.0, humidity_max:90.0, humidity_mean:85.2, ph_min:6.00, ph_max:6.96, ph_mean:6.50, rainfall_min:40.1,  rainfall_max:59.8,  rainfall_mean:50.8  },
  muskmelon:    { N_mean:100.3, P_mean:17.7,  K_mean:50.1,  temp_min:27.0, temp_max:29.9, temp_mean:28.7, humidity_min:90.0, humidity_max:95.0, humidity_mean:92.3, ph_min:6.00, ph_max:6.78, ph_mean:6.36, rainfall_min:20.2,  rainfall_max:29.9,  rainfall_mean:24.7  },
  apple:        { N_mean:20.8,  P_mean:134.2, K_mean:199.9, temp_min:21.0, temp_max:24.0, temp_mean:22.6, humidity_min:90.0, humidity_max:94.9, humidity_mean:92.3, ph_min:5.51, ph_max:6.50, ph_mean:5.93, rainfall_min:100.1, rainfall_max:125.0, rainfall_mean:112.7 },
  orange:       { N_mean:19.6,  P_mean:16.6,  K_mean:10.0,  temp_min:10.0, temp_max:34.9, temp_mean:22.8, humidity_min:90.0, humidity_max:95.0, humidity_mean:92.2, ph_min:6.01, ph_max:8.00, ph_mean:7.02, rainfall_min:100.2, rainfall_max:119.7, rainfall_mean:110.5 },
  papaya:       { N_mean:49.9,  P_mean:59.0,  K_mean:50.0,  temp_min:23.0, temp_max:43.7, temp_mean:33.7, humidity_min:90.0, humidity_max:94.9, humidity_mean:92.4, ph_min:6.50, ph_max:6.99, ph_mean:6.74, rainfall_min:40.4,  rainfall_max:248.9, rainfall_mean:142.6 },
  coconut:      { N_mean:22.0,  P_mean:16.9,  K_mean:30.6,  temp_min:25.0, temp_max:29.9, temp_mean:27.4, humidity_min:90.0, humidity_max:100.0, humidity_mean:94.8, ph_min:5.50, ph_max:6.47, ph_mean:5.98, rainfall_min:131.1, rainfall_max:225.6, rainfall_mean:175.7 },
  cotton:       { N_mean:117.8, P_mean:46.2,  K_mean:19.6,  temp_min:22.0, temp_max:26.0, temp_mean:24.0, humidity_min:75.0, humidity_max:84.9, humidity_mean:79.8, ph_min:5.80, ph_max:7.99, ph_mean:6.91, rainfall_min:60.7,  rainfall_max:99.9,  rainfall_mean:80.4  },
  jute:         { N_mean:78.4,  P_mean:46.9,  K_mean:40.0,  temp_min:23.1, temp_max:27.0, temp_mean:25.0, humidity_min:70.9, humidity_max:89.9, humidity_mean:79.6, ph_min:6.00, ph_max:7.49, ph_mean:6.73, rainfall_min:150.2, rainfall_max:199.8, rainfall_mean:174.8 },
  coffee:       { N_mean:101.2, P_mean:28.7,  K_mean:29.9,  temp_min:23.1, temp_max:27.9, temp_mean:25.5, humidity_min:50.0, humidity_max:69.9, humidity_mean:58.9, ph_min:6.02, ph_max:7.49, ph_mean:6.79, rainfall_min:115.2, rainfall_max:199.5, rainfall_mean:158.1 },
};

// Human-readable display names and Indian crop context
const CROP_META = {
  rice:         { displayName: 'Rice (Paddy)',    season: 'Kharif',       risk: 'low',    water_need: 'high',   duration_days: 120, investment_per_acre: 22000, profit_per_acre: 30000, market_price_per_quintal: 2100, expected_yield_quintal: 25, tips: 'MSP guaranteed. Ideal for high-rainfall zones. Transplant method gives best yield. Sow BPT 5204 or IR-64 varieties.' },
  maize:        { displayName: 'Maize (Corn)',    season: 'Kharif',       risk: 'low',    water_need: 'medium', duration_days: 90,  investment_per_acre: 14000, profit_per_acre: 36000, market_price_per_quintal: 2000, expected_yield_quintal: 25, tips: 'Huge poultry feed demand. Easy to grow. Multiple harvests possible. Suits moderate humidity areas.' },
  chickpea:     { displayName: 'Chickpea (Chana)', season: 'Rabi',        risk: 'low',    water_need: 'low',    duration_days: 100, investment_per_acre: 10000, profit_per_acre: 28000, market_price_per_quintal: 4800, expected_yield_quintal: 8,  tips: 'Excellent Rabi crop. Low water requirement. Fixes nitrogen. MSP supported. Prefers cool dry climate.' },
  kidneybeans:  { displayName: 'Kidney Beans (Rajma)', season: 'Rabi',    risk: 'low',    water_need: 'low',    duration_days: 80,  investment_per_acre: 12000, profit_per_acre: 25000, market_price_per_quintal: 6000, expected_yield_quintal: 6,  tips: 'Good export demand. Needs mild cool temperature. Irrigated Rabi crop in most regions.' },
  pigeonpeas:   { displayName: 'Pigeon Peas (Tur Dal)', season: 'Kharif', risk: 'low',    water_need: 'low',    duration_days: 150, investment_per_acre: 9000,  profit_per_acre: 24000, market_price_per_quintal: 6200, expected_yield_quintal: 5,  tips: 'MSP supported. Drought-tolerant pulse. Long duration crop. Intercrop with sorghum for better income.' },
  mothbeans:    { displayName: 'Moth Beans',      season: 'Kharif',       risk: 'low',    water_need: 'low',    duration_days: 70,  investment_per_acre: 6000,  profit_per_acre: 16000, market_price_per_quintal: 4500, expected_yield_quintal: 4,  tips: 'Highly drought-tolerant. Grows well in sandy arid soils. Low input cost. Good for Rajasthan and dry Deccan.' },
  mungbean:     { displayName: 'Mung Bean (Green Gram)', season: 'Kharif', risk: 'low',   water_need: 'medium', duration_days: 65,  investment_per_acre: 8000,  profit_per_acre: 20000, market_price_per_quintal: 7000, expected_yield_quintal: 4,  tips: 'Short duration crop. High market value. Suits humid warm areas. Good summer/Kharif crop.' },
  blackgram:    { displayName: 'Black Gram (Urad Dal)', season: 'Kharif', risk: 'low',    water_need: 'medium', duration_days: 70,  investment_per_acre: 8000,  profit_per_acre: 22000, market_price_per_quintal: 6500, expected_yield_quintal: 5,  tips: 'High demand in India. Grows in warm humid conditions. MSP available. Ideal after rice in crop rotation.' },
  lentil:       { displayName: 'Lentil (Masoor Dal)', season: 'Rabi',     risk: 'low',    water_need: 'low',    duration_days: 110, investment_per_acre: 9000,  profit_per_acre: 20000, market_price_per_quintal: 5500, expected_yield_quintal: 5,  tips: 'Cool dry Rabi crop. Low rainfall requirement. MSP support available. Major crop in MP, UP, Bihar.' },
  pomegranate:  { displayName: 'Pomegranate',     season: 'Year round',   risk: 'medium', water_need: 'medium', duration_days: 270, investment_per_acre: 60000, profit_per_acre: 120000, market_price_per_quintal: 8000, expected_yield_quintal: 25, tips: 'High value horticulture. Drip irrigation essential. Export quality fetches premium. Maharashtra and Karnataka top producers.' },
  banana:       { displayName: 'Banana',          season: 'Year round',   risk: 'medium', water_need: 'high',   duration_days: 300, investment_per_acre: 50000, profit_per_acre: 100000, market_price_per_quintal: 2000, expected_yield_quintal: 200, tips: 'High yield crop. Needs warm humid climate. Drip irrigation boosts profit. Grand Naine variety is most popular.' },
  mango:        { displayName: 'Mango',           season: 'Summer',       risk: 'medium', water_need: 'low',    duration_days: 365, investment_per_acre: 40000, profit_per_acre: 80000, market_price_per_quintal: 5000, expected_yield_quintal: 30, tips: 'High profit once established. Long-term investment. Alphonso, Kesar, Dasheri command export prices.' },
  grapes:       { displayName: 'Grapes',          season: 'Year round',   risk: 'high',   water_need: 'medium', duration_days: 365, investment_per_acre: 150000, profit_per_acre: 250000, market_price_per_quintal: 4000, expected_yield_quintal: 100, tips: 'Very high profit potential. Drip irrigation essential. Nashik, Sangli are top grape districts. Export quality adds 50% premium.' },
  watermelon:   { displayName: 'Watermelon',      season: 'Summer',       risk: 'medium', water_need: 'medium', duration_days: 80,  investment_per_acre: 20000, profit_per_acre: 60000, market_price_per_quintal: 1500, expected_yield_quintal: 80, tips: 'Summer cash crop. Short duration. Sandy loam soils ideal. Good near urban markets.' },
  muskmelon:    { displayName: 'Muskmelon',       season: 'Summer',       risk: 'medium', water_need: 'low',    duration_days: 75,  investment_per_acre: 15000, profit_per_acre: 40000, market_price_per_quintal: 1800, expected_yield_quintal: 60, tips: 'Low water requirement. Dry warm climate ideal. Popular in Rajasthan and UP river belts.' },
  apple:        { displayName: 'Apple',           season: 'Summer',       risk: 'high',   water_need: 'medium', duration_days: 365, investment_per_acre: 120000, profit_per_acre: 200000, market_price_per_quintal: 8000, expected_yield_quintal: 40, tips: 'Limited to hilly cool regions. Himachal Pradesh, J&K, Uttarakhand are ideal. Long-term high-value investment.' },
  orange:       { displayName: 'Orange (Nagpur)', season: 'Year round',   risk: 'medium', water_need: 'medium', duration_days: 365, investment_per_acre: 50000, profit_per_acre: 90000, market_price_per_quintal: 3000, expected_yield_quintal: 50, tips: 'Nagpur oranges are internationally famous. Semi-arid with irrigation works best. Drip irrigation saves water.' },
  papaya:       { displayName: 'Papaya',          season: 'Year round',   risk: 'medium', water_need: 'medium', duration_days: 270, investment_per_acre: 35000, profit_per_acre: 80000, market_price_per_quintal: 1500, expected_yield_quintal: 120, tips: 'Fast-growing high-yield crop. Warm climate. Red Lady variety is popular. Good near processing units.' },
  coconut:      { displayName: 'Coconut',         season: 'Year round',   risk: 'low',    water_need: 'high',   duration_days: 365, investment_per_acre: 30000, profit_per_acre: 60000, market_price_per_quintal: 1200, expected_yield_quintal: 80, tips: 'Coastal and humid tropical areas ideal. Kerala, Karnataka coastal belt. Long-term steady income crop.' },
  cotton:       { displayName: 'Cotton',          season: 'Kharif',       risk: 'medium', water_need: 'medium', duration_days: 150, investment_per_acre: 28000, profit_per_acre: 40000, market_price_per_quintal: 6000, expected_yield_quintal: 8,  tips: 'Black cotton soil preferred. BT cotton reduces pest losses. APMC markets give fair price. MSP supported.' },
  jute:         { displayName: 'Jute',            season: 'Kharif',       risk: 'low',    water_need: 'high',   duration_days: 120, investment_per_acre: 12000, profit_per_acre: 24000, market_price_per_quintal: 3500, expected_yield_quintal: 10, tips: 'High rainfall zones in West Bengal, Bihar, Assam. MSP supported. Eco-friendly fibre with growing demand.' },
  coffee:       { displayName: 'Coffee',          season: 'Year round',   risk: 'high',   water_need: 'medium', duration_days: 365, investment_per_acre: 80000, profit_per_acre: 150000, market_price_per_quintal: 18000, expected_yield_quintal: 10, tips: 'High-altitude Western Ghats ideal. Coorg, Chikmagalur, Nilgiris. Estate crop with export market. Shade-grown adds premium.' },
};

// ─── Location → climate profile mapping ──────────────────────────────────────
// Maps Indian states/regions to approximate climate parameters
const LOCATION_CLIMATE = {
  // Karnataka
  'karnataka-coastal':  { temp: 27, humidity: 82, rainfall: 250 },
  'karnataka-malnad':   { temp: 24, humidity: 85, rainfall: 220 },
  'karnataka-north':    { temp: 28, humidity: 55, rainfall: 70  },
  'karnataka-south':    { temp: 24, humidity: 70, rainfall: 90  },
  'karnataka-default':  { temp: 26, humidity: 68, rainfall: 100 },

  // Maharashtra
  'maharashtra-vidarbha': { temp: 30, humidity: 60, rainfall: 90  },
  'maharashtra-nashik':   { temp: 24, humidity: 65, rainfall: 80  },
  'maharashtra-konkan':   { temp: 28, humidity: 85, rainfall: 200 },
  'maharashtra-default':  { temp: 27, humidity: 65, rainfall: 100 },

  // Punjab, Haryana
  'punjab-default':     { temp: 22, humidity: 60, rainfall: 75  },
  'haryana-default':    { temp: 23, humidity: 58, rainfall: 65  },

  // UP, Bihar
  'up-default':         { temp: 25, humidity: 70, rainfall: 95  },
  'bihar-default':      { temp: 26, humidity: 75, rainfall: 120 },

  // West Bengal, Assam
  'wb-default':         { temp: 26, humidity: 82, rainfall: 180 },
  'assam-default':      { temp: 25, humidity: 85, rainfall: 200 },

  // Andhra Pradesh, Telangana
  'ap-default':         { temp: 29, humidity: 68, rainfall: 95  },
  'telangana-default':  { temp: 28, humidity: 65, rainfall: 88  },

  // Tamil Nadu
  'tn-coastal':         { temp: 29, humidity: 80, rainfall: 120 },
  'tn-default':         { temp: 28, humidity: 72, rainfall: 95  },

  // Kerala
  'kerala-default':     { temp: 27, humidity: 90, rainfall: 220 },

  // Rajasthan
  'rajasthan-default':  { temp: 30, humidity: 35, rainfall: 40  },

  // MP, Chhattisgarh
  'mp-default':         { temp: 26, humidity: 65, rainfall: 100 },

  // Gujarat
  'gujarat-default':    { temp: 28, humidity: 60, rainfall: 70  },

  // Himachal, J&K, Uttarakhand
  'hill-default':       { temp: 16, humidity: 70, rainfall: 110 },

  'default':            { temp: 26, humidity: 65, rainfall: 100 },
};

// Map state+district names to climate keys
function getClimateKey(state, district) {
  const s = (state || '').toLowerCase();
  const d = (district || '').toLowerCase();

  if (s.includes('karnataka')) {
    if (['dakshina kannada', 'udupi', 'uttara kannada'].some(k => d.includes(k))) return 'karnataka-coastal';
    if (['chikmagalur', 'kodagu', 'hassan', 'shivamogga'].some(k => d.includes(k))) return 'karnataka-malnad';
    if (['bidar', 'kalaburagi', 'yadgir', 'raichur', 'koppal', 'bellary', 'vijayapura'].some(k => d.includes(k))) return 'karnataka-north';
    return 'karnataka-south';
  }
  if (s.includes('maharashtra')) {
    if (['nagpur', 'amravati', 'wardha', 'yavatmal'].some(k => d.includes(k))) return 'maharashtra-vidarbha';
    if (['nashik', 'pune', 'ahmednagar'].some(k => d.includes(k))) return 'maharashtra-nashik';
    if (['raigad', 'sindhudurg', 'ratnagiri'].some(k => d.includes(k))) return 'maharashtra-konkan';
    return 'maharashtra-default';
  }
  if (s.includes('punjab')) return 'punjab-default';
  if (s.includes('haryana')) return 'haryana-default';
  if (s.includes('uttar pradesh') || s.includes('up')) return 'up-default';
  if (s.includes('bihar')) return 'bihar-default';
  if (s.includes('west bengal')) return 'wb-default';
  if (s.includes('assam')) return 'assam-default';
  if (s.includes('andhra pradesh') || s.includes('andhra')) return 'ap-default';
  if (s.includes('telangana')) return 'telangana-default';
  if (s.includes('tamil nadu')) return d.includes('chennai') || d.includes('nagapattinam') ? 'tn-coastal' : 'tn-default';
  if (s.includes('kerala')) return 'kerala-default';
  if (s.includes('rajasthan')) return 'rajasthan-default';
  if (s.includes('madhya pradesh') || s.includes('chhattisgarh')) return 'mp-default';
  if (s.includes('gujarat')) return 'gujarat-default';
  if (s.includes('himachal') || s.includes('jammu') || s.includes('uttarakhand')) return 'hill-default';
  return 'default';
}

/**
 * Score how well a crop matches the given climate/location.
 * Returns 0–100 (higher = better match).
 */
function scoreCropForLocation(cropKey, climateParams) {
  const stats = CROP_STATS[cropKey];
  if (!stats) return 0;

  const { temp, humidity, rainfall } = climateParams;
  let score = 100;

  // Temperature penalty (out-of-range = -30 max)
  if (temp < stats.temp_min) score -= Math.min(30, (stats.temp_min - temp) * 3);
  if (temp > stats.temp_max) score -= Math.min(30, (temp - stats.temp_max) * 3);

  // Humidity penalty (out-of-range = -25 max)
  if (humidity < stats.humidity_min) score -= Math.min(25, (stats.humidity_min - humidity) * 0.8);
  if (humidity > stats.humidity_max) score -= Math.min(25, (humidity - stats.humidity_max) * 0.8);

  // Rainfall penalty (out-of-range = -25 max)
  if (rainfall < stats.rainfall_min) score -= Math.min(25, (stats.rainfall_min - rainfall) * 0.3);
  if (rainfall > stats.rainfall_max) score -= Math.min(25, (rainfall - stats.rainfall_max) * 0.3);

  return Math.max(0, Math.round(score));
}

/**
 * Get top crop recommendations based on location climate + soil/water filters.
 * @param {string} state
 * @param {string} district
 * @param {object} overrideClimate - optional { temp, humidity, rainfall } from GPS/weather
 * @param {string} waterAvailability - 'high' | 'medium' | 'low'
 * @param {string} season - 'Kharif' | 'Rabi' | ''
 * @param {number} landAcres
 * @returns {Array} sorted recommendations
 */
function getLocationBasedRecommendations(state, district, overrideClimate, waterAvailability, season, landAcres) {
  const climateKey = getClimateKey(state, district);
  const climate = overrideClimate || LOCATION_CLIMATE[climateKey] || LOCATION_CLIMATE['default'];

  const results = Object.entries(CROP_STATS).map(([cropKey, stats]) => {
    const meta = CROP_META[cropKey];
    const locationScore = scoreCropForLocation(cropKey, climate);

    // Water availability filter
    if (waterAvailability === 'low' && meta.water_need === 'high') return null;
    if (waterAvailability === 'high' && meta.water_need === 'low') {
      // Don't exclude, but slightly deprioritize (irrigation capacity being wasted)
    }

    // Season filter
    if (season && season !== '' &&
        !meta.season.toLowerCase().includes(season.toLowerCase()) &&
        meta.season !== 'Year round' && meta.season !== 'Summer') {
      return null;
    }

    const acres = landAcres || 1;
    const total_investment = Math.round(meta.investment_per_acre * acres);
    const total_revenue = Math.round(meta.expected_yield_quintal * meta.market_price_per_quintal * acres);
    const expected_profit = Math.round(meta.profit_per_acre * acres);

    // Composite sort score: location match (weighted 60%) + profit (weighted 40%)
    const normalizedProfit = meta.profit_per_acre / 10000; // normalize to ~0-25
    const sortScore = (locationScore * 0.6) + (normalizedProfit * 0.4);

    return {
      crop: meta.displayName,
      cropKey,
      season: meta.season,
      soil: 'See soil data',
      investment_per_acre: meta.investment_per_acre,
      expected_yield_quintal: meta.expected_yield_quintal,
      market_price_per_quintal: meta.market_price_per_quintal,
      profit_per_acre: meta.profit_per_acre,
      risk: meta.risk,
      water_need: meta.water_need,
      duration_days: meta.duration_days,
      tips: meta.tips,
      total_investment,
      total_revenue,
      expected_profit,
      location_score: locationScore,
      location_match_note: buildMatchNote(cropKey, climate, locationScore),
      climate_used: { ...climate, source: overrideClimate ? 'GPS/detected' : `region profile (${climateKey})` },
      _sort_score: sortScore,
    };
  }).filter(Boolean);

  return results
    .sort((a, b) => b._sort_score - a._sort_score)
    .map(({ _sort_score, ...rest }) => rest);
}

function buildMatchNote(cropKey, climate, score) {
  const stats = CROP_STATS[cropKey];
  const notes = [];
  if (score >= 80) notes.push('Excellent climate match');
  else if (score >= 60) notes.push('Good climate match');
  else if (score >= 40) notes.push('Moderate climate match');
  else notes.push('Sub-optimal climate — use with caution');

  if (climate.rainfall >= stats.rainfall_min && climate.rainfall <= stats.rainfall_max) {
    notes.push('✓ Rainfall suitable');
  } else if (climate.rainfall < stats.rainfall_min) {
    notes.push('⚠ Needs more rainfall/irrigation');
  } else {
    notes.push('⚠ High rainfall area — drainage needed');
  }

  return notes.join(' · ');
}

module.exports = { getLocationBasedRecommendations, LOCATION_CLIMATE, getClimateKey, CROP_STATS, CROP_META };
