const express = require('express');
const router = express.Router();

const LOAN_PRODUCTS = [
  { id: 'kcc-sbi', bank: 'State Bank of India', bank_short: 'SBI', type: 'Kisan Credit Card', interest_rate: 4, max_amount: 300000, tenure: '12 months revolving', processing_fee: 0, collateral: 'Land records', features: ['Withdraw anytime from ATM', 'Interest only on amount used', 'Free accidental insurance', 'Crop insurance included'], eligibility: 'All farmers with land records', apply_link: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card', documents: ['Aadhaar', 'PAN', 'Land records (RTC/Khata)', 'Bank passbook', '2 photos'], steps: ['Visit nearest SBI branch', 'Ask for KCC application form', 'Submit documents', 'Field verification by bank officer', 'Card issued in 14 days'] },
  { id: 'kcc-pnb', bank: 'Punjab National Bank', bank_short: 'PNB', type: 'Kisan Credit Card', interest_rate: 4, max_amount: 300000, tenure: '12 months revolving', processing_fee: 0, collateral: 'Land records', features: ['PM Fasal Bima included', 'Interest subvention from Govt', 'Flexible repayment after harvest', 'No prepayment penalty'], eligibility: 'All land-owning farmers', apply_link: 'https://pnbindia.in/agricultural-loans.html', documents: ['Aadhaar', 'PAN', 'Land records', 'Bank passbook', '2 photos'], steps: ['Visit PNB branch with documents', 'Fill KCC application', 'Bank verifies land records', 'Credit limit sanctioned', 'RuPay KCC card issued'] },
  { id: 'crop-nabard', bank: 'NABARD / Co-op Banks', bank_short: 'NABARD', type: 'Short Term Crop Loan', interest_rate: 7, max_amount: 1000000, tenure: '6-12 months', processing_fee: 0.5, collateral: 'Crop hypothecation', features: ['Higher loan amount than KCC', 'Refinance through co-op banks', 'Available in every district', 'Quick disbursal'], eligibility: 'All farmers including tenant farmers', apply_link: 'https://nabard.org', documents: ['Aadhaar', 'Land records or lease agreement', 'Bank account', 'Crop plan'], steps: ['Visit nearest District Co-operative Bank', 'Submit crop loan application', 'Provide land / lease details', 'Loan sanctioned based on crop and area', 'Amount disbursed to account'] },
  { id: 'agri-icici', bank: 'ICICI Bank', bank_short: 'ICICI', type: 'Agri Term Loan', interest_rate: 9.5, max_amount: 2000000, tenure: '3-7 years', processing_fee: 1, collateral: 'Land mortgage', features: ['Large amount for equipment purchase', 'Flexible EMI schedule', 'Holiday period during crop season', 'Online account management'], eligibility: 'Farmers with good credit score and land', apply_link: 'https://www.icicibank.com/business-banking/agri-banking', documents: ['Aadhaar', 'PAN', 'Land records', 'Income proof', 'Bank statement 6 months'], steps: ['Apply online or visit branch', 'Submit documents', 'Credit assessment', 'Land valuation', 'Loan disbursed in 7-10 days'] },
  { id: 'mudra-agri', bank: 'All Scheduled Banks', bank_short: 'MUDRA', type: 'PM Mudra Yojana (Agri)', interest_rate: 8.5, max_amount: 1000000, tenure: '3-5 years', processing_fee: 0, collateral: 'None (up to ₹10 lakh)', features: ['No collateral needed', 'For agri-allied activities', 'Dairy, poultry, fishery covered', 'Also covers farm equipment shops'], eligibility: 'Farmers starting agri business, no collateral needed', apply_link: 'https://www.mudra.org.in', documents: ['Aadhaar', 'PAN', 'Business plan', 'Bank account', '2 photos'], steps: ['Prepare simple business plan', 'Visit any bank or MFI', 'Apply for Kishore/Tarun Mudra', 'No collateral required', 'Loan in 7-14 days'] },
  { id: 'pm-agri-infra', bank: 'Multiple Banks', bank_short: 'AIF', type: 'Agri Infrastructure Fund', interest_rate: 3, max_amount: 20000000, tenure: '7 years', processing_fee: 0, collateral: 'Project asset', features: ['3% interest subvention from Govt', 'For cold storage, warehouses, processing', 'FPOs and individual farmers eligible', 'Credit guarantee available'], eligibility: 'FPOs, cooperatives, individual farmers for post-harvest infra', apply_link: 'https://agriinfra.dac.gov.in', documents: ['Aadhaar', 'PAN', 'Land / lease', 'Project report', 'Bank account'], steps: ['Prepare project report', 'Apply on agriinfra.dac.gov.in', 'Bank appraisal', 'Credit guarantee from CGTMSE', 'Loan sanctioned with 3% subvention'] }
];

const INSURANCE_PRODUCTS = [
  { id: 'pmfby', name: 'PM Fasal Bima Yojana', premium_pct: 1.5, coverage: 'Full crop value', covers: ['Drought', 'Flood', 'Hailstorm', 'Pest attack', 'Cyclone'], apply_link: 'https://pmfby.gov.in' },
  { id: 'rwbcis', name: 'Restructured Weather Based Crop Insurance', premium_pct: 2, coverage: 'Weather index based', covers: ['Deficit rainfall', 'Excess rainfall', 'Temperature extremes', 'Frost'], apply_link: 'https://pmfby.gov.in' },
  { id: 'unified', name: 'Unified Package Insurance', premium_pct: 2.5, coverage: 'Comprehensive farm package', covers: ['Crop loss', 'Equipment damage', 'Accidental death', 'Life cover', 'Student scholarship'], apply_link: 'https://agri-insurance.gov.in' }
];

router.get('/loans', (req, res) => {
  const { type, max_rate } = req.query;
  let loans = [...LOAN_PRODUCTS];
  if (type) loans = loans.filter(l => l.type.toLowerCase().includes(type.toLowerCase()));
  if (max_rate) loans = loans.filter(l => l.interest_rate <= parseFloat(max_rate));
  loans.sort((a, b) => a.interest_rate - b.interest_rate);
  res.json({ success: true, data: loans });
});

router.get('/loans/:id', (req, res) => {
  const loan = LOAN_PRODUCTS.find(l => l.id === req.params.id);
  if (!loan) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: loan });
});

router.get('/insurance', (req, res) => res.json({ success: true, data: INSURANCE_PRODUCTS }));

router.post('/emi-calculator', (req, res) => {
  const { principal, rate, months } = req.body;
  const r = rate / 12 / 100;
  const emi = r === 0 ? principal / months : Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
  const total = emi * months;
  const interest = total - principal;
  res.json({ success: true, data: { emi, total_payment: total, total_interest: interest, principal } });
});

module.exports = router;
