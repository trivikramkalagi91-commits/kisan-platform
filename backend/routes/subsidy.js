const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// ─── GOVERNMENT SUBSIDY SCHEMES — Verified 2025 Data ─────────────────────────
// Dedicated Subsidy module: equipment, input, seed, processing, storage subsidies
// Distinct from Schemes (income support, insurance) — focused on capital subsidies
// ─────────────────────────────────────────────────────────────────────────────

const SUBSIDIES = [
    {
        id: 'sub-drip-irrigation',
        name: 'Drip & Sprinkler Irrigation Subsidy',
        short_name: 'PMKSY-MI',
        type: 'central',
        category: 'irrigation',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['all'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 55,
        max_benefit_inr: 150000,
        description: 'Up to 55% subsidy on drip and sprinkler irrigation systems for small/marginal farmers (45% for others) under PMKSY Micro Irrigation Fund. Saves 40-70% water.',
        eligibility: {
            description: 'All farmers with own land or 7-year registered lease. Small/marginal farmers (up to 5 acres) get 55% subsidy. Others get 45%. State government adds additional 10-15% in most states.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'All crops supported',
        },
        documents: ['Aadhaar card', 'Land records (RTC/7-12 extract)', 'Bank passbook', 'Quotation from approved vendor', 'Caste certificate (for higher subsidy)'],
        apply_steps: [
            'Contact District Agriculture Officer (DAO) or Sub-Divisional Agriculture Officer',
            'Register on state agriculture portal (varies by state)',
            'Submit application with land records and approved vendor quotation',
            'Field inspection by agriculture officer — geo-tagged photo taken',
            'Install system from approved vendor after sanction letter',
            'Subsidy credited to bank after installation verification',
        ],
        apply_link: 'https://pmksy.gov.in',
        deadline: 'Rolling — most states open applications April–June and September–December',
        helpline: '1800-180-1551',
        last_updated: '2025-01',
        tags: ['drip', 'sprinkler', 'water saving', 'irrigation', 'PMKSY', '55%'],
    },
    {
        id: 'sub-farm-machinery',
        name: 'Farm Machinery & Equipment Subsidy',
        short_name: 'SMAM',
        type: 'central',
        category: 'mechanization',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal', 'sc_st', 'women'],
        states: ['all'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 50,
        max_benefit_inr: 500000,
        description: '40-50% subsidy on tractors, power tillers, harvesters, seed drills, rotavators, threshers and other farm machinery. SC/ST farmers and women get priority and higher subsidy.',
        eligibility: {
            description: 'All farmers. SC/ST farmers, women farmers, small/marginal farmers get priority. Cannot own the same equipment purchased under subsidy earlier. Equipment must be from approved manufacturer list on DBT portal.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large', 'sc_st', 'women'],
            crops: 'All crops',
        },
        documents: ['Aadhaar card', 'Land records', 'Bank passbook', 'Caste certificate (SC/ST farmers)', 'Quotation from approved manufacturer', 'Declaration of not owning same equipment'],
        apply_steps: [
            'Register at agrimachinery.nic.in (DBT Agricultural Machinery Portal)',
            'Select your state and choose equipment from the approved list',
            'Apply for subsidy and upload all documents',
            'Wait for approval — first-come-first-served, budget limited',
            'After sanction, purchase from approved dealer and upload invoice + photos',
            'Subsidy amount transferred directly to your bank account',
        ],
        apply_link: 'https://agrimachinery.nic.in',
        deadline: 'Annual budget — apply early April to June for best chance',
        helpline: '1800-180-1551',
        last_updated: '2025-01',
        tags: ['tractor', 'harvester', 'machinery', 'equipment', '50%', 'DBT'],
    },
    {
        id: 'sub-solar-pump',
        name: 'Solar Pump Subsidy (PM-KUSUM)',
        short_name: 'PM-KUSUM-C',
        type: 'central',
        category: 'solar',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['all'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 90,
        max_benefit_inr: 300000,
        description: '90% subsidy on solar pump sets — 30% Central + 30% State + 30% NABARD bank loan. Farmer pays only 10%. Replace diesel pumps and save ₹50,000/year in fuel costs.',
        eligibility: {
            description: 'All farmers with agricultural land and need for irrigation. Preference to farmers replacing diesel pumps.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'All crops',
        },
        documents: ['Aadhaar card', 'Land records', 'Bank passbook', 'Existing pump details'],
        apply_steps: ['Visit state DISCOM office', 'Register for PM-KUSUM Component C', 'Site inspection', 'Pay only 10% of pump cost yourself'],
        apply_link: 'https://mnre.gov.in',
        deadline: 'Ongoing till 2026',
        helpline: '1800-180-3333',
        last_updated: '2025-01',
        tags: ['solar', 'pump', '90%', 'PM-KUSUM'],
    },
    {
        id: 'sub-cold-storage',
        name: 'Cold Storage & Warehouse Subsidy',
        short_name: 'AIF + NHB',
        type: 'central',
        category: 'storage',
        crop_types: ['vegetables', 'fruits', 'flowers'],
        farmer_categories: ['small', 'marginal', 'large', 'fpo'],
        states: ['all'],
        benefit_type: 'mixed',
        subsidy_percent: 35,
        max_benefit_inr: 5000000,
        description: '35% capital subsidy on cold storage, pack houses, ripening chambers under NHB scheme. Also ₹2 crore at 3% interest under AIF.',
        eligibility: {
            description: 'Farmers, FPOs, cooperatives for post-harvest infrastructure.',
            min_land_acres: 1,
            farmer_types: ['small', 'marginal', 'large', 'fpo'],
            crops: 'Vegetables, fruits, flowers',
        },
        documents: ['Aadhaar and PAN card', 'Land documents', 'Detailed project report (DPR)', 'Bank statement'],
        apply_steps: ['Prepare project report', 'Apply at NHB portal', 'Bank inspection', 'Subsidy released in tranches'],
        apply_link: 'https://nhb.gov.in',
        deadline: 'Rolling applications',
        helpline: '0124-2342992',
        last_updated: '2025-01',
        tags: ['cold storage', 'warehouse', '35%', 'NHB', 'horticulture'],
    },
    {
        id: 'sub-seed-mini-kit',
        name: 'Certified Seed Mini-Kit (Free)',
        short_name: 'NFSM Seed',
        type: 'central',
        category: 'seeds',
        crop_types: ['wheat', 'rice', 'pulses'],
        farmer_categories: ['small', 'marginal'],
        states: ['all'],
        benefit_type: 'free',
        subsidy_percent: 100,
        max_benefit_inr: 2000,
        description: 'Free certified seed mini-kits under National Food Security Mission for wheat, paddy, pulses.',
        eligibility: {
            description: 'Small and marginal farmers (up to 5 acres). Priority to SC/ST and women farmers.',
            min_land_acres: 0,
            farmer_types: ['small', 'marginal'],
            crops: 'Wheat, Paddy, Pulses',
        },
        documents: ['Aadhaar card', 'Land records', 'BPL/Ration card'],
        apply_steps: ['Visit Block Agriculture Office', 'Ask for NFSM seed mini-kit', 'Submit Aadhaar and land records', 'Collect seeds from distribution point'],
        apply_link: 'https://nfsm.gov.in',
        deadline: 'Before sowing season',
        helpline: '1800-180-1551',
        last_updated: '2025-01',
        tags: ['free seeds', 'certified', 'NFSM'],
    }
];

// ─── In-memory storage for subsidy applications ────────────────────────────
const APPLICATIONS = [];

const CATEGORIES = [
    { id: 'irrigation', label: '💧 Irrigation' },
    { id: 'mechanization', label: '🚜 Farm Machinery' },
    { id: 'solar', label: '☀️ Solar' },
    { id: 'storage', label: '🏭 Storage & Warehouse' },
    { id: 'seeds', label: '🌱 Seeds' },
    { id: 'protective_cultivation', label: '🏗️ Polyhouse / Greenhouse' },
    { id: 'fpo', label: '👥 FPO / Group Farming' },
    { id: 'organic', label: '🌿 Organic Farming' },
    { id: 'water_conservation', label: '🪣 Water Conservation' },
    { id: 'horticulture', label: '🍎 Horticulture' },
];

const CROP_TYPES = ['all', 'wheat', 'rice', 'paddy', 'maize', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'flowers', 'sugarcane', 'cotton', 'spices', 'strawberry', 'medicinal_plants'];

const FARMER_CATEGORIES = [
    { id: 'small', label: 'Small (1-5 acres)' },
    { id: 'marginal', label: 'Marginal (< 1 acre)' },
    { id: 'large', label: 'Large (> 5 acres)' },
    { id: 'sc_st', label: 'SC/ST Farmer' },
    { id: 'women', label: 'Women Farmer' },
    { id: 'fpo', label: 'FPO / Cooperative' },
];

const STATES = ['All India', 'Karnataka', 'Maharashtra', 'Punjab', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Madhya Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Haryana', 'Bihar', 'West Bengal'];

// ─── ROUTES ───────────────────────────────────────────────────────────────

router.get('/meta', (req, res) => {
    res.json({ success: true, data: { categories: CATEGORIES, crop_types: CROP_TYPES, farmer_categories: FARMER_CATEGORIES, states: STATES } });
});

router.get('/', (req, res) => {
    try {
        let results = [...SUBSIDIES];
        const { state, category, crop_type, farmer_category, search } = req.query;
        if (state && state !== 'All India') results = results.filter(s => s.states.includes('all') || s.states.includes(state) || s.state === state);
        if (category) results = results.filter(s => s.category === category);
        if (crop_type && crop_type !== 'all') results = results.filter(s => s.crop_types.includes('all') || s.crop_types.includes(crop_type));
        if (search) {
            const q = search.toLowerCase();
            results = results.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
        }
        res.json({ success: true, count: results.length, data: results });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.get('/:id', (req, res) => {
    const subsidy = SUBSIDIES.find(s => s.id === req.params.id);
    if (!subsidy) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: subsidy });
});

router.post('/apply', (req, res) => {
    try {
        const { subsidy_id, farmer_name, mobile, state, village, land_acres, farmer_category, crop } = req.body;
        const subsidy = SUBSIDIES.find(s => s.id === subsidy_id);
        
        const application = {
            id: uuidv4(),
            subsidy_id,
            subsidy_name: subsidy ? subsidy.name : 'Unknown',
            farmer_name: farmer_name || 'Anonymous',
            mobile: mobile || '',
            state: state || '',
            village: village || '',
            land_acres: parseFloat(land_acres) || 0,
            farmer_category: farmer_category || 'small',
            crop: crop || '',
            status: 'draft',
            created_at: new Date().toISOString(),
            reference_number: `SUB-${Date.now().toString().slice(-8)}`,
        };
        APPLICATIONS.push(application);
        res.status(201).json({ success: true, data: application });
    } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

router.patch('/application/:id', (req, res) => {
    const index = APPLICATIONS.findIndex(a => a.id === req.params.id || a.reference_number === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    APPLICATIONS[index] = { ...APPLICATIONS[index], ...req.body, status: req.body.status || 'draft', last_updated: new Date().toISOString() };
    res.json({ success: true, data: APPLICATIONS[index] });
});

router.get('/application/:ref', (req, res) => {
    const app = APPLICATIONS.find(a => a.reference_number === req.params.ref || a.id === req.params.ref);
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: app });
});

module.exports = router;
