const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const {
  getLocationData, getStatePrimaryCrops,
  getAllStates, getAllDistricts,
  STATE_DEFAULTS, DISTRICT_DATA, normalize,
} = require('../data/indiaAgriData');

// ─── IN-MEMORY CACHE ─────────────────────────────────────────────────────────
const cache = new Map();
function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttlMs) return Promise.resolve(hit.data);
  return Promise.resolve(fn()).then(data => {
    cache.set(key, { data, ts: Date.now() });
    return data;
  });
}

// ─── CROP RULES — 30 crops, all major Indian categories ─────────────────────
// soils: match against soil field, climates: match against climate field
// Soil values in DB: 'Alluvial','Black Cotton','Red Loam','Red Sandy','Sandy Loam',
//   'Sandy','Laterite','Mountain Loam','Mixed Red','Red Laterite'
const CROP_RULES = {
  'Paddy':      { soils:['Alluvial','Clay loam','Red Laterite','Laterite'],            climates:['Tropical','Humid'],                       min_rain:1000,max_temp:38,season:'Kharif',       dur:120, inv:22000, yld:22,  msp:2183  },
  'Wheat':      { soils:['Alluvial','Sandy Loam'],                                     climates:['Continental','Semi-arid','Temperate'],     min_rain:350, max_temp:30,season:'Rabi',         dur:120, inv:16000, yld:18,  msp:2275  },
  'Maize':      { soils:['Sandy Loam','Red Loam','Alluvial','Mixed Red'],              climates:['Tropical','Semi-arid','Temperate','Humid'],min_rain:500, max_temp:42,season:'Kharif',       dur:90,  inv:14000, yld:25,  msp:2090  },
  'Cotton':     { soils:['Black Cotton'],                                              climates:['Tropical','Semi-arid'],                   min_rain:500, max_temp:44,season:'Kharif',       dur:180, inv:28000, yld:8,   msp:6620  },
  'Soybean':    { soils:['Black Cotton','Sandy Loam','Red Laterite','Mixed Red'],      climates:['Tropical','Semi-arid'],                   min_rain:600, max_temp:40,season:'Kharif',       dur:95,  inv:10000, yld:12,  msp:4600  },
  'Groundnut':  { soils:['Sandy Loam','Red Sandy','Sandy','Red Loam'],                 climates:['Semi-arid','Tropical'],                   min_rain:500, max_temp:42,season:'Kharif',       dur:110, inv:18000, yld:15,  msp:6377  },
  'Mustard':    { soils:['Alluvial','Sandy Loam','Sandy'],                             climates:['Continental','Semi-arid','Temperate'],     min_rain:300, max_temp:32,season:'Rabi',         dur:90,  inv:10000, yld:10,  msp:5650  },
  'Sunflower':  { soils:['Sandy Loam','Black Cotton','Alluvial'],                      climates:['Semi-arid','Tropical'],                   min_rain:400, max_temp:40,season:'Rabi/Kharif',  dur:90,  inv:12000, yld:10,  msp:6760  },
  'Tomato':     { soils:['Red Loam','Sandy Loam','Mixed Red','Alluvial'],              climates:['Tropical','Semi-arid','Temperate'],        min_rain:600, max_temp:35,season:'Year round',   dur:90,  inv:35000, yld:120, msp:0     },
  'Onion':      { soils:['Sandy Loam','Alluvial','Mixed Red','Black Cotton'],          climates:['Semi-arid','Tropical'],                   min_rain:500, max_temp:38,season:'Rabi/Kharif',  dur:110, inv:25000, yld:80,  msp:0     },
  'Potato':     { soils:['Sandy Loam','Alluvial','Mountain Loam'],                     climates:['Continental','Semi-arid','Temperate'],     min_rain:400, max_temp:25,season:'Rabi',         dur:90,  inv:30000, yld:100, msp:0     },
  'Chilli':     { soils:['Sandy Loam','Red Loam','Mixed Red'],                         climates:['Tropical','Semi-arid'],                   min_rain:600, max_temp:40,season:'Kharif',       dur:150, inv:30000, yld:18,  msp:0     },
  'Turmeric':   { soils:['Alluvial','Laterite','Red Loam'],                            climates:['Tropical','Humid'],                       min_rain:1000,max_temp:35,season:'Kharif',       dur:270, inv:40000, yld:30,  msp:0     },
  'Ginger':     { soils:['Sandy Loam','Laterite','Mountain Loam','Red Loam'],          climates:['Tropical','Humid','Temperate'],            min_rain:1200,max_temp:32,season:'Kharif',       dur:240, inv:45000, yld:20,  msp:0     },
  'Banana':     { soils:['Alluvial','Laterite','Sandy Loam'],                          climates:['Tropical','Humid'],                       min_rain:800, max_temp:36,season:'Year round',   dur:365, inv:60000, yld:200, msp:0     },
  'Coconut':    { soils:['Sandy Loam','Laterite','Sandy'],                             climates:['Tropical','Humid'],                       min_rain:1000,max_temp:35,season:'Year round',   dur:365, inv:50000, yld:0,   msp:0     },
  'Sugarcane':  { soils:['Alluvial','Sandy Loam','Red Sandy'],                         climates:['Tropical','Semi-arid'],                   min_rain:700, max_temp:40,season:'Year round',   dur:365, inv:40000, yld:600, msp:340   },
  'Toor Dal':   { soils:['Black Cotton','Red Loam','Sandy Loam','Red Sandy'],          climates:['Semi-arid','Tropical'],                   min_rain:500, max_temp:42,season:'Kharif',       dur:180, inv:12000, yld:8,   msp:7550  },
  'Chana':      { soils:['Black Cotton','Sandy Loam','Alluvial'],                      climates:['Semi-arid','Continental'],                min_rain:300, max_temp:35,season:'Rabi',         dur:100, inv:10000, yld:10,  msp:5440  },
  'Moong':      { soils:['Sandy Loam','Red Sandy','Alluvial'],                         climates:['Semi-arid','Tropical'],                   min_rain:400, max_temp:42,season:'Kharif/Rabi',  dur:70,  inv:8000,  yld:6,   msp:8558  },
  'Jowar':      { soils:['Black Cotton','Red Loam','Sandy Loam','Red Sandy'],          climates:['Semi-arid','Arid'],                       min_rain:300, max_temp:44,season:'Kharif',       dur:100, inv:8000,  yld:12,  msp:3371  },
  'Bajra':      { soils:['Sandy','Sandy Loam','Red Sandy'],                            climates:['Arid','Semi-arid'],                       min_rain:200, max_temp:46,season:'Kharif',       dur:80,  inv:6000,  yld:14,  msp:2625  },
  'Ragi':       { soils:['Red Sandy','Sandy Loam','Laterite','Red Loam'],              climates:['Semi-arid','Tropical'],                   min_rain:500, max_temp:38,season:'Kharif',       dur:110, inv:8000,  yld:14,  msp:4290  },
  'Apple':      { soils:['Mountain Loam','Sandy Loam'],                                climates:['Temperate','Alpine'],                     min_rain:800, max_temp:22,season:'Year round',   dur:365, inv:80000, yld:150, msp:0     },
  'Cardamom':   { soils:['Laterite'],                                                  climates:['Humid'],                                  min_rain:2000,max_temp:28,season:'Year round',   dur:365, inv:100000,yld:5,   msp:0     },
  'Black Pepper':{ soils:['Laterite'],                                                 climates:['Humid','Tropical'],                       min_rain:2000,max_temp:35,season:'Year round',   dur:365, inv:80000, yld:3,   msp:0     },
  'Cumin':      { soils:['Sandy','Sandy Loam'],                                        climates:['Arid','Semi-arid'],                       min_rain:200, max_temp:38,season:'Rabi',         dur:100, inv:15000, yld:6,   msp:0     },
  'Tea':        { soils:['Laterite','Mountain Loam','Alluvial'],                       climates:['Humid','Temperate'],                      min_rain:1500,max_temp:30,season:'Year round',   dur:365, inv:150000,yld:0,   msp:0     },
  'Jute':       { soils:['Alluvial'],                                                  climates:['Humid','Tropical'],                       min_rain:1500,max_temp:38,season:'Kharif',       dur:120, inv:15000, yld:20,  msp:0     },
  'Rubber':     { soils:['Laterite'],                                                  climates:['Humid'],                                  min_rain:2000,max_temp:34,season:'Year round',   dur:365, inv:120000,yld:0,   msp:0     },
};

// ─── SOIL COMPATIBILITY TABLE ─────────────────────────────────────────────────
// Maps real soil values from DB to which CROP_RULES.soils they satisfy
const SOIL_COMPAT = {
  'Alluvial':      ['Alluvial','Sandy Loam','Clay loam'],
  'Black Cotton':  ['Black Cotton','Clay loam'],
  'Red Loam':      ['Red Loam','Sandy Loam','Mixed Red'],
  'Red Sandy':     ['Red Sandy','Sandy Loam','Sandy'],
  'Sandy Loam':    ['Sandy Loam','Sandy','Alluvial'],
  'Sandy':         ['Sandy','Sandy Loam'],
  'Laterite':      ['Laterite','Red Loam'],
  'Mountain Loam': ['Mountain Loam','Sandy Loam','Alluvial'],
  'Mixed Red':     ['Mixed Red','Red Loam','Sandy Loam'],
  'Red Laterite':  ['Red Laterite','Laterite','Red Loam','Clay loam'],
};

function soilMatches(dbSoil, rulesoils) {
  const compatible = SOIL_COMPAT[dbSoil] || [dbSoil];
  return rulesoils.some(rs => compatible.includes(rs));
}

// ─── SCORE A CROP FOR A LOCATION ──────────────────────────────────────────────
function scoreCrop(cropName, rule, locData, livePrice) {
  let score = 0;
  const reasons = [];

  const soil    = locData?.soil    || 'Sandy Loam';
  const climate = locData?.climate || 'Tropical';
  const rain    = locData?.rainfall  || 800;
  const maxTemp = locData?.temp_max  || 38;

  // 1. Soil match (30 pts) — using compatibility table
  if (soilMatches(soil, rule.soils)) {
    score += 30;
    reasons.push(`${soil} soil suits this crop`);
  } else {
    // Partial: loam-family soft match
    const isLoamFamily = soil.includes('Loam') && rule.soils.some(s => s.includes('Loam'));
    if (isLoamFamily) { score += 12; reasons.push('Soil is partially suitable'); }
  }

  // 2. Climate match (25 pts)
  if (rule.climates.includes(climate)) {
    score += 25;
    reasons.push(`${climate} climate is ideal`);
  } else if (
    (climate === 'Humid'       && rule.climates.includes('Tropical')) ||
    (climate === 'Tropical'    && rule.climates.includes('Humid'))    ||
    (climate === 'Continental' && rule.climates.includes('Semi-arid'))
  ) {
    score += 16;
    reasons.push('Climate is compatible');
  }

  // 3. Rainfall adequacy (20 pts)
  if (rain >= rule.min_rain) {
    score += 20;
    reasons.push(`Rainfall ${rain}mm adequate (needs ${rule.min_rain}mm)`);
  } else if (rain >= rule.min_rain * 0.65) {
    score += 10;
    reasons.push(`Rainfall borderline — irrigation recommended`);
  } else if (rain >= rule.min_rain * 0.4) {
    score += 4;
    reasons.push(`Low rainfall — irrigation essential`);
  }

  // 4. Temperature fit (15 pts)
  if (maxTemp <= rule.max_temp)       score += 15;
  else if (maxTemp <= rule.max_temp+4) score += 8;
  else if (maxTemp <= rule.max_temp+8) score += 3;

  // 5. Market price / profit potential (10 pts)
  const price = livePrice || rule.msp || 1000;
  const roi   = rule.yld > 0 ? (price * rule.yld - rule.inv) / rule.inv : 0;
  if (roi > 1.5)     { score += 10; reasons.push(`Excellent ROI (${(roi*100).toFixed(0)}%)`); }
  else if (roi > 0.8)  { score += 7; reasons.push(`Good ROI (${(roi*100).toFixed(0)}%)`); }
  else if (roi > 0.3)  score += 4;
  else if (rule.msp > 0){ score += 3; reasons.push('Government MSP protects minimum price'); }

  // MSP safety bonus
  if (rule.msp > 0 && !reasons.some(r => r.includes('MSP'))) {
    reasons.push(`Govt MSP ₹${rule.msp.toLocaleString()}/qtl guarantees minimum price`);
  }

  // ── Risk calculation ──────────────────────────────────────────────────────
  let riskScore = 50;
  if (rule.msp > 0)               riskScore -= 15;  // MSP = safety net
  if (rain < rule.min_rain)        riskScore += 12;  // drought risk
  if (maxTemp > rule.max_temp + 4) riskScore += 10;  // heat stress
  if (rule.dur > 200)              riskScore += 8;   // long crop = more exposure
  if (score > 75)                  riskScore -= 8;   // high suitability = lower risk
  if (!soilMatches(soil, rule.soils)) riskScore += 8; // soil mismatch risk

  riskScore = Math.max(15, Math.min(88, riskScore));
  const riskLevel   = riskScore < 38 ? 'Low' : riskScore < 58 ? 'Medium' : 'High';
  const successRate = Math.min(94, Math.max(52, Math.round(score * 0.82 + 18)));
  const profit      = Math.max(0, Math.round(price * rule.yld - rule.inv));

  return {
    score,
    crop:                  cropName,
    suitability_score:     Math.min(100, score),
    district_success_rate: successRate,
    state_avg_profit:      profit,
    risk_level:            riskLevel,
    risk_score:            riskScore,
    season:                rule.season,
    duration_days:         rule.dur,
    investment_per_acre:   rule.inv,
    expected_yield_qtl:    rule.yld,
    market_price:          price,
    msp:                   rule.msp,
    reasons,
    profit_calculator: {
      investment_range: [rule.inv, Math.round(rule.inv * 1.4)],
      yield_range:      [Math.round(rule.yld * 0.7), Math.round(rule.yld * 1.3)],
      price_range:      [Math.round(price * 0.7),    Math.round(price * 1.4)],
    },
    stories:      SUCCESS_STORIES[cropName] || SUCCESS_STORIES['DEFAULT'],
    weekly_guide: GROWING_GUIDES[cropName]  || GROWING_GUIDES['DEFAULT'],
    videos: [
      { title:`${cropName} Farming Complete Guide`, channel:'DD Kisan',      duration:'24 min' },
      { title:`${cropName} Success Story`,          channel:'Krishi Jagran', duration:'18 min' },
      { title:`${cropName} Pest Management`,        channel:'ICAR',          duration:'15 min' },
    ],
  };
}

// ─── SUCCESS STORIES ─────────────────────────────────────────────────────────
const SUCCESS_STORIES = {
  'Tomato':     [{ name:'Manjunath Gowda', district:'Bangalore Rural',acres:2,  profit:'₹1.8 lakh',year:2024,quote:'First year I was scared to try hybrid variety. Now I earn more than my son in Bangalore!' },
                 { name:'Savita Patil',    district:'Raichur',        acres:1.5,profit:'₹95,000',  year:2024,quote:'Switched from cotton to tomato. Best decision of my farming life.' }],
  'Cotton':     [{ name:'Vijay Deshmukh', district:'Wardha',          acres:5,  profit:'₹2.5 lakh',year:2024,quote:'BT cotton changed everything. MSP gives peace of mind.' },
                 { name:'Rekha Pawar',    district:'Amravati',        acres:3,  profit:'₹1.2 lakh',year:2023,quote:'Joined FPO — got ₹200 more per quintal than selling alone.' }],
  'Chilli':     [{ name:'Basavaraj Reddy',district:'Dharwad',         acres:2,  profit:'₹2.2 lakh',year:2024,quote:'Took PMFBY insurance so I had nothing to fear. Good season!' },
                 { name:'Anitha Kulkarni',district:'Haveri',          acres:1,  profit:'₹1.1 lakh',year:2023,quote:'Byadagi variety is best for our area.' }],
  'Paddy':      [{ name:'Ramaiah Gowda',  district:'Raichur',         acres:3,  profit:'₹80,000',  year:2024,quote:'MSP procurement means I always get fair price.' },
                 { name:'Sunita Devi',    district:'Thanjavur',       acres:4,  profit:'₹1.1 lakh',year:2024,quote:'Ponni variety with SRI method saved water and boosted yield.' }],
  'Wheat':      [{ name:'Gurpreet Singh', district:'Ludhiana',        acres:5,  profit:'₹1.4 lakh',year:2024,quote:'HD 3086 with MSP — completely risk-free farming.' },
                 { name:'Ramsevak Yadav', district:'Varanasi',        acres:3,  profit:'₹75,000',  year:2023,quote:'Government procurement centre 5 km from my farm.' }],
  'Soybean':    [{ name:'Prakash Deshmukh',district:'Indore',         acres:4,  profit:'₹1.3 lakh',year:2024,quote:'Low input cost and it improves soil for next crop.' }],
  'Mustard':    [{ name:'Ramesh Sharma',  district:'Jaipur',          acres:4,  profit:'₹90,000',  year:2024,quote:'MSP and low input cost makes mustard the safest Rabi crop.' }],
  'Groundnut':  [{ name:'Mohan Reddy',    district:'Kurnool',         acres:3,  profit:'₹1.1 lakh',year:2024,quote:'Oil mills give direct farm gate price. Runner variety is best.' }],
  'Banana':     [{ name:'Ravi Kumar',     district:'Coimbatore',      acres:2,  profit:'₹1.6 lakh',year:2024,quote:'G9 tissue culture with drip — best returns I have ever had.' }],
  'Ginger':     [{ name:'Suresh Nair',    district:'Wayanad',         acres:1,  profit:'₹1.8 lakh',year:2024,quote:'Organic ginger gets premium price. KVK gave free planting material.' }],
  'Apple':      [{ name:'Vikram Thakur',  district:'Kullu',           acres:3,  profit:'₹4.5 lakh',year:2024,quote:'HPMC gives good procurement price. Red Delicious best for our altitude.' }],
  'Tea':        [{ name:'Bijoy Kalita',   district:'Jorhat',          acres:5,  profit:'₹2.2 lakh',year:2024,quote:'Tea Board gave me subsidy for replanting old bushes. Now yield is up 35%.' }],
  'Jute':       [{ name:'Arijit Mondal',  district:'Murshidabad',     acres:3,  profit:'₹75,000',  year:2024,quote:'Jute price has been good for 3 years. Low inputs, good return.' }],
  'Turmeric':   [{ name:'Venkatesh',      district:'Nizamabad',       acres:2,  profit:'₹1.4 lakh',year:2024,quote:'Nizamabad bulb variety fetches best price in APMC.' }],
  'Cardamom':   [{ name:'Rajan Pillai',   district:'Idukki',          acres:1,  profit:'₹2.8 lakh',year:2024,quote:'Cardamom prices crossed ₹1500/kg this year. Patience pays off.' }],
  'DEFAULT':    [{ name:'A local farmer', district:'Your district',   acres:2,  profit:'₹80,000',  year:2024,quote:'Starting with 1-2 acres to learn is the best approach. KVK gives free support.' }],
};

// ─── GROWING GUIDES ───────────────────────────────────────────────────────────
const GROWING_GUIDES = {
  'Tomato':  [{ week:'1-2', task:'Nursery',          detail:'Raised bed nursery. Sow hybrid seeds. Water twice daily. Shade net cover.' },
              { week:'3-4', task:'Transplanting',    detail:'Transplant 25-30 day seedlings. 60×45 cm spacing. Basal fertilizer. Install drip lines.' },
              { week:'5-7', task:'Early growth',     detail:'First weeding. Apply DAP. Watch for early blight. Spray mancozeb if needed.' },
              { week:'8-10',task:'Flowering',        detail:'Stake with bamboo. Apply potash. Spray micronutrients. Bees help pollination.' },
              { week:'11-13',task:'Fruit set',       detail:'Stop excess nitrogen. Maintain moisture. Fruit borer sticky traps.' },
              { week:'14-16',task:'Harvest',         detail:'Harvest when 30% red. Pick every 3-4 days. Grade fruits. Contact APMC.' }],
  'Cotton':  [{ week:'1-2', task:'Land prep',        detail:'Deep plowing. Apply FYM. Mark 90×60 cm. Neem cake soil treatment.' },
              { week:'3-4', task:'Sowing',           detail:'BT cotton after first rain. Seed treatment essential.' },
              { week:'5-8', task:'Early growth',     detail:'Thin to one per hill. Urea in two splits. Watch for aphids and whitefly.' },
              { week:'9-14',task:'Flowering',        detail:'Apply potash. Spray for bollworm if trap count high.' },
              { week:'15-20',task:'Boll development',detail:'Maintain soil moisture. Remove damaged bolls.' },
              { week:'22-28',task:'Harvest',         detail:'Pick white open bolls 3-4 times. Sell at MSP or APMC.' }],
  'Paddy':   [{ week:'1-2', task:'Nursery',          detail:'Prepare nursery bed. Sow pre-germinated seeds. Keep flooded.' },
              { week:'3-4', task:'Transplanting',    detail:'Transplant 25-day seedlings at 20×15 cm. Apply basal NPK.' },
              { week:'5-8', task:'Tillering',        detail:'Top dress with Urea. Control weeds. Maintain 5 cm water.' },
              { week:'9-12',task:'Panicle',          detail:'Apply potash. Watch for blast and BPH. Keep moist.' },
              { week:'13-15',task:'Grain filling',   detail:'Stop irrigation 10 days before harvest. Protect from birds.' },
              { week:'16-17',task:'Harvest',         detail:'Harvest when 80% golden. Dry to 14% moisture. Sell at MSP centre.' }],
  'Wheat':   [{ week:'1',  task:'Sowing',            detail:'Sow after Oct 25. HD 3086 or Sharbati variety. 100 kg seed/acre. Basal NPK.' },
              { week:'2-3',task:'First irrigation',  detail:'Crown root initiation at 21 days. Most critical irrigation.' },
              { week:'4-6',task:'Top dressing',      detail:'Apply Urea at tillering. Second irrigation at tillering.' },
              { week:'7-10',task:'Grain formation',  detail:'Third irrigation at jointing. Fourth at flowering.' },
              { week:'11-14',task:'Harvest',         detail:'Harvest when grains hard. Thresh and dry. Sell at MSP centre.' }],
  'DEFAULT': [{ week:'1-2', task:'Land & seed prep', detail:'Soil test, deep plowing, apply FYM. Select certified seeds.' },
              { week:'3-5', task:'Sowing',           detail:'Sow at recommended spacing. Apply basal fertilizer.' },
              { week:'6-10',task:'Crop growth',      detail:'Regular monitoring, weeding, top dressing, pest watch.' },
              { week:'11-14',task:'Harvest',         detail:'Harvest at right maturity. Grade produce. Sell at APMC or FPO.' }],
};

// ─── Fetch live market price from own prices API ──────────────────────────────
async function getLivePrice(commodity) {
  return cached(`price:${commodity}`, 10 * 60 * 1000, async () => {
    try {
      const r = await axios.get(
        `http://localhost:${process.env.PORT || 5000}/api/prices`,
        { params:{ commodity, limit:20 }, timeout:3000 }
      );
      const recs = r.data?.data;
      if (recs?.length > 0) {
        return Math.round(recs.reduce((s, r) => s + r.modal_price, 0) / recs.length);
      }
    } catch(e) { /* silent — use MSP fallback */ }
    return null;
  });
}

// ─── GET /api/fear/recommend ──────────────────────────────────────────────────
router.get('/recommend', async (req, res) => {
  const { state, district } = req.query;
  if (!state && !district) {
    return res.status(400).json({ error: 'state or district is required' });
  }

  const cacheKey = `rec:${normalize(state)}:${normalize(district)}`;

  try {
    const result = await cached(cacheKey, 5 * 60 * 1000, async () => {
      const locData = getLocationData(district, state);

      // Fetch live prices for top crops in parallel (best effort, 3s timeout)
      const cropList  = Object.keys(CROP_RULES);
      const priceResults = await Promise.allSettled(
        cropList.slice(0, 10).map(c => getLivePrice(c))
      );
      const priceMap = {};
      cropList.slice(0, 10).forEach((c, i) => {
        if (priceResults[i].status === 'fulfilled' && priceResults[i].value) {
          priceMap[c] = priceResults[i].value;
        }
      });

      // Score every crop and rank
      const scored = cropList
        .map(c => scoreCrop(c, CROP_RULES[c], locData, priceMap[c] || null))
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      return { locData, scored, priceMap };
    });

    res.json({
      success:             true,
      state,
      district,
      location_data:       result.locData,
      data_source:         result.locData.source,
      live_prices_fetched: Object.keys(result.priceMap || {}).length,
      recommended_crops:   result.scored,
    });
  } catch (err) {
    console.error('Fear recommend error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/fear/location-data ─────────────────────────────────────────────
router.get('/location-data', (req, res) => {
  const { state, district } = req.query;
  const data = getLocationData(district, state);
  res.json({
    success:  true,
    district, state,
    ...data,
    has_data: data.source !== 'default',
  });
});

// ─── GET /api/fear/states ────────────────────────────────────────────────────
router.get('/states', (req, res) => {
  // Build district map from actual DISTRICT_DATA
  // Group districts by matching against state default keys (best effort)
  const DISTRICT_MAP = {
    'Karnataka':          ['Raichur','Dharwad','Haveri','Vijayapura','Kalaburagi','Bangalore Rural','Kolar','Mysuru','Tumakuru','Shivamogga','Hassan','Chikkaballapur','Davangere','Mandya','Belagavi','Bidar','Chitradurga','Koppal','Ballari','Gadag','Bagalkot','Yadgir','Dakshina Kannada','Udupi','Uttara Kannada','Kodagu','Chamarajanagar','Ramanagara','Bengaluru Urban'],
    'Maharashtra':        ['Nashik','Pune','Nagpur','Amravati','Aurangabad','Solapur','Kolhapur','Sangli','Satara','Latur','Osmanabad','Nanded','Parbhani','Hingoli','Buldhana','Akola','Washim','Yavatmal','Wardha','Chandrapur','Gadchiroli','Gondia','Bhandara','Jalgaon','Dhule','Nandurbar','Raigad','Ratnagiri','Sindhudurg','Thane','Ahmednagar'],
    'Punjab':             ['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Sangrur','Moga','Ferozepur','Hoshiarpur','Rupnagar','Fatehgarh Sahib','Fazilka','Muktsar','Barnala','Tarn Taran','Gurdaspur','Pathankot','Kapurthala'],
    'Andhra Pradesh':     ['Guntur','Kurnool','Krishna','Kadapa','Anantapur','Chittoor','Nellore','Srikakulam','Vizianagaram','Visakhapatnam','East Godavari','West Godavari','Prakasam'],
    'Tamil Nadu':         ['Coimbatore','Salem','Madurai','Tiruchirappalli','Tirunelveli','Erode','Thanjavur','Tiruppur','Vellore','Krishnagiri','Dharmapuri','Theni','Dindigul','Virudhunagar','Ramanathapuram','Thoothukudi','Kanyakumari','Nilgiris','Nagapattinam','Tiruvarur','Namakkal','Karur','Ariyalur','Perambalur','Cuddalore','Villupuram','Tiruvannamalai','Kallakurichi','Ranipet','Tirupattur','Chengalpattu'],
    'Madhya Pradesh':     ['Indore','Bhopal','Ujjain','Gwalior','Jabalpur','Sagar','Rewa','Satna','Neemuch','Mandsaur','Ratlam','Chhindwara','Narmadapuram','Dhar','Khandwa','Khargone','Morena','Bhind','Jhabua','Vidisha','Raisen','Seoni','Balaghat','Mandla','Damoh','Panna','Chhatarpur','Tikamgarh','Shajapur','Dewas','Barwani','Alirajpur','Shivpuri','Guna','Ashoknagar','Agar Malwa','Burhanpur','Betul','Rajgarh','Sheopur','Datia','Niwari'],
    'Rajasthan':          ['Jaipur','Jodhpur','Udaipur','Kota','Ajmer','Alwar','Bikaner','Barmer','Jaisalmer','Nagaur','Pali','Sikar','Tonk','Sawai Madhopur','Bharatpur','Chittorgarh','Banswara','Dungarpur','Sirohi','Rajsamand','Bhilwara','Bundi','Baran','Jhalawar','Jhunjhunu','Churu','Hanumangarh','Ganganagar','Dausa','Jalore','Karauli','Dholpur','Pratapgarh'],
    'Gujarat':            ['Ahmedabad','Rajkot','Surat','Vadodara','Gandhinagar','Anand','Amreli','Junagadh','Kutch','Banaskantha','Patan','Mehsana','Kheda','Bharuch','Valsad','Navsari','Narmada','Tapi','Mahisagar','Aravalli','Gir Somnath','Morbi','Surendranagar','Devbhoomi Dwarka'],
    'Haryana':            ['Ambala','Karnal','Kurukshetra','Hisar','Rohtak','Sonipat','Sirsa','Fatehabad','Faridabad','Gurugram','Jhajjar','Rewari','Mahendragarh','Nuh','Palwal','Panipat','Kaithal','Jind','Bhiwani','Charkhi Dadri','Panchkula'],
    'Uttar Pradesh':      ['Lucknow','Agra','Prayagraj','Varanasi','Kanpur','Gorakhpur','Meerut','Muzaffarnagar','Mathura','Aligarh','Bareilly','Moradabad','Saharanpur','Jhansi','Banda','Sitapur','Hardoi','Gonda','Lakhimpur Kheri','Ayodhya','Azamgarh','Ballia','Jaunpur','Mirzapur','Sonbhadra','Unnao','Rae Bareli','Sultanpur','Barabanki','Pratapgarh','Kushinagar','Maharajganj','Basti','Deoria','Etawah','Mainpuri','Firozabad','Hamirpur','Mahoba','Lalitpur','Chitrakoot','Fatehpur','Kaushambi','Chandauli','Ghazipur','Mau','Ghaziabad','Gautam Buddha Nagar','Hapur','Rampur','Pilibhit','Shahjahanpur','Badaun','Balrampur','Bahraich','Shravasti','Amroha','Bijnor','Shamli'],
    'Telangana':          ['Hyderabad','Rangareddy','Warangal','Karimnagar','Nizamabad','Adilabad','Khammam','Nalgonda','Mahbubnagar','Sangareddy','Medak','Siddipet','Jagtial','Peddapalli','Suryapet','Mahabubabad','Jogulamba Gadwal','Wanaparthy','Nagarkurnool','Vikarabad','Mancherial','Asifabad','Nirmal','Kamareddy'],
    'Bihar':              ['Patna','Nalanda','Gaya','Muzaffarpur','Vaishali','Darbhanga','Bhagalpur','Samastipur','Rohtas','Saran','Sitamarhi','Madhubani','Supaul','Saharsa','Purnia','Katihar','Araria','Kishanganj','Jehanabad'],
    'West Bengal':        ['Kolkata','Howrah','Bardhaman','Murshidabad','Nadia','North 24 Parganas','South 24 Parganas','Birbhum','Bankura','Purulia','Jalpaiguri','Darjeeling','Cooch Behar','Alipurduar','Malda','Paschim Medinipur','Purba Medinipur','Hooghly','Paschim Burdwan','Jhargram','Uttar Dinajpur','Dakshin Dinajpur'],
    'Odisha':             ['Khordha','Cuttack','Puri','Balasore','Mayurbhanj','Sundargarh','Koraput','Ganjam','Kalahandi','Sambalpur','Bargarh','Bolangir','Dhenkanal','Angul','Jajpur','Kendrapara','Bhadrak','Keonjhar','Nuapada','Nabarangpur','Rayagada','Malkangiri'],
    'Kerala':             ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'],
    'Himachal Pradesh':   ['Shimla','Kullu','Mandi','Kangra','Solan','Sirmaur','Una','Bilaspur','Hamirpur','Chamba','Kinnaur','Lahaul And Spiti'],
    'Assam':              ['Kamrup','Kamrup Metropolitan','Dibrugarh','Jorhat','Nagaon','Barpeta','Cachar','Sonitpur','Darrang','Goalpara','Dhubri','Kokrajhar','Bongaigaon','Chirang','Dhemaji','Lakhimpur','Tinsukia','Morigaon','Nalbari','Baksa','Udalguri','Karbi Anglong','Dima Hasao','Hailakandi','Karimganj','Majuli','Sibsagar'],
    'Jharkhand':          ['Ranchi','Dhanbad','Jamshedpur','Bokaro','Hazaribagh','Giridih','Gumla','Lohardaga','West Singhbhum','East Singhbhum','Seraikela Kharsawan','Sahebganj','Pakur','Godda','Dumka','Deoghar','Jamtara','Chatra','Koderma','Simdega'],
    'Chhattisgarh':       ['Raipur','Bilaspur','Durg','Rajnandgaon','Raigarh','Korba','Janjgir Champa','Surguja','Bastar','Dantewada','Kanker'],
    'Uttarakhand':        ['Dehradun','Haridwar','Nainital','Udham Singh Nagar','Almora','Chamoli','Pauri Garhwal','Tehri Garhwal','Pithoragarh','Bageshwar','Champawat','Rudraprayag','Uttarkashi'],
    'Manipur':            ['Imphal West','Imphal East','Bishnupur','Thoubal','Churachandpur','Senapati','Tamenglong','Chandel','Ukhrul'],
    'Meghalaya':          ['Shillong','East Khasi Hills','West Khasi Hills','Ri Bhoi','East Jaintia Hills','West Jaintia Hills','East Garo Hills','West Garo Hills','South Garo Hills','North Garo Hills'],
    'Mizoram':            ['Aizawl','Lunglei','Champhai','Serchhip','Kolasib','Mamit','Lawngtlai','Siaha'],
    'Nagaland':           ['Kohima','Dimapur','Mokokchung','Wokha','Zunheboto','Tuensang','Mon','Phek','Kiphire','Longleng','Peren'],
    'Tripura':            ['West Tripura','East Tripura','North Tripura','South Tripura','Dhalai','Gomati','Khowai','Sepahijala','Unokoti'],
    'Sikkim':             ['East Sikkim','West Sikkim','North Sikkim','South Sikkim'],
    'Arunachal Pradesh':  ['Papum Pare','East Siang','West Siang','Upper Siang','Lohit','Changlang','Tirap','Tawang','West Kameng','East Kameng','Kurung Kumey','Subansiri'],
    'Goa':                ['North Goa','South Goa'],
    'Jammu And Kashmir':  ['Srinagar','Jammu','Anantnag','Baramulla','Budgam','Kupwara','Pulwama','Shopian','Kulgam','Ganderbal','Kathua','Udhampur','Reasi','Rajouri','Poonch','Doda','Ramban','Kishtwar'],
    'Ladakh':             ['Leh','Kargil'],
    'Delhi':              ['Delhi','New Delhi','North Delhi','South Delhi','East Delhi','West Delhi'],
  };

  res.json({ success: true, data: getAllStates(), districts: DISTRICT_MAP });
});

// ─── GET /api/fear/crops ─────────────────────────────────────────────────────
router.get('/crops', (req, res) => {
  res.json({ success: true, data: Object.keys(CROP_RULES) });
});

// ─── GET /api/fear/:crop — backward compatible ────────────────────────────────
router.get('/:crop', (req, res) => {
  const cropName = req.params.crop;
  const rule = CROP_RULES[cropName];
  if (!rule) {
    return res.json({ success: true, data: {
      crop: cropName, district_success_rate: 68, state_avg_profit: 50000,
      risk_level: 'Medium', risk_score: 50,
      stories:      SUCCESS_STORIES['DEFAULT'],
      weekly_guide: GROWING_GUIDES['DEFAULT'],
      profit_calculator: { investment_range:[15000,35000], yield_range:[10,40], price_range:[1000,5000] },
      videos: [{ title:`${cropName} Farming Guide`, channel:'DD Kisan', duration:'20 min' }],
    }});
  }
  const result = scoreCrop(cropName, rule, null, null);
  res.json({ success: true, data: result });
});

module.exports = router;