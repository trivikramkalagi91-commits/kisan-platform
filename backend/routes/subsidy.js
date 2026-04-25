const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// ─── GOVERNMENT SUBSIDY SCHEMES — Verified 2025 Data ─────────────────────────
// Dedicated Subsidy module: equipment, input, seed, processing, storage subsidies
// Distinct from Schemes (income support, insurance) — focused on capital subsidies
// ─────────────────────────────────────────────────────────────────────────────

const SUBSIDIES = [

    // ═══════════════════════════════════════════════════════════════
    //  CENTRAL GOVERNMENT SUBSIDIES
    // ═══════════════════════════════════════════════════════════════

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
        documents: [
            'Aadhaar card',
            'Land records (RTC/7-12 extract)',
            'Bank passbook',
            'Quotation from approved vendor',
            'Caste certificate (for higher subsidy)',
        ],
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
        documents: [
            'Aadhaar card',
            'Land records',
            'Bank passbook',
            'Caste certificate (SC/ST farmers)',
            'Quotation from approved manufacturer',
            'Declaration of not owning same equipment',
        ],
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
            description: 'All farmers with agricultural land and need for irrigation. Preference to farmers replacing diesel pumps. FPOs and water user associations also eligible. Component C of PM-KUSUM for off-grid solar pumps.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'All crops',
        },
        documents: [
            'Aadhaar card',
            'Land records',
            'Bank passbook',
            'Existing pump details (if replacing diesel pump)',
            'Electricity connection details (if applicable)',
        ],
        apply_steps: [
            'Visit state DISCOM office or state renewable energy department website',
            'Register and apply for PM-KUSUM Component C (off-grid solar pump)',
            'Site inspection for solar potential assessment',
            '30% Central + 30% State subsidy provided directly; take 30% bank loan from NABARD empanelled bank',
            'Pay only 10% of pump cost yourself',
            'Solar pump installed within 3-6 months after approval',
        ],
        apply_link: 'https://mnre.gov.in/solar/schemes/',
        deadline: 'Check state renewable energy department — ongoing till 2026',
        helpline: '1800-180-3333',
        last_updated: '2025-01',
        tags: ['solar', 'pump', '90%', 'free electricity', 'diesel replacement', 'PM-KUSUM'],
    },

    {
        id: 'sub-cold-storage',
        name: 'Cold Storage & Warehouse Subsidy',
        short_name: 'AIF + NHB',
        type: 'central',
        category: 'storage',
        crop_types: ['vegetables', 'fruits', 'flowers', 'all'],
        farmer_categories: ['small', 'marginal', 'large', 'fpo'],
        states: ['all'],
        benefit_type: 'mixed',
        subsidy_percent: 35,
        max_benefit_inr: 5000000,
        description: '35% capital subsidy on cold storage, pack houses, ripening chambers under NHB scheme. Also ₹2 crore at 3% interest under Agriculture Infrastructure Fund (AIF). Perfect for vegetable and fruit growers.',
        eligibility: {
            description: 'Farmers, FPOs, cooperatives, SHGs, startups for post-harvest infrastructure. Cold storage 5-5000 MT capacity. Must be for horticultural produce primarily. AIF loan available separately at 3% interest.',
            min_land_acres: 1,
            farmer_types: ['small', 'marginal', 'large', 'fpo', 'cooperative'],
            crops: 'Vegetables, fruits, flowers, spices, plantation crops',
        },
        documents: [
            'Aadhaar and PAN card',
            'Land/lease documents for construction site',
            'Detailed project report (DPR)',
            'Bank statement (6 months)',
            'Layout plan and cost estimate',
            'Registration certificate (for FPO/cooperative)',
        ],
        apply_steps: [
            'Prepare a detailed project report for cold storage / pack house',
            'Apply at National Horticulture Board (NHB) portal: nhb.gov.in',
            'Alternatively apply under AIF at agriinfra.dac.gov.in for software loan at 3%',
            'Submit DPR and land documents. Bank inspection done.',
            '35% subsidy released in 2-3 installments (30% on completion, 5% after 3 years)',
            'AIF credit guarantee available from CGTMSE — no collateral needed',
        ],
        apply_link: 'https://nhb.gov.in',
        deadline: 'Rolling applications throughout the year',
        helpline: '0124-2342992',
        last_updated: '2025-01',
        tags: ['cold storage', 'warehouse', 'pack house', '35%', 'NHB', 'AIF', 'horticulture'],
    },

    {
        id: 'sub-seed-mini-kit',
        name: 'Certified Seed Mini-Kit (Free / Subsidized)',
        short_name: 'NFSM Seed',
        type: 'central',
        category: 'seeds',
        crop_types: ['wheat', 'rice', 'pulses', 'oilseeds', 'maize'],
        farmer_categories: ['small', 'marginal'],
        states: ['all'],
        benefit_type: 'free',
        subsidy_percent: 100,
        max_benefit_inr: 2000,
        description: 'Free certified seed mini-kits under National Food Security Mission (NFSM) for wheat, paddy, pulses, oilseeds and maize. Delivered to doorstep of small/marginal farmers through agriculture dept.',
        eligibility: {
            description: 'Small and marginal farmers (up to 5 acres). Priority to SC/ST farmers, women farmers and BPL households. Distributed through Krishi Vigyan Kendras, RSKs and Block Agriculture Offices.',
            min_land_acres: 0,
            farmer_types: ['small', 'marginal'],
            crops: 'Wheat, Paddy, Pulses (moong, urad, masoor), Oilseeds (mustard, groundnut), Maize',
        },
        documents: [
            'Aadhaar card',
            'Land records',
            'BPL/Ration card (for priority)',
            'Caste certificate (SC/ST)',
        ],
        apply_steps: [
            'Visit your nearest Block Agriculture Office or Krishi Vigyan Kendra (KVK)',
            'Ask for NFSM seed mini-kit for your crop (wheat, paddy, pulses, oilseeds)',
            'Submit Aadhaar and land records',
            'Seeds allocated on first-come-first-served basis — go early in season',
            'Collect seeds from distribution point — free for small/marginal farmers',
        ],
        apply_link: 'https://nfsm.gov.in',
        deadline: 'Before Kharif (May-June) or Rabi sowing (October-November)',
        helpline: '1800-180-1551',
        last_updated: '2025-01',
        tags: ['free seeds', 'certified', 'wheat', 'paddy', 'pulses', 'NFSM', 'mini-kit'],
    },

    {
        id: 'sub-greenhouse-polyhouse',
        name: 'Greenhouse / Polyhouse Subsidy',
        short_name: 'NHM Polyhouse',
        type: 'central',
        category: 'protective_cultivation',
        crop_types: ['vegetables', 'flowers', 'medicinal_plants'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['all'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 50,
        max_benefit_inr: 1120000,
        description: '50% subsidy (up to ₹11.2 lakh for 1000 sqm) on polyhouse, net house and shade net structures under National Horticulture Mission. Grow crops year-round and export quality vegetables and flowers.',
        eligibility: {
            description: 'All farmers with minimum 0.5 acres land. Polyhouse must be used for crop production only. Must buy from approved structure suppliers on state list. Component of NHM / MIDH scheme.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'Vegetables, flowers (roses, gerbera), strawberry, medicinal plants',
        },
        documents: [
            'Aadhaar card',
            'Land records (up to 4 acres)',
            'Bank passbook',
            'Quotation from approved polyhouse supplier',
            'Soil test report',
        ],
        apply_steps: [
            'Contact District Horticulture Officer (DHO) or state horticulture department',
            'Apply on state horticulture department portal or NHM portal',
            'Get pre-approval before starting construction',
            'Order polyhouse/net house from approved supplier on state panel',
            'Department inspects after installation — geo-tagged photos required',
            '50% subsidy released directly to bank after successful inspection',
        ],
        apply_link: 'https://nhm.nic.in',
        deadline: 'Annual — most states open April-August. Check state horticulture portal.',
        helpline: '1800-180-1551',
        last_updated: '2025-01',
        tags: ['polyhouse', 'greenhouse', 'net house', '50%', 'NHM', 'flowers', 'vegetables'],
    },

    {
        id: 'sub-fpo-support',
        name: 'FPO Formation & Support Subsidy',
        short_name: 'FPO Scheme',
        type: 'central',
        category: 'fpo',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal'],
        states: ['all'],
        benefit_type: 'grant',
        subsidy_percent: 100,
        max_benefit_inr: 1500000,
        description: '₹15 lakh grant per FPO over 5 years for formation and strengthening. Plus equity grant up to ₹15 lakh and credit guarantee up to ₹2 crore. Form a group of 300+ farmers and get full support.',
        eligibility: {
            description: 'Group of at least 300 farmers willing to form a Farmer Producer Organization (FPO). Minimum 100 farmers in hilly/NE states. Registered as Section 8 company or cooperative. Promoted by Cluster Based Business Organization (CBBO).',
            min_land_acres: 0,
            farmer_types: ['small', 'marginal'],
            crops: 'All crops and livestock',
        },
        documents: [
            'List of 300+ farmer members with Aadhaar',
            'Land records of member farmers',
            'Resolution for FPO formation',
            'Bank account (opened after formation)',
            'Registration documents (after formation)',
        ],
        apply_steps: [
            'Identify and mobilize 300 farmers in your cluster',
            'Contact nearest NABARD office or SFAC (Small Farmers Agribusiness Consortium)',
            'Register FPO as company or cooperative with help from CBBO',
            'CBBO provides ₹25 lakh handholding support over 3 years',
            '₹15 lakh grant released in tranches based on membership and performance',
            'Apply for equity grant and credit guarantee after FPO becomes operational',
        ],
        apply_link: 'https://sfacindia.com/fpo.aspx',
        deadline: 'Ongoing — target of 10,000 FPOs by 2027-28',
        helpline: '011-26862367',
        last_updated: '2025-01',
        tags: ['FPO', 'group', 'cooperative', '15 lakh', 'collective farming', 'credit guarantee'],
    },

    {
        id: 'sub-organic-certification',
        name: 'Organic Farming & Certification Support',
        short_name: 'PKVY',
        type: 'central',
        category: 'organic',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal'],
        states: ['all'],
        benefit_type: 'grant',
        subsidy_percent: 100,
        max_benefit_inr: 31500,
        description: '₹31,500 per acre (over 3 years) for organic conversion, certification and marketing under Paramparagat Krishi Vikas Yojana (PKVY). Cluster of 50 farmers, 50 acres gets ₹15.75 lakh.',
        eligibility: {
            description: 'Farmers willing to convert to organic farming in cluster groups of 50 farmers covering 50 acres. Cluster-based approach — individual farmers cannot apply alone. 3-year organic conversion period supported.',
            min_land_acres: 1,
            farmer_types: ['small', 'marginal'],
            crops: 'All crops transitioning to organic',
        },
        documents: [
            'Aadhaar card',
            'Land records (minimum 1 acre)',
            'Bank passbook',
            'Commitment letter for 3-year organic conversion',
            'Soil test report',
        ],
        apply_steps: [
            'Form a cluster of 50 farmers with 50 acres collectively',
            'Contact your Block Agriculture Officer or KVK for PKVY cluster registration',
            'Cluster gets ₹15.75 lakh total support over 3 years (₹31,500/acre)',
            'Funds used for biological inputs, compost, certification costs',
            'Third-party certification done by accredited certifying agency',
            'Certified organic produce fetches 20-50% premium price',
        ],
        apply_link: 'https://pgsindia-ncof.gov.in',
        deadline: 'Annual — register clusters April-June. Check state agriculture dept.',
        helpline: '1800-180-1551',
        last_updated: '2025-01',
        tags: ['organic', 'PKVY', 'certification', 'premium', 'cluster', '3 years'],
    },

    // ═══════════════════════════════════════════════════════════════
    //  KARNATAKA STATE SUBSIDIES
    // ═══════════════════════════════════════════════════════════════

    {
        id: 'sub-ka-farm-pond',
        name: 'Farm Pond (Bhoomi Mitra) Subsidy',
        short_name: 'Krishi Bhagya KA',
        type: 'state',
        state: 'Karnataka',
        category: 'water_conservation',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal'],
        states: ['Karnataka'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 100,
        max_benefit_inr: 150000,
        description: '100% subsidy (up to ₹1.5 lakh) on farm pond construction under Krishi Bhagya scheme for Karnataka dry-land farmers. Includes plastic lining, pump set, and drip connection setup.',
        eligibility: {
            description: 'Dry land farmers of Karnataka with 1-12 acres land in rain-fed / drought-prone areas. Preference to small/marginal farmers and SC/ST. Must be registered on FRUITS portal.',
            min_land_acres: 1,
            farmer_types: ['small', 'marginal'],
            crops: 'Dry land crops',
        },
        documents: [
            'Aadhaar card',
            'RTC (from Bhoomi portal)',
            'Bank passbook',
            'FRUITS registration ID',
            'Caste certificate (SC/ST for priority)',
        ],
        apply_steps: [
            'Register on FRUITS portal at fruits.karnataka.gov.in',
            'Visit nearest Raitha Samparka Kendra (RSK) with Aadhaar and RTC',
            'Submit Krishi Bhagya application to Agriculture Extension Officer (AEO)',
            'Site inspection by AEO to confirm land is rain-fed / dry land',
            'Approval from District Agriculture Officer',
            'Farm pond dug and subsidy released in 2 installments',
        ],
        apply_link: 'https://raitamitra.karnataka.gov.in',
        deadline: 'Apply June-July before Kharif. Budget limited — apply early.',
        helpline: '080-22212121',
        last_updated: '2025-01',
        tags: ['Karnataka', 'farm pond', 'dry land', '1.5 lakh', 'water conservation', 'Krishi Bhagya'],
    },

    {
        id: 'sub-ka-horticulture',
        name: 'Karnataka Horticulture Equipment Subsidy',
        short_name: 'KHD Subsidy',
        type: 'state',
        state: 'Karnataka',
        category: 'horticulture',
        crop_types: ['fruits', 'vegetables', 'flowers', 'spices'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['Karnataka'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 50,
        max_benefit_inr: 200000,
        description: 'Karnataka Horticulture Department provides 50% subsidy on sprayers, brush cutters, power weeders and horticulture tools for fruit/vegetable farmers under NHM. Apply through RSK.',
        eligibility: {
            description: 'Karnataka farmers growing horticultural crops (fruits, vegetables, flowers, spices). Equipment must be from approved list. Apply through Horticulture Sub-Division office or RSK.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'Fruits, vegetables, flowers, areca nut, coffee, cardamom',
        },
        documents: [
            'Aadhaar card',
            'RTC (land record)',
            'Bank passbook',
            'Quotation from dealer',
            'Caste certificate (SC/ST for higher subsidy)',
        ],
        apply_steps: [
            'Visit nearest Horticulture Sub-Division Office or Raitha Samparka Kendra',
            'Ask for NHM equipment subsidy application for your crop',
            'Submit land records and quotation from approved equipment dealer',
            'Inspection by Horticulture Extension Officer',
            'After approval, buy equipment from dealer and submit invoice',
            '50% subsidy credited directly to bank account',
        ],
        apply_link: 'https://horticulture.karnataka.gov.in',
        deadline: 'Apply April-August. Check with district horticulture office.',
        helpline: '080-22215983',
        last_updated: '2025-01',
        tags: ['Karnataka', 'horticulture', 'sprayer', 'tools', '50%', 'NHM', 'fruits'],
    },

    // ═══════════════════════════════════════════════════════════════
    //  MAHARASHTRA STATE SUBSIDIES
    // ═══════════════════════════════════════════════════════════════

    {
        id: 'sub-mh-drip',
        name: 'Maharashtra Drip Irrigation Subsidy',
        short_name: 'MahaDBT Drip',
        type: 'state',
        state: 'Maharashtra',
        category: 'irrigation',
        crop_types: ['sugarcane', 'cotton', 'vegetables', 'fruits', 'all'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['Maharashtra'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 55,
        max_benefit_inr: 200000,
        description: '55% subsidy for small/marginal farmers (45% for others) on drip and sprinkler systems under MahaDBT Agriculture scheme. Apply online at mahadbt.maharashtra.gov.in.',
        eligibility: {
            description: 'All Maharashtra farmers with own or leased land (7-year lease). Apply on MahaDBT portal. First-come-first-served basis. District-wise physical targets set annually.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'All crops, especially sugarcane, cotton, vegetables, fruits',
        },
        documents: [
            'Aadhaar card',
            '7/12 extract (Satbara)',
            'Bank passbook',
            'Quotation from approved drip company',
        ],
        apply_steps: [
            'Register on mahadbt.maharashtra.gov.in with Aadhaar',
            'Login → Agriculture Department → Drip/Sprinkler Irrigation scheme',
            'Upload 7/12 extract and quotation from approved drip company',
            'Inspector visits your field and verifies land and crop',
            'Install drip system from approved company after sanction',
            'Final inspection + geo-tagged photos → subsidy to bank',
        ],
        apply_link: 'https://mahadbt.maharashtra.gov.in',
        deadline: 'Open April-June and September-November. Check MahaDBT portal.',
        helpline: '1800-120-8040',
        last_updated: '2025-01',
        tags: ['Maharashtra', 'drip', 'sprinkler', 'MahaDBT', '55%', 'irrigation'],
    },

    {
        id: 'sub-mh-polyhouse',
        name: 'Maharashtra Polyhouse / Shade Net Subsidy',
        short_name: 'MH NHM Polyhouse',
        type: 'state',
        state: 'Maharashtra',
        category: 'protective_cultivation',
        crop_types: ['vegetables', 'flowers', 'strawberry'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['Maharashtra'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 50,
        max_benefit_inr: 1120000,
        description: '50% subsidy on polyhouse and shade net house construction for vegetable and flower cultivation under NHM in Maharashtra. One of the highest supporting states for protected cultivation.',
        eligibility: {
            description: 'Maharashtra farmers with minimum 0.5 acres flat land for polyhouse. Structure from approved Maharashtra Agriculture Department supplier list. Must use for crop production.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'Vegetables (capsicum, tomato), flowers (rose, gerbera), strawberry',
        },
        documents: [
            'Aadhaar card',
            '7/12 extract',
            'Bank passbook',
            'Quotation from approved polyhouse supplier',
        ],
        apply_steps: [
            'Apply on MahaDBT portal under Horticulture Department → Protected Cultivation',
            'Choose polyhouse, net house, or shade net based on crop plan',
            'Pre-approval required before construction begins',
            'Buy structure from approved manufacturer on Maharashtra Agriculture list',
            'Post-completion inspection with geo-tagged photos',
            '50% subsidy to bank in 2 installments',
        ],
        apply_link: 'https://mahadbt.maharashtra.gov.in',
        deadline: 'Check MahaDBT portal — usually open April-October',
        helpline: '1800-120-8040',
        last_updated: '2025-01',
        tags: ['Maharashtra', 'polyhouse', 'net house', 'NHM', '50%', 'flowers', 'vegetables'],
    },

    // ═══════════════════════════════════════════════════════════════
    //  PUNJAB STATE SUBSIDIES
    // ═══════════════════════════════════════════════════════════════

    {
        id: 'sub-pb-straw-management',
        name: 'Punjab Crop Residue / Straw Management Machinery',
        short_name: 'Punjab CRMS',
        type: 'state',
        state: 'Punjab',
        category: 'mechanization',
        crop_types: ['wheat', 'paddy'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['Punjab'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 50,
        max_benefit_inr: 300000,
        description: '50% subsidy (80% for cooperative societies) on Happy Seeder, Super SMS, Paddy Chopper, Rotary Slasher for in-situ crop residue management. Prevents stubble burning. Save ₹3000/acre vs burning.',
        eligibility: {
            description: 'All Punjab farmers growing paddy and wheat. Individual farmers get 50% subsidy. Cooperative societies and panchayats get 80%. Equipment must be from approved manufacturers on Punjab Agriculture portal.',
            min_land_acres: 1,
            farmer_types: ['small', 'marginal', 'large', 'cooperative'],
            crops: 'Paddy, Wheat',
        },
        documents: [
            'Aadhaar card',
            'Jamabandi (land record)',
            'Bank passbook',
            'Quotation from approved manufacturer',
        ],
        apply_steps: [
            'Apply at agripb.gov.in Punjab Agriculture portal',
            'Select equipment from approved manufacturer list',
            'Submit land records (Jamabandi) and quotation',
            'Approval is first-come-first-served — budget limited',
            'Buy equipment from approved dealer after sanction letter',
            'Upload purchase invoice → 50% subsidy released to bank',
        ],
        apply_link: 'https://agripb.gov.in',
        deadline: 'Apply April-June before Kharif. Limited quota — apply immediately.',
        helpline: '0172-2970082',
        last_updated: '2025-01',
        tags: ['Punjab', 'Happy Seeder', 'straw management', '50%', 'no stubble burning', 'wheat', 'paddy'],
    },

    // ═══════════════════════════════════════════════════════════════
    //  ANDHRA PRADESH STATE SUBSIDIES
    // ═══════════════════════════════════════════════════════════════

    {
        id: 'sub-ap-drip',
        name: 'AP Micro Irrigation Subsidy (YSR Jala Kala)',
        short_name: 'AP Drip 100%',
        type: 'state',
        state: 'Andhra Pradesh',
        category: 'irrigation',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal'],
        states: ['Andhra Pradesh'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 100,
        max_benefit_inr: 200000,
        description: '100% subsidy on drip and sprinkler irrigation for small/marginal farmers under YSR Jala Kala scheme — Andhra Pradesh government pays the entire cost. No farmer contribution needed.',
        eligibility: {
            description: 'Small and marginal farmers of Andhra Pradesh (up to 5 acres). Apply through village secretariat. State government pays 100% of drip/sprinkler cost for eligible farmers.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal'],
            crops: 'All crops',
        },
        documents: [
            'Aadhaar card',
            'Pahani (land record)',
            'Bank passbook linked to Aadhaar',
        ],
        apply_steps: [
            'Visit nearest village secretariat or Rythu Bharosa Centre',
            'Apply for YSR Jala Kala through Ward / Village Secretariat Agriculture Assistant',
            'No payment required — state pays 100% for small/marginal farmers',
            'Drip system installed by empanelled agency',
            'Training provided on using the drip system',
        ],
        apply_link: 'https://apagrisnet.ap.gov.in',
        deadline: 'Rolling applications. Contact village secretariat.',
        helpline: '1902',
        last_updated: '2025-01',
        tags: ['Andhra Pradesh', 'drip', '100%', 'free', 'small farmer', 'YSR Jala Kala'],
    },

    // ═══════════════════════════════════════════════════════════════
    //  TELANGANA STATE SUBSIDIES
    // ═══════════════════════════════════════════════════════════════

    {
        id: 'sub-tg-kaleshwaram-drip',
        name: 'Telangana Micro Irrigation Subsidy',
        short_name: 'TG MI Fund',
        type: 'state',
        state: 'Telangana',
        category: 'irrigation',
        crop_types: ['all'],
        farmer_categories: ['small', 'marginal', 'large'],
        states: ['Telangana'],
        benefit_type: 'percent_subsidy',
        subsidy_percent: 70,
        max_benefit_inr: 175000,
        description: '70% subsidy on drip and sprinkler irrigation for all Telangana farmers from state MI Fund on top of central PMKSY subsidy. Telangana pushes aggressive micro irrigation adoption.',
        eligibility: {
            description: 'All Telangana farmers. Combined Central (45%) + State (25%) = 70% subsidy for small/marginal farmers. Apply through HMWS&SB office or Horticulture Department.',
            min_land_acres: 0.5,
            farmer_types: ['small', 'marginal', 'large'],
            crops: 'All crops',
        },
        documents: [
            'Aadhaar card',
            'Pahani (land record)',
            'Bank passbook',
            'Quotation from approved drip company',
        ],
        apply_steps: [
            'Contact District Horticulture Office or Agriculture Officer in Telangana',
            'Register and apply on TS Horticulture Department portal',
            'Submit Pahani (land record) and quotation from approved micro irrigation company',
            'Field inspection and geo-tagging done by officer',
            'Install after sanction. Upload invoice and photos.',
            '70% subsidy (Central + State combined) released to bank',
        ],
        apply_link: 'https://horticulture.telangana.gov.in',
        deadline: 'Annual — check TS Horticulture department for current open period',
        helpline: '040-23456425',
        last_updated: '2025-01',
        tags: ['Telangana', 'drip', '70%', 'micro irrigation', 'horticulture'],
    },
];

// ─── In-memory storage for subsidy applications ────────────────────────────
const APPLICATIONS = [];

// ─── METADATA ─────────────────────────────────────────────────────────────
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

const CROP_TYPES = [
    'all', 'wheat', 'rice', 'paddy', 'maize', 'pulses', 'oilseeds',
    'vegetables', 'fruits', 'flowers', 'sugarcane', 'cotton', 'spices',
    'strawberry', 'medicinal_plants',
];

const FARMER_CATEGORIES = [
    { id: 'small', label: 'Small (1-5 acres)' },
    { id: 'marginal', label: 'Marginal (< 1 acre)' },
    { id: 'large', label: 'Large (> 5 acres)' },
    { id: 'sc_st', label: 'SC/ST Farmer' },
    { id: 'women', label: 'Women Farmer' },
    { id: 'fpo', label: 'FPO / Cooperative' },
];

const STATES = [
    'All India', 'Karnataka', 'Maharashtra', 'Punjab', 'Andhra Pradesh',
    'Telangana', 'Tamil Nadu', 'Madhya Pradesh', 'Uttar Pradesh', 'Rajasthan',
    'Gujarat', 'Haryana', 'Bihar', 'West Bengal',
];

// ─── ROUTES ───────────────────────────────────────────────────────────────

// GET /api/subsidy/meta — return filter options
router.get('/meta', (req, res) => {
    res.json({
        success: true,
        data: { categories: CATEGORIES, crop_types: CROP_TYPES, farmer_categories: FARMER_CATEGORIES, states: STATES },
    });
});

// GET /api/subsidy — list all subsidies with optional filters
router.get('/', (req, res) => {
    try {
        let results = [...SUBSIDIES];
        const { state, category, crop_type, farmer_category, type, search } = req.query;

        if (state && state !== 'All India') {
            results = results.filter(s => s.states.includes('all') || s.states.includes(state) || s.state === state);
        }
        if (category) {
            results = results.filter(s => s.category === category);
        }
        if (crop_type && crop_type !== 'all') {
            results = results.filter(s => s.crop_types.includes('all') || s.crop_types.includes(crop_type));
        }
        if (farmer_category) {
            results = results.filter(s => s.farmer_categories.includes('all') || s.farmer_categories.includes(farmer_category));
        }
        if (type) {
            results = results.filter(s => s.type === type);
        }
        if (search) {
            const q = search.toLowerCase();
            results = results.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        res.json({ success: true, count: results.length, data: results });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch subsidies. Please try again.' });
    }
});

// GET /api/subsidy/:id — get single subsidy detail
router.get('/:id', (req, res) => {
    const subsidy = SUBSIDIES.find(s => s.id === req.params.id);
    if (!subsidy) return res.status(404).json({ error: 'Subsidy scheme not found.' });
    res.json({ success: true, data: subsidy });
});

// POST /api/subsidy/apply — submit subsidy application
router.post('/apply', (req, res) => {
    try {
        const { subsidy_id, farmer_name, mobile, state, village, land_acres, farmer_category, crop, aadhaar_last4, notes } = req.body;

        if (!subsidy_id || !farmer_name || !mobile || !state) {
            return res.status(400).json({ error: 'Missing required fields: subsidy_id, farmer_name, mobile, state.' });
        }
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ error: 'Mobile number must be 10 digits.' });
        }

        const subsidy = SUBSIDIES.find(s => s.id === subsidy_id);
        if (!subsidy) return res.status(404).json({ error: 'Subsidy scheme not found.' });

        const application = {
            id: uuidv4(),
            subsidy_id,
            subsidy_name: subsidy.name,
            farmer_name: farmer_name.trim(),
            mobile,
            state,
            village: village || '',
            land_acres: parseFloat(land_acres) || 0,
            farmer_category: farmer_category || 'small',
            crop: crop || '',
            aadhaar_last4: aadhaar_last4 || '',
            notes: notes || '',
            status: 'submitted',
            created_at: new Date().toISOString(),
            reference_number: `SUB-${Date.now().toString().slice(-8)}`,
        };

        APPLICATIONS.push(application);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully! Save the reference number.',
            data: {
                id: application.id,
                reference_number: application.reference_number,
                subsidy_name: subsidy.name,
                status: 'submitted',
                next_step: subsidy.apply_steps[0],
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit application. Please try again.' });
    }
});

// GET /api/subsidy/application/:ref — check application status
router.get('/application/:ref', (req, res) => {
    const app = APPLICATIONS.find(a => a.reference_number === req.params.ref || a.id === req.params.ref);
    if (!app) return res.status(404).json({ error: 'Application not found. Please check reference number.' });
    res.json({ success: true, data: app });
});

module.exports = router;
