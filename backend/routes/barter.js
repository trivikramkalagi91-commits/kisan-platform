const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

let BARTER_LISTINGS = [
  { id: uuidv4(), farmer_name: 'Raju Patil', farmer_phone: '9876541230', village: 'Bijapur', district: 'Vijayapura', state: 'Karnataka', have_crop: 'Rice', have_quantity: 5, have_unit: 'quintal', want_crop: 'Wheat', want_quantity: 4, want_unit: 'quintal', description: 'Surplus Sona Masoori rice from this season. Looking for good quality wheat.', status: 'open', posted_at: new Date().toISOString() },
  { id: uuidv4(), farmer_name: 'Shanta Devi', farmer_phone: '9765412309', village: 'Gulbarga', district: 'Kalaburagi', state: 'Karnataka', have_crop: 'Toor Dal', have_quantity: 3, have_unit: 'quintal', want_crop: 'Jowar', want_quantity: 4, want_unit: 'quintal', description: 'Fresh toor dal this harvest. Need jowar for cattle feed and home use.', status: 'open', posted_at: new Date().toISOString() },
  { id: uuidv4(), farmer_name: 'Mohan Reddy', farmer_phone: '9654123098', village: 'Nandyal', district: 'Kurnool', state: 'Andhra Pradesh', have_crop: 'Groundnut', have_quantity: 10, have_unit: 'quintal', want_crop: 'Sunflower Seeds', want_quantity: 8, want_unit: 'quintal', description: 'Runner variety groundnut. Want sunflower seeds for next season planting.', status: 'open', posted_at: new Date().toISOString() },
  { id: uuidv4(), farmer_name: 'Priya Kumari', farmer_phone: '9543210987', village: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar', have_crop: 'Maize', have_quantity: 8, have_unit: 'quintal', want_crop: 'Rice', want_quantity: 5, want_unit: 'quintal', description: 'Yellow maize surplus from kharif season. Any good rice variety welcome.', status: 'open', posted_at: new Date().toISOString() },
  { id: uuidv4(), farmer_name: 'Suresh Gaikwad', farmer_phone: '9432109876', village: 'Solapur', district: 'Solapur', state: 'Maharashtra', have_crop: 'Soybean', have_quantity: 6, have_unit: 'quintal', want_crop: 'Chana Dal', want_quantity: 4, want_unit: 'quintal', description: 'Good quality soybean. Want chana dal for family consumption.', status: 'open', posted_at: new Date().toISOString() }
];

const CROPS = ['Rice','Wheat','Maize','Jowar','Bajra','Toor Dal','Chana Dal','Moong Dal','Groundnut','Sunflower Seeds','Cotton','Soybean','Mustard','Sugarcane','Potato','Onion','Tomato','Chilli','Turmeric','Ginger','Coconut','Banana'];
const UNITS = ['quintal', 'kg', 'tonne', 'bag (50kg)'];
const STATES = ['Karnataka','Maharashtra','Punjab','Andhra Pradesh','Tamil Nadu','Uttar Pradesh','Bihar','Rajasthan','Madhya Pradesh','Gujarat'];

router.get('/crops', (req, res) => res.json({ success: true, data: CROPS }));
router.get('/units', (req, res) => res.json({ success: true, data: UNITS }));
router.get('/states', (req, res) => res.json({ success: true, data: STATES }));

router.get('/', (req, res) => {
  const { state, have_crop, want_crop } = req.query;
  let listings = BARTER_LISTINGS.filter(l => l.status === 'open');
  if (state) listings = listings.filter(l => l.state.toLowerCase().includes(state.toLowerCase()));
  if (have_crop) listings = listings.filter(l => l.have_crop.toLowerCase().includes(have_crop.toLowerCase()));
  if (want_crop) listings = listings.filter(l => l.want_crop.toLowerCase().includes(want_crop.toLowerCase()));
  res.json({ success: true, count: listings.length, data: listings });
});

router.post('/', (req, res) => {
  const { farmer_name, farmer_phone, village, district, state, have_crop, have_quantity, have_unit, want_crop, want_quantity, want_unit, description } = req.body;
  if (!farmer_name || !farmer_phone || !state || !have_crop || !want_crop) return res.status(400).json({ error: 'Required fields missing' });
  const listing = { id: uuidv4(), farmer_name, farmer_phone, village, district, state, have_crop, have_quantity: parseFloat(have_quantity) || 1, have_unit: have_unit || 'quintal', want_crop, want_quantity: parseFloat(want_quantity) || 1, want_unit: want_unit || 'quintal', description: description || '', status: 'open', posted_at: new Date().toISOString() };
  BARTER_LISTINGS.unshift(listing);
  res.status(201).json({ success: true, data: listing });
});

router.patch('/:id/close', (req, res) => {
  const l = BARTER_LISTINGS.find(l => l.id === req.params.id);
  if (!l) return res.status(404).json({ error: 'Not found' });
  l.status = 'closed';
  res.json({ success: true });
});

module.exports = router;
