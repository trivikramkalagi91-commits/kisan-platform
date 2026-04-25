const express = require('express');
const router = express.Router();

// ─── REAL GOVERNMENT SCHEMES — Verified Official Data 2025 ───────────────────
// Sources: pmkisan.gov.in, pmfby.gov.in, nabard.org, raitamitra.karnataka.gov.in
// myscheme.gov.in, agricoop.nic.in, mahadbt.maharashtra.gov.in
// Strategy: Curated real dataset with official apply links + periodic manual updates
// Live API: myscheme.gov.in does not expose public REST API — curated dataset is
// the most reliable approach used by all major agri platforms in India.
// ─────────────────────────────────────────────────────────────────────────────

const SCHEMES = [

  // ═══════════════════════════════════════════════════════════════
  //  CENTRAL GOVERNMENT SCHEMES — Available in ALL states
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    full_name: 'Pradhan Mantri Kisan Samman Nidhi',
    type: 'central',
    category: 'income_support',
    benefit: '₹6,000 per year in 3 equal installments of ₹2,000 — directly to bank account. No middlemen.',
    benefit_amount: 6000,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['small', 'marginal', 'large'],
      min_land_acres: 0.1,
      max_land_acres: null,
      description: 'All land-holding farmer families with cultivable land. Excludes: income tax payers, government employees (current), constitutional post holders, institutional land holders.'
    },
    documents: ['Aadhaar card', 'Bank passbook (linked to Aadhaar)', 'Land records (RTC/Khata/Patta/7-12)', 'Mobile number'],
    apply_link: 'https://pmkisan.gov.in',
    apply_steps: [
      'Visit pmkisan.gov.in and click "Farmers Corner" → "New Farmer Registration"',
      'Enter your Aadhaar number, select state, and enter CAPTCHA',
      'Fill your name, bank account, IFSC code, and land details',
      'Or visit your nearest Common Service Centre (CSC) — they will register for you free',
      'Check status at pmkisan.gov.in → "Beneficiary Status" using Aadhaar or account number'
    ],
    deadline: 'Rolling — apply anytime. Installments: April, August, December',
    tags: ['income', 'direct transfer', 'all states', 'no loan', '6000'],
    helpline: '155261 / 011-23381092'
  },

  {
    id: 'pmfby',
    name: 'PMFBY',
    full_name: 'Pradhan Mantri Fasal Bima Yojana',
    type: 'central',
    category: 'insurance',
    benefit: 'Crop insurance at just 1.5% premium (Rabi) / 2% (Kharif). Government pays remaining 85-98%. Full crop value covered.',
    benefit_amount: null,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['Kharif crops', 'Rabi crops', 'Annual commercial crops', 'Horticultural crops'],
      farmer_type: ['all'],
      min_land_acres: 0.1,
      max_land_acres: null,
      description: 'All farmers growing notified crops in notified areas. 100% voluntary since 2020. Loanee farmers can opt-out, non-loanee farmers can opt-in.'
    },
    documents: ['Aadhaar card', 'Bank passbook', 'Land records', 'Sowing certificate from Patwari'],
    apply_link: 'https://pmfby.gov.in',
    apply_steps: [
      'Visit pmfby.gov.in or your bank/cooperative before the cutoff date',
      'If you have crop loan, you are auto-enrolled — you must actively OPT OUT if you don\'t want it',
      'For non-loanee farmers: visit any bank, CSC, or insurance company office',
      'Pay the small premium (1.5-2% of sum insured)',
      'Get your policy certificate and save the insurance company helpline number',
      'Report crop loss within 72 hours of damage to bank or 14447 helpline'
    ],
    deadline: 'Kharif: July 31 | Rabi: December 31 (check state notification)',
    tags: ['insurance', 'crop loss', 'drought', 'flood', 'hailstorm', 'low premium'],
    helpline: '14447'
  },

  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    full_name: 'Kisan Credit Card Scheme',
    type: 'central',
    category: 'credit',
    benefit: 'Crop loans up to ₹3 lakh at 4% effective interest (after 3% interest subvention from Govt). Withdraw anytime from ATM.',
    benefit_amount: 300000,
    ministry: 'Ministry of Finance / NABARD / RBI',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0.1,
      max_land_acres: null,
      description: 'All farmers including tenant farmers, sharecroppers, oral lessees. Also covers fishermen and animal husbandry farmers since 2020.'
    },
    documents: ['Aadhaar card', 'PAN card', 'Land records or lease agreement', 'Bank passbook', '2 passport photos', 'Crop details'],
    apply_link: 'https://www.pmkisan.gov.in/kcc.aspx',
    apply_steps: [
      'Visit any SBI, PNB, or nationalized bank branch near you',
      'Ask for Kisan Credit Card (KCC) application form — it\'s free',
      'Submit land records and Aadhaar. Bank officer will assess credit limit',
      'For loans up to ₹1.6 lakh — NO collateral required',
      'KCC issued within 14 working days. Repay after harvest — flexible schedule',
      'Existing PM-KISAN beneficiaries can get KCC through simplified process'
    ],
    deadline: 'Rolling — apply anytime at any bank',
    tags: ['credit', '4% interest', 'ATM', 'flexible', 'no collateral upto 1.6 lakh'],
    helpline: '1800-180-1551'
  },

  {
    id: 'pmksy',
    name: 'PMKSY',
    full_name: 'Pradhan Mantri Krishi Sinchai Yojana',
    type: 'central',
    category: 'irrigation',
    benefit: '55% subsidy on drip irrigation for small/marginal farmers. 45% for others. "Har Khet Ko Pani" — water to every farm.',
    benefit_amount: null,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'Farmers with own land or 7-year registered lease. Priority to small and marginal farmers. SC/ST farmers get higher subsidy.'
    },
    documents: ['Aadhaar card', 'Land records', 'Bank account', 'Quotation from approved vendor'],
    apply_link: 'https://pmksy.gov.in',
    apply_steps: [
      'Contact your District Agriculture Officer (DAO) or Horticulture Officer',
      'Apply online on state agriculture department portal or pmksy.gov.in',
      'Get field inspection done by agriculture officer',
      'Buy drip/sprinkler system from approved vendor on state panel',
      'Subsidy credited to bank after geo-tagged photo verification'
    ],
    deadline: 'Annual — apply by March for Kharif. Check state portal for exact dates.',
    tags: ['irrigation', 'drip', 'sprinkler', 'subsidy', 'water saving'],
    helpline: '1800-180-1551'
  },

  {
    id: 'smam',
    name: 'SMAM',
    full_name: 'Sub-Mission on Agricultural Mechanization',
    type: 'central',
    category: 'mechanization',
    benefit: '40-50% subsidy on tractors, harvesters, seed drills, rotavators. SC/ST farmers get higher subsidy. Apply on DBT portal.',
    benefit_amount: null,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'All farmers. SC/ST farmers, women farmers and small/marginal farmers get priority and higher subsidy percentage.'
    },
    documents: ['Aadhaar', 'Land records', 'Bank account', 'Caste certificate (if applicable)', 'Quotation for equipment'],
    apply_link: 'https://agrimachinery.nic.in',
    apply_steps: [
      'Register at agrimachinery.nic.in (DBT portal for farm machinery)',
      'Select your state and apply for the specific equipment subsidy',
      'Choose equipment from approved manufacturer list on portal',
      'After approval, purchase equipment and upload invoice + photos',
      'Subsidy transferred directly to bank account'
    ],
    deadline: 'Apply anytime. Budget limited — apply early in financial year (April-June)',
    tags: ['tractor', 'harvester', 'subsidy', 'machinery', 'mechanization'],
    helpline: '1800-180-1551'
  },

  {
    id: 'soil-health-card',
    name: 'Soil Health Card',
    full_name: 'Soil Health Card Scheme',
    type: 'central',
    category: 'soil',
    benefit: 'FREE soil testing every 2 years. Detailed report with crop-wise fertilizer recommendations to save 20-30% on fertilizer cost.',
    benefit_amount: 0,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0,
      max_land_acres: null,
      description: 'All farmers across India. Completely free. No income or land size restriction.'
    },
    documents: ['Aadhaar card', 'Land details (survey number)'],
    apply_link: 'https://soilhealth.dac.gov.in',
    apply_steps: [
      'Contact your nearest Krishi Vigyan Kendra (KVK) or Agriculture Extension Officer',
      'Or apply online at soilhealth.dac.gov.in',
      'Provide your field details and survey number',
      'Soil sample collected by agriculture department staff or you can submit sample',
      'Report delivered in 2-3 weeks with exact fertilizer and lime recommendations'
    ],
    deadline: 'Rolling — available throughout the year',
    tags: ['free', 'soil test', 'fertilizer', 'save cost', 'productivity'],
    helpline: '1800-180-1551'
  },

  {
    id: 'pm-kusum',
    name: 'PM-KUSUM',
    full_name: 'Pradhan Mantri Kisan Urja Suraksha Evam Utthan Mahabhiyan',
    type: 'central',
    category: 'solar',
    benefit: '90% subsidy on solar pump sets (30% Central + 30% State + 30% NABARD loan). Farmer pays only 10%. Save on electricity forever.',
    benefit_amount: null,
    ministry: 'Ministry of New and Renewable Energy',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'All farmers with agricultural land and existing diesel/electric pump or new irrigation need. FPOs and water user associations also eligible.'
    },
    documents: ['Aadhaar', 'Land records', 'Existing pump details', 'Bank account'],
    apply_link: 'https://mnre.gov.in/solar/schemes/',
    apply_steps: [
      'Visit your state\'s DISCOM (electricity distribution company) website',
      'Apply on state renewable energy department portal',
      'MNRE provides 30% subsidy, state gives 30%, you take 30% NABARD loan',
      'Pay only 10% of solar pump cost yourself',
      'Excess solar power can be sold to grid — extra income source'
    ],
    deadline: 'Check state portal. Scheme ongoing till 2026.',
    tags: ['solar', 'pump', 'subsidy', '90%', 'save electricity', 'irrigation'],
    helpline: '1800-180-3333'
  },

  {
    id: 'enam',
    name: 'e-NAM',
    full_name: 'Electronic National Agriculture Market',
    type: 'central',
    category: 'marketing',
    benefit: 'Sell crops online across India from your phone. Get better price through transparent auction. Direct payment to bank account.',
    benefit_amount: null,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0,
      max_land_acres: null,
      description: 'Any farmer with produce to sell. Register with Aadhaar and bank account. Active in 1000+ APMCs across India.'
    },
    documents: ['Aadhaar card', 'Bank passbook', 'Mobile number'],
    apply_link: 'https://enam.gov.in/web/farmers/farmer-registration',
    apply_steps: [
      'Visit enam.gov.in or download eNAM mobile app',
      'Click "Farmer Registration" and enter Aadhaar details',
      'Select your nearest eNAM-linked APMC/mandi',
      'Upload your produce photo and quantity when ready to sell',
      'Buyers from anywhere in India bid. Highest bid wins.',
      'Payment within 3 days directly to your bank'
    ],
    deadline: 'Rolling — register anytime. Active year round.',
    tags: ['sell online', 'better price', 'transparent', 'APMC', 'payment bank'],
    helpline: '1800-270-0224'
  },

  {
    id: 'agri-infra-fund',
    name: 'AIF',
    full_name: 'Agriculture Infrastructure Fund',
    type: 'central',
    category: 'infrastructure',
    benefit: 'Loans up to ₹2 crore at 3% effective interest for cold storage, warehouse, processing unit. Credit guarantee also available.',
    benefit_amount: 20000000,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 1,
      max_land_acres: null,
      description: 'Individual farmers, FPOs, cooperatives, SHGs, startups for post-harvest and farm gate infrastructure like cold storage, warehouses, sorting units.'
    },
    documents: ['Aadhaar', 'PAN', 'Land/lease documents', 'Project report', 'Bank statement'],
    apply_link: 'https://agriinfra.dac.gov.in',
    apply_steps: [
      'Register at agriinfra.dac.gov.in',
      'Prepare a simple project report for your infrastructure plan',
      'Apply through the portal — bank will be assigned for processing',
      'Bank appraisal + Credit guarantee from CGTMSE',
      '3% interest subvention credited annually to your account'
    ],
    deadline: 'Ongoing scheme till March 2032',
    tags: ['cold storage', 'warehouse', 'loan', '3%', 'infrastructure', 'processing'],
    helpline: '1800-180-1551'
  },

  {
    id: 'rkvy',
    name: 'RKVY',
    full_name: 'Rashtriya Krishi Vikas Yojana',
    type: 'central',
    category: 'development',
    benefit: 'Grants for farm mechanization, irrigation, seeds, post-harvest. State implements — contact state agriculture dept for current components.',
    benefit_amount: null,
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    last_updated: '2025-01',
    eligibility: {
      states: ['all'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0,
      max_land_acres: null,
      description: 'All farmers. Scheme implemented through state agriculture departments. Benefits vary by state component.'
    },
    documents: ['Aadhaar', 'Land records', 'Bank account'],
    apply_link: 'https://rkvy.nic.in',
    apply_steps: [
      'Contact your state agriculture department or district agriculture office',
      'Ask about current RKVY components active in your district',
      'Apply through the state portal or offline at district office',
      'Benefits vary — seeds, machinery, training, infrastructure support available'
    ],
    deadline: 'Check with state agriculture department',
    tags: ['development', 'grants', 'mechanization', 'seeds', 'training'],
    helpline: '1800-180-1551'
  },

  // ═══════════════════════════════════════════════════════════════
  //  KARNATAKA STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'ka-raitha-siri',
    name: 'Raitha Siri',
    full_name: 'Karnataka Raitha Siri Scheme 2025',
    type: 'state',
    state: 'Karnataka',
    category: 'income_support',
    benefit: '₹10,000 per hectare (₹4,047/acre) to millet farmers as direct cash. Plus ₹250/acre diesel subsidy under Raitha Shakti.',
    benefit_amount: 10000,
    ministry: 'Department of Agriculture, Government of Karnataka',
    last_updated: '2025-01',
    eligibility: {
      states: ['Karnataka'],
      crops: ['Jowar', 'Bajra', 'Ragi', 'Millets'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 0.5,
      max_land_acres: 12,
      description: 'Karnataka farmers growing millets (Ragi, Jowar, Bajra etc). Must be registered on FRUITS portal. BPL preference.'
    },
    documents: ['Aadhaar', 'RTC (land record from Bhoomi)', 'Bank passbook', 'FRUITS registration ID', 'Caste certificate if applicable'],
    apply_link: 'https://raitamitra.karnataka.gov.in',
    apply_steps: [
      'Register on FRUITS portal at fruits.karnataka.gov.in (one-time)',
      'Visit your nearest Raitha Samparka Kendra (RSK) with RTC and Aadhaar',
      'Submit application for Raitha Siri to Agriculture Extension Officer (AEO)',
      'AEO verifies your millet crop with field visit',
      'Amount transferred via DBT to your Aadhaar-linked bank account'
    ],
    deadline: 'Apply June-August before Kharif sowing. Check RSK for exact dates.',
    tags: ['Karnataka', 'millet', 'ragi', 'jowar', 'income', 'DBT'],
    helpline: '080-22212121'
  },

  {
    id: 'ka-krishi-bhagya',
    name: 'Krishi Bhagya',
    full_name: 'Karnataka Krishi Bhagya Scheme',
    type: 'state',
    state: 'Karnataka',
    category: 'water_conservation',
    benefit: 'Farm pond subsidy up to ₹1.5 lakh + pump set + drip irrigation all covered. Total benefit worth ₹3-4 lakh for dry land farmers.',
    benefit_amount: 150000,
    ministry: 'Department of Agriculture, Government of Karnataka',
    last_updated: '2025-01',
    eligibility: {
      states: ['Karnataka'],
      crops: ['dry land crops'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 1,
      max_land_acres: 12,
      description: 'Dry land farmers in Karnataka. Land must be in a drought-prone or rain-fed area. 1-12 acres ownership.'
    },
    documents: ['Aadhaar', 'RTC (from Bhoomi)', 'Bank passbook', 'Caste certificate if applicable'],
    apply_link: 'https://raitamitra.karnataka.gov.in',
    apply_steps: [
      'Visit your nearest Raitha Samparka Kendra (RSK)',
      'Meet the Agriculture Extension Officer with RTC and Aadhaar',
      'Application submitted and site inspection done by AEO',
      'Approval from District Agriculture Officer',
      'Work begins after approval. Subsidy paid in 2 installments.'
    ],
    deadline: 'Apply June-July before Kharif. Budget limited — apply early.',
    tags: ['Karnataka', 'farm pond', 'water', 'dry land', 'subsidy', 'drip irrigation'],
    helpline: '080-22212121'
  },

  {
    id: 'ka-surya-raitha',
    name: 'Surya Raitha',
    full_name: 'Karnataka Surya Raitha Solar Pump Scheme',
    type: 'state',
    state: 'Karnataka',
    category: 'solar',
    benefit: 'Solar pump replacing diesel pump. Sell excess power to BESCOM/MESCOM for extra income. Farmer pays only 10% cost.',
    benefit_amount: null,
    ministry: 'Department of Agriculture / KREDL, Government of Karnataka',
    last_updated: '2025-01',
    eligibility: {
      states: ['Karnataka'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'Karnataka farmers with existing pump irrigation or new irrigation need. Preference to farmers replacing diesel pumps.'
    },
    documents: ['Aadhaar', 'RTC', 'Existing pump details', 'Bank account', 'BESCOM/MESCOM consumer number if available'],
    apply_link: 'https://raitamitra.karnataka.gov.in',
    apply_steps: [
      'Apply at KREDL (Karnataka Renewable Energy Development Ltd) or BESCOM office',
      'Or apply through Raitha Samparka Kendra',
      'Site inspection to assess solar potential',
      '90% cost covered (30% central + 30% state + 30% loan)',
      'Farmer pays 10%. Solar pump installed within 3-4 months.'
    ],
    deadline: 'Rolling applications. Limited annual quota — apply early.',
    tags: ['Karnataka', 'solar', 'pump', 'BESCOM', 'free electricity', 'subsidy'],
    helpline: '1800-425-9339'
  },

  {
    id: 'ka-raitha-shakti',
    name: 'Raitha Shakti',
    full_name: 'Karnataka Raitha Shakti Diesel Subsidy Scheme',
    type: 'state',
    state: 'Karnataka',
    category: 'input_subsidy',
    benefit: '₹250 diesel subsidy per acre of agricultural land for running diesel farm equipment.',
    benefit_amount: 250,
    ministry: 'Department of Agriculture, Government of Karnataka',
    last_updated: '2025-01',
    eligibility: {
      states: ['Karnataka'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'All Karnataka farmers using diesel-powered farm equipment. Must be registered on FRUITS portal.'
    },
    documents: ['Aadhaar', 'RTC', 'FRUITS ID', 'Bank account'],
    apply_link: 'https://fruits.karnataka.gov.in',
    apply_steps: [
      'Register or login to FRUITS portal at fruits.karnataka.gov.in',
      'Look for Raitha Shakti Yojana in the scheme list',
      'Fill in your land details and equipment details',
      'Submit — amount credited to bank via DBT'
    ],
    deadline: 'Check FRUITS portal for current season dates',
    tags: ['Karnataka', 'diesel', 'subsidy', 'equipment', 'machinery'],
    helpline: '080-22212121'
  },

  // ═══════════════════════════════════════════════════════════════
  //  MAHARASHTRA STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'mh-mahadbt-agri',
    name: 'MahaDBT Agriculture',
    full_name: 'Maharashtra DBT Agriculture Schemes Portal',
    type: 'state',
    state: 'Maharashtra',
    category: 'subsidy',
    benefit: '35-50% subsidy on drip irrigation, farm pond, poly house, seed treatment equipment. Apply all Maharashtra schemes from one portal.',
    benefit_amount: null,
    ministry: 'Department of Agriculture, Government of Maharashtra',
    last_updated: '2025-01',
    eligibility: {
      states: ['Maharashtra'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'All Maharashtra farmers. Register on MahaDBT portal to access all state agriculture schemes through single window.'
    },
    documents: ['Aadhaar', '7/12 extract', 'Bank passbook', 'Satbara (land record)'],
    apply_link: 'https://mahadbt.maharashtra.gov.in',
    apply_steps: [
      'Register at mahadbt.maharashtra.gov.in with Aadhaar',
      'Login and go to "Agriculture Department" schemes',
      'Select the scheme you want (drip, farm pond, etc.)',
      'Upload 7/12 extract and other documents',
      'Inspector verifies and subsidy credited to bank'
    ],
    deadline: 'Most schemes open April-June. Check portal for current open applications.',
    tags: ['Maharashtra', 'subsidy', 'drip', 'poly house', 'farm pond', 'single window'],
    helpline: '1800-120-8040'
  },

  {
    id: 'mh-gopinath-munde',
    name: 'Gopinath Munde Shetkari Insurance',
    full_name: 'Gopinath Munde Shetkari Apghat Vima Yojana',
    type: 'state',
    state: 'Maharashtra',
    category: 'insurance',
    benefit: '₹2 lakh accidental death insurance for all Maharashtra farmers and agricultural laborers. Premium paid fully by state government.',
    benefit_amount: 200000,
    ministry: 'Relief & Rehabilitation Department, Government of Maharashtra',
    last_updated: '2025-01',
    eligibility: {
      states: ['Maharashtra'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0,
      max_land_acres: null,
      description: 'All farmers and agriculture laborers of Maharashtra aged 10-75 years. Premium fully paid by Maharashtra government — completely free for farmers.'
    },
    documents: ['Aadhaar', 'Death certificate (for claim)', 'Police FIR (for accidental death claim)', 'Bank account details of nominee'],
    apply_link: 'https://aaplesarkar.mahaonline.gov.in',
    apply_steps: [
      'This scheme is AUTO-ENROLLED — no application needed',
      'All Maharashtra farmers are automatically covered',
      'For claim: visit District Collector office within 30 days of accident',
      'Submit FIR, death certificate and Aadhaar of deceased',
      'Claim processed within 30 days to nominee\'s bank account'
    ],
    deadline: 'Auto-enrolled. Claim within 30 days of accident.',
    tags: ['Maharashtra', 'insurance', 'accidental', 'free', 'death', 'auto enrolled'],
    helpline: '1800-120-8040'
  },

  {
    id: 'mh-nanaji-deshmukh',
    name: 'Nanaji Deshmukh Krishi Sanjivani',
    full_name: 'Nanaji Deshmukh Krishi Sanjivani Project',
    type: 'state',
    state: 'Maharashtra',
    category: 'climate',
    benefit: 'Climate-resilient farming support — free soil testing, water budget, alternative crops, drip irrigation, crop diversification in drought-prone areas.',
    benefit_amount: null,
    ministry: 'Agriculture Department, Government of Maharashtra',
    last_updated: '2025-01',
    eligibility: {
      states: ['Maharashtra'],
      crops: ['all'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 0.5,
      max_land_acres: 10,
      description: 'Small and marginal farmers in drought-prone districts of Vidarbha, Marathwada and Nashik division. 15 districts covered.'
    },
    documents: ['Aadhaar', '7/12 extract', 'Bank account'],
    apply_link: 'https://mahadbt.maharashtra.gov.in',
    apply_steps: [
      'Check if your district is covered (Vidarbha, Marathwada, Nashik division)',
      'Contact District Agriculture Officer or Block Agriculture Officer',
      'Register on MahaDBT portal and apply under Krishi Sanjivani',
      'Project team will visit your farm for needs assessment'
    ],
    deadline: 'Ongoing World Bank funded project till 2025',
    tags: ['Maharashtra', 'drought', 'climate', 'Vidarbha', 'Marathwada', 'water'],
    helpline: '1800-120-8040'
  },

  // ═══════════════════════════════════════════════════════════════
  //  PUNJAB STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'pb-crop-diversification',
    name: 'Crop Diversification',
    full_name: 'Punjab Crop Diversification Promotion Scheme',
    type: 'state',
    state: 'Punjab',
    category: 'crop_change',
    benefit: '₹7,000 per acre incentive to switch from paddy to maize, pulses or cotton. Saves groundwater. Punjab govt pays directly.',
    benefit_amount: 7000,
    ministry: 'Department of Agriculture, Government of Punjab',
    last_updated: '2025-01',
    eligibility: {
      states: ['Punjab'],
      crops: ['Maize', 'Cotton', 'Pulses', 'Vegetables'],
      farmer_type: ['all'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'All Punjab farmers willing to shift from paddy cultivation to alternative crops in designated blocks.'
    },
    documents: ['Aadhaar', 'Land records (Jamabandi)', 'Bank passbook'],
    apply_link: 'https://agripb.gov.in',
    apply_steps: [
      'Contact your Block Agriculture Officer (BAO) before Kharif sowing (May)',
      'Register your field and declare crop change plan',
      'Sow the alternative crop in declared field',
      'BAO verifies through field visit after sowing',
      '₹7,000/acre credited to your bank after verification'
    ],
    deadline: 'Register before Kharif sowing — May-June',
    tags: ['Punjab', 'paddy', 'diversification', '7000', 'maize', 'groundwater'],
    helpline: '0172-2970082'
  },

  {
    id: 'pb-msp-paddy',
    name: 'Punjab MSP Paddy',
    full_name: 'Punjab Paddy Procurement at MSP',
    type: 'state',
    state: 'Punjab',
    category: 'marketing',
    benefit: 'Guaranteed purchase of all paddy at MSP (₹2,300/quintal for Common, ₹2,320 for Grade A in 2024-25). No need to sell to traders.',
    benefit_amount: null,
    ministry: 'Punjab Mandi Board / PUNSUP / Food & Civil Supplies',
    last_updated: '2025-01',
    eligibility: {
      states: ['Punjab'],
      crops: ['Paddy'],
      farmer_type: ['all'],
      min_land_acres: 0,
      max_land_acres: null,
      description: 'All Punjab farmers growing paddy. Must register on J-form (Mandi Board). Payment within 72 hours of procurement.'
    },
    documents: ['Aadhaar', 'Bank account', 'Khasra Girdawari (crop verification)', 'J-form registration'],
    apply_link: 'https://anaajkharid.in',
    apply_steps: [
      'Register on anaajkharid.in portal or visit nearest grain market (Mandi)',
      'Get J-form from Patwari showing your crop sown',
      'Bring produce to nearest registered Mandi in October-November',
      'Produce weighed and quality checked — payment within 72 hours to bank',
      'No deductions, no middlemen — full MSP price guaranteed'
    ],
    deadline: 'Kharif procurement: October-January. Register before harvest.',
    tags: ['Punjab', 'paddy', 'MSP', 'guaranteed price', 'procurement'],
    helpline: '0172-2220087'
  },

  // ═══════════════════════════════════════════════════════════════
  //  ANDHRA PRADESH STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'ap-rythubandhu',
    name: 'YSR Rythu Bharosa',
    full_name: 'YSR Rythu Bharosa — PM Kisan (AP Component)',
    type: 'state',
    state: 'Andhra Pradesh',
    category: 'income_support',
    benefit: '₹13,500 per year per acre (₹7,500 from state + ₹6,000 from PM-KISAN). Best income support scheme in India.',
    benefit_amount: 13500,
    ministry: 'Department of Agriculture, Government of Andhra Pradesh',
    last_updated: '2025-01',
    eligibility: {
      states: ['Andhra Pradesh'],
      crops: ['all'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 0.1,
      max_land_acres: 5,
      description: 'Small and marginal farmers of Andhra Pradesh. State gives ₹7,500/acre on top of PM-KISAN ₹6,000 flat. Registered with AP Agriculture Dept.'
    },
    documents: ['Aadhaar', 'Land records (Pahani)', 'Bank account linked to Aadhaar', 'Mobile number'],
    apply_link: 'https://apagrisnet.ap.gov.in',
    apply_steps: [
      'Visit nearest Village Agriculture Assistant (VAA) or Rythu Bharosa Centre',
      'Or apply at village secretariat with Aadhaar and land documents',
      'State component of ₹7,500/acre is auto-enrolled for registered farmers',
      'Also apply for PM-KISAN to get additional ₹6,000/year',
      'Amount credited twice a year to bank account'
    ],
    deadline: 'Rolling — new farmers can register anytime at village secretariat',
    tags: ['Andhra Pradesh', 'income', '13500', 'per acre', 'best scheme'],
    helpline: '1902'
  },

  // ═══════════════════════════════════════════════════════════════
  //  TELANGANA STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'tg-rythu-bandhu',
    name: 'Rythu Bandhu',
    full_name: 'Telangana Rythu Bandhu Investment Support Scheme',
    type: 'state',
    state: 'Telangana',
    category: 'income_support',
    benefit: '₹10,000 per acre per year (₹5,000 Kharif + ₹5,000 Rabi). Direct cash before sowing season. No conditions.',
    benefit_amount: 10000,
    ministry: 'Department of Agriculture, Government of Telangana',
    last_updated: '2025-01',
    eligibility: {
      states: ['Telangana'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0.1,
      max_land_acres: null,
      description: 'All land-owning farmers of Telangana. Per-acre scheme — more land = more benefit. Auto-enrolled based on land records.'
    },
    documents: ['Aadhaar', 'Pahani (land record)', 'Bank account linked to Aadhaar'],
    apply_link: 'https://rythu.telangana.gov.in',
    apply_steps: [
      'Auto-enrolled if your land records are updated in Dharani portal',
      'Ensure Pahani (land record) is in your name and linked to Aadhaar',
      'Visit nearest Village Revenue Officer (VRO) if not receiving amount',
      'Amount credited before Kharif (May) and Rabi (November) seasons',
      'Check status at rythu.telangana.gov.in using Aadhaar'
    ],
    deadline: 'Auto-enrolled. Payments in May and November each year.',
    tags: ['Telangana', 'per acre', '10000', 'auto enrolled', 'Kharif', 'Rabi'],
    helpline: '040-23456425'
  },

  // ═══════════════════════════════════════════════════════════════
  //  TAMIL NADU STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'tn-uzhavar-sandhai',
    name: 'Uzhavar Sandhai',
    full_name: 'Tamil Nadu Uzhavar Sandhai (Farmer Market) Scheme',
    type: 'state',
    state: 'Tamil Nadu',
    category: 'marketing',
    benefit: 'Sell directly to consumers at government-run farmer markets. Get retail price instead of wholesale. No commission.',
    benefit_amount: null,
    ministry: 'Department of Agriculture, Government of Tamil Nadu',
    last_updated: '2025-01',
    eligibility: {
      states: ['Tamil Nadu'],
      crops: ['vegetables', 'fruits', 'flowers'],
      farmer_type: ['all'],
      min_land_acres: 0,
      max_land_acres: null,
      description: 'Tamil Nadu farmers growing vegetables, fruits or flowers. 225+ Uzhavar Sandhai outlets across the state. Apply for stall allotment.'
    },
    documents: ['Aadhaar', 'Land records or lease agreement', 'Bank account'],
    apply_link: 'https://www.tn.gov.in/scheme/data_view/3063',
    apply_steps: [
      'Contact nearest Agriculture Department office or Uzhavar Sandhai manager',
      'Apply for stall allotment with land records',
      'Bring fresh produce every morning — sell directly to consumers',
      'No commission charged. Full sale price goes to farmer.',
      'Open 365 days — consistent market access all year'
    ],
    deadline: 'Rolling — apply for stall anytime at nearest outlet',
    tags: ['Tamil Nadu', 'direct sell', 'vegetables', 'no commission', 'retail price'],
    helpline: '044-28521951'
  },

  {
    id: 'tn-crop-insurance',
    name: 'TN Crop Insurance',
    full_name: 'Tamil Nadu Chief Minister\'s Comprehensive Crop Insurance Scheme',
    type: 'state',
    state: 'Tamil Nadu',
    category: 'insurance',
    benefit: 'Free crop insurance — full premium paid by Tamil Nadu government. Compensation for crop loss due to natural calamity.',
    benefit_amount: null,
    ministry: 'Department of Agriculture, Government of Tamil Nadu',
    last_updated: '2025-01',
    eligibility: {
      states: ['Tamil Nadu'],
      crops: ['Paddy', 'Groundnut', 'Maize', 'Cotton', 'Sunflower', 'Sugarcane'],
      farmer_type: ['all'],
      min_land_acres: 0.1,
      max_land_acres: null,
      description: 'All Tamil Nadu farmers growing notified crops. Premium fully paid by state government — farmer pays nothing.'
    },
    documents: ['Aadhaar', 'Land records (patta)', 'Bank account'],
    apply_link: 'https://www.tn.gov.in/dept/agri',
    apply_steps: [
      'Auto-enrolled for farmers with crop loans from cooperative banks',
      'Non-loanee farmers apply at nearest Agriculture Extension Centre',
      'Submit land records and crop details before sowing',
      'Premium 100% paid by TN government — zero cost to farmer',
      'Claim filed within 15 days of crop loss'
    ],
    deadline: 'Apply before sowing. Check agriculture department for season dates.',
    tags: ['Tamil Nadu', 'free', 'insurance', 'no premium', 'crop loss'],
    helpline: '044-28521951'
  },

  // ═══════════════════════════════════════════════════════════════
  //  MADHYA PRADESH STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'mp-mukhyamantri-kisan',
    name: 'CM Kisan Kalyan',
    full_name: 'MP Mukhyamantri Kisan Kalyan Yojana',
    type: 'state',
    state: 'Madhya Pradesh',
    category: 'income_support',
    benefit: '₹4,000 per year additional income support from MP state on top of PM-KISAN ₹6,000. Total ₹10,000/year.',
    benefit_amount: 4000,
    ministry: 'Department of Agriculture, Government of Madhya Pradesh',
    last_updated: '2025-01',
    eligibility: {
      states: ['Madhya Pradesh'],
      crops: ['all'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 0.1,
      max_land_acres: null,
      description: 'All PM-KISAN beneficiaries of Madhya Pradesh automatically get this scheme. If PM-KISAN enrolled, you are enrolled here too.'
    },
    documents: ['Same as PM-KISAN — Aadhaar, land records, bank account'],
    apply_link: 'https://saara.mp.gov.in',
    apply_steps: [
      'If already enrolled in PM-KISAN, you are automatically enrolled',
      'If not enrolled, apply for PM-KISAN first at pmkisan.gov.in',
      'State component of ₹4,000 paid in 2 installments of ₹2,000',
      'Paid in August and March directly to bank account'
    ],
    deadline: 'Auto-enrolled with PM-KISAN. No separate application needed.',
    tags: ['Madhya Pradesh', 'income', '4000', 'auto enrolled', 'PM-KISAN'],
    helpline: '0755-2700803'
  },

  // ═══════════════════════════════════════════════════════════════
  //  GUJARAT STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'gj-ikhedut',
    name: 'iKhedut Portal',
    full_name: 'Gujarat iKhedut — One Stop Agriculture Scheme Portal',
    type: 'state',
    state: 'Gujarat',
    category: 'subsidy',
    benefit: 'Single portal for 100+ Gujarat agriculture schemes — drip irrigation 50% subsidy, tractor 50% subsidy, greenhouse, seeds, storage and more.',
    benefit_amount: null,
    ministry: 'Agriculture & Farmers Welfare Department, Government of Gujarat',
    last_updated: '2025-01',
    eligibility: {
      states: ['Gujarat'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0.5,
      max_land_acres: null,
      description: 'All Gujarat farmers. Register on iKhedut portal to apply for any of 100+ schemes. Single registration, multiple schemes.'
    },
    documents: ['Aadhaar', '8A (land record)', 'Bank passbook', 'Caste certificate if applicable'],
    apply_link: 'https://ikhedut.gujarat.gov.in',
    apply_steps: [
      'Visit ikhedut.gujarat.gov.in — one portal for all Gujarat agriculture schemes',
      'Register with Aadhaar and land record number (8A number)',
      'Browse available schemes and check eligibility',
      'Apply for up to 5 schemes in one year',
      'Track status online and receive subsidy via DBT'
    ],
    deadline: 'Most schemes open April-September. Check portal for current open schemes.',
    tags: ['Gujarat', 'single portal', 'drip', 'tractor', 'subsidy', '100 schemes'],
    helpline: '1800-233-0150'
  },

  // ═══════════════════════════════════════════════════════════════
  //  RAJASTHAN STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'rj-tarbandi',
    name: 'Tarbandi Yojana',
    full_name: 'Rajasthan Mukhyamantri Khet Suraksha (Tarbandi) Yojana',
    type: 'state',
    state: 'Rajasthan',
    category: 'infrastructure',
    benefit: '50% subsidy (max ₹48,000) on fencing/tarbandi to protect farm from stray animals. Maximum 400 meters per farmer.',
    benefit_amount: 48000,
    ministry: 'Agriculture Department, Government of Rajasthan',
    last_updated: '2025-01',
    eligibility: {
      states: ['Rajasthan'],
      crops: ['all'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 1.5,
      max_land_acres: null,
      description: 'Small and marginal Rajasthan farmers with minimum 1.5 acres contiguous land. SC/ST farmers get priority.'
    },
    documents: ['Aadhaar', 'Jamabandi (land record)', 'Bank account', 'Caste certificate'],
    apply_link: 'https://rajkisan.rajasthan.gov.in',
    apply_steps: [
      'Apply online at rajkisan.rajasthan.gov.in or visit nearest e-Mitra kiosk',
      'Upload Jamabandi and Aadhaar',
      'Agriculture department officer visits for site inspection',
      'Purchase fencing material from approved vendor',
      'Upload completion photos — 50% subsidy credited to bank'
    ],
    deadline: 'Check rajkisan.rajasthan.gov.in for current year\'s open applications',
    tags: ['Rajasthan', 'fencing', 'stray animals', 'tarbandi', 'subsidy', 'farm protection'],
    helpline: '0141-2922614'
  },

  // ═══════════════════════════════════════════════════════════════
  //  HARYANA STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'hr-meri-fasal',
    name: 'Meri Fasal Mera Byora',
    full_name: 'Haryana Meri Fasal Mera Byora Portal',
    type: 'state',
    state: 'Haryana',
    category: 'marketing',
    benefit: 'Register crops and get guaranteed MSP procurement. Also unlocks crop insurance, disaster compensation, and all Haryana farm schemes.',
    benefit_amount: null,
    ministry: 'Agriculture & Farmers Welfare Department, Government of Haryana',
    last_updated: '2025-01',
    eligibility: {
      states: ['Haryana'],
      crops: ['all'],
      farmer_type: ['all'],
      min_land_acres: 0,
      max_land_acres: null,
      description: 'All Haryana farmers. Registration on this portal is MANDATORY to sell at MSP and to access any state scheme.'
    },
    documents: ['Aadhaar', 'Land record (Jamabandi)', 'Bank account', 'Mobile number'],
    apply_link: 'https://fasal.haryana.gov.in',
    apply_steps: [
      'Visit fasal.haryana.gov.in — mandatory for all Haryana farmers',
      'Register with Aadhaar and family ID (Parivar Pehchaan Patra)',
      'Enter your crop details, field number and area before each season',
      'This registration enables MSP procurement, insurance and disaster compensation',
      'Track your crops and payments on the same portal'
    ],
    deadline: 'Register before each season — Kharif (July 31), Rabi (November 30)',
    tags: ['Haryana', 'MSP', 'registration', 'mandatory', 'all schemes', 'single portal'],
    helpline: '1800-180-2060'
  },

  // ═══════════════════════════════════════════════════════════════
  //  UTTAR PRADESH STATE SCHEMES
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'up-kisan-karj-mafi',
    name: 'UP Kisan Rahat',
    full_name: 'Uttar Pradesh Kisan Rin Mochan (Loan Relief) Scheme',
    type: 'state',
    state: 'Uttar Pradesh',
    category: 'credit',
    benefit: 'Crop loan waiver up to ₹1 lakh for small and marginal farmers. Check beneficiary status online.',
    benefit_amount: 100000,
    ministry: 'Agriculture Department, Government of Uttar Pradesh',
    last_updated: '2025-01',
    eligibility: {
      states: ['Uttar Pradesh'],
      crops: ['all'],
      farmer_type: ['small', 'marginal'],
      min_land_acres: 0.1,
      max_land_acres: 5,
      description: 'Small and marginal UP farmers with crop loans from cooperative banks up to March 2016. Scheme implemented in phases.'
    },
    documents: ['Aadhaar', 'Land record (Khatauni)', 'Loan account details', 'Bank passbook'],
    apply_link: 'https://upkisankarjrahat.upsdc.gov.in',
    apply_steps: [
      'Check your eligibility at upkisankarjrahat.upsdc.gov.in',
      'Enter your Aadhaar or bank account number to check status',
      'If eligible, loan amount directly waived from your bank account',
      'Visit District Agriculture Office if facing issues'
    ],
    deadline: 'Ongoing — check portal for your district status',
    tags: ['Uttar Pradesh', 'loan waiver', 'debt relief', 'small farmers'],
    helpline: '0522-2204925'
  },

];

// All state names for filtering
const ALL_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir'
];

const CATEGORIES = [
  { id: 'income_support', label: 'Income Support' },
  { id: 'insurance', label: 'Crop Insurance' },
  { id: 'credit', label: 'Credit & Loans' },
  { id: 'irrigation', label: 'Irrigation' },
  { id: 'solar', label: 'Solar Energy' },
  { id: 'mechanization', label: 'Farm Machinery' },
  { id: 'marketing', label: 'Selling & Marketing' },
  { id: 'subsidy', label: 'Input Subsidy' },
  { id: 'soil', label: 'Soil Health' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'water_conservation', label: 'Water Conservation' },
  { id: 'crop_change', label: 'Crop Diversification' },
  { id: 'climate', label: 'Climate Resilience' },
  { id: 'development', label: 'Development Grants' },
];

// ─── GET /api/schemes ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { state, category, type, search, crop } = req.query;
  let result = [...SCHEMES];

  // State filter — show central schemes (all states) + state's own schemes
  if (state && state !== 'all') {
    result = result.filter(s =>
      s.eligibility.states.includes('all') ||
      s.eligibility.states.some(st => st.toLowerCase() === state.toLowerCase()) ||
      (s.state && s.state.toLowerCase() === state.toLowerCase())
    );
  }

  if (category) result = result.filter(s => s.category === category);
  if (type) result = result.filter(s => s.type === type);

  if (crop) {
    result = result.filter(s =>
      s.eligibility.crops.includes('all') ||
      s.eligibility.crops.some(c => c.toLowerCase().includes(crop.toLowerCase()))
    );
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.full_name.toLowerCase().includes(q) ||
      s.benefit.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: result.length, data: result });
});

// ─── GET /api/schemes/meta ─────────────────────────────────────────────────────
router.get('/meta', (req, res) => {
  res.json({ success: true, states: ALL_STATES, categories: CATEGORIES });
});

// ─── GET /api/schemes/:id ──────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const scheme = SCHEMES.find(s => s.id === req.params.id);
  if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
  res.json({ success: true, data: scheme });
});

// ─── POST /api/schemes/check-eligibility ──────────────────────────────────────
router.post('/check-eligibility', (req, res) => {
  const { state, land_acres, farmer_type, crops } = req.body;
  const eligible = SCHEMES.filter(s => {
    const stateOk = s.eligibility.states.includes('all') ||
      (s.state && s.state.toLowerCase() === (state || '').toLowerCase()) ||
      s.eligibility.states.some(st => st.toLowerCase() === (state || '').toLowerCase());
    const landOk = (!s.eligibility.min_land_acres || (land_acres || 0) >= s.eligibility.min_land_acres) &&
      (!s.eligibility.max_land_acres || (land_acres || 0) <= s.eligibility.max_land_acres);
    const typeOk = s.eligibility.farmer_type.includes('all') ||
      s.eligibility.farmer_type.includes(farmer_type || 'small');
    return stateOk && landOk && typeOk;
  });
  res.json({ success: true, count: eligible.length, data: eligible });
});

module.exports = router;
