const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

let LISTINGS = [
  {
    id: uuidv4(),
    title: 'Mahindra 575 DI Tractor — Good Condition',
    category: 'equipment',
    sub_category: 'Tractor',
    price: 450000,
    is_negotiable: true,
    seller_name: 'Basavanna Reddy',
    seller_phone: '9876501234',
    village: 'Raichur',
    district: 'Raichur',
    state: 'Karnataka',
    description: '2018 model, 1200 hours running. All documents clear. Ready for immediate transfer. Selling due to upgrade.',
    condition: 'good',
    posted_at: new Date().toISOString(),
    status: 'available',
    views: 47,
    images: []
  },
  {
    id: uuidv4(),
    title: 'BT Cotton Seeds — 2 Acres Stock',
    category: 'seeds',
    sub_category: 'Cotton Seeds',
    price: 3200,
    is_negotiable: false,
    seller_name: 'Prakash Kulkarni',
    seller_phone: '9765012345',
    village: 'Gadag',
    district: 'Gadag',
    state: 'Karnataka',
    description: 'Genuine Bayer Bollgard-II BT Cotton seeds. Purchased extra, selling at cost price. Valid for this season.',
    condition: 'new',
    posted_at: new Date().toISOString(),
    status: 'available',
    views: 23,
    images: []
  },
  {
    id: uuidv4(),
    title: '2 Murrah Buffalo — High Milk Yield',
    category: 'livestock',
    sub_category: 'Buffalo',
    price: 85000,
    is_negotiable: true,
    seller_name: 'Mohan Das',
    seller_phone: '9654012345',
    village: 'Bidar',
    district: 'Bidar',
    state: 'Karnataka',
    description: 'Selling 2 Murrah buffaloes, each giving 12-14 litres per day. Vaccinated. Healthy. Shifting to dairy shed work.',
    condition: 'good',
    posted_at: new Date().toISOString(),
    status: 'available',
    views: 61,
    images: []
  },
  {
    id: uuidv4(),
    title: 'Drip Irrigation Set — 2 Acres Complete Kit',
    category: 'equipment',
    sub_category: 'Irrigation',
    price: 18000,
    is_negotiable: true,
    seller_name: 'Anitha Patel',
    seller_phone: '9543012345',
    village: 'Vijayapura',
    district: 'Vijayapura',
    state: 'Karnataka',
    description: 'Jain Irrigation drip set, used for 1 season. Complete kit for 2 acres — mainline, sub-main, drippers all included.',
    condition: 'good',
    posted_at: new Date().toISOString(),
    status: 'available',
    views: 38,
    images: []
  },
  {
    id: uuidv4(),
    title: 'Fresh Alphonso Mango — 500 kg Available',
    category: 'produce',
    sub_category: 'Fruits',
    price: 6000,
    price_unit: 'per quintal',
    is_negotiable: true,
    seller_name: 'Ganesh Naik',
    seller_phone: '9432012345',
    village: 'Ratnagiri',
    district: 'Ratnagiri',
    state: 'Maharashtra',
    description: 'Grade A Alphonso mangoes directly from farm. No middlemen. Minimum order 50 kg. Can arrange transport.',
    condition: 'new',
    posted_at: new Date().toISOString(),
    status: 'available',
    views: 89,
    images: []
  }
];

const CATEGORIES = [
  { id: 'equipment', label: 'Equipment & Machinery', sub: ['Tractor', 'Pump Set', 'Irrigation', 'Harvester', 'Sprayer', 'Other'] },
  { id: 'seeds', label: 'Seeds & Saplings', sub: ['Paddy Seeds', 'Cotton Seeds', 'Vegetable Seeds', 'Fruit Saplings', 'Other'] },
  { id: 'livestock', label: 'Livestock', sub: ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Other'] },
  { id: 'produce', label: 'Farm Produce', sub: ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Other'] },
  { id: 'land', label: 'Land for Lease/Sale', sub: ['Agricultural Land', 'Farm Lease', 'Warehouse'] },
  { id: 'other', label: 'Other Farm Items', sub: ['Fertilizer', 'Pesticide', 'Tools', 'Other'] }
];

// GET /api/marketplace
router.get('/', (req, res) => {
  const { category, state, district, search, min_price, max_price } = req.query;
  let listings = LISTINGS.filter(l => l.status === 'available');

  if (category) listings = listings.filter(l => l.category === category);
  if (state) listings = listings.filter(l => l.state.toLowerCase().includes(state.toLowerCase()));
  if (district) listings = listings.filter(l => l.district.toLowerCase().includes(district.toLowerCase()));
  if (min_price) listings = listings.filter(l => l.price >= parseInt(min_price));
  if (max_price) listings = listings.filter(l => l.price <= parseInt(max_price));
  if (search) {
    const q = search.toLowerCase();
    listings = listings.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.sub_category.toLowerCase().includes(q)
    );
  }

  listings = listings.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
  res.json({ success: true, count: listings.length, data: listings });
});

// GET /api/marketplace/categories
router.get('/categories', (req, res) => {
  res.json({ success: true, data: CATEGORIES });
});

// GET /api/marketplace/:id
router.get('/:id', (req, res) => {
  const listing = LISTINGS.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  listing.views += 1;
  res.json({ success: true, data: listing });
});

// POST /api/marketplace — create new listing
router.post('/', (req, res) => {
  const { title, category, sub_category, price, is_negotiable, seller_name,
    seller_phone, village, district, state, description, condition } = req.body;

  if (!title || !category || !price || !seller_name || !seller_phone || !state) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const listing = {
    id: uuidv4(),
    title, category, sub_category, price: parseInt(price),
    is_negotiable: Boolean(is_negotiable),
    seller_name, seller_phone, village, district, state,
    description, condition: condition || 'good',
    posted_at: new Date().toISOString(),
    status: 'available',
    views: 0,
    images: []
  };

  LISTINGS.unshift(listing);
  res.status(201).json({ success: true, data: listing });
});

// DELETE /api/marketplace/:id — mark as sold
router.patch('/:id/sold', (req, res) => {
  const listing = LISTINGS.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  listing.status = 'sold';
  res.json({ success: true, message: 'Marked as sold' });
});

module.exports = router;
