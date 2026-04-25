const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// In-memory store (replace with MongoDB/PostgreSQL in production)
let JOBS = [
  {
    id: uuidv4(),
    title: 'Paddy Harvesting Workers Needed',
    farmer_name: 'Ramaiah Gowda',
    farmer_phone: '9876543210',
    village: 'Doddaballapur',
    district: 'Bangalore Rural',
    state: 'Karnataka',
    crop: 'Paddy',
    work_type: 'Harvesting',
    workers_needed: 8,
    workers_applied: 3,
    wage_per_day: 450,
    food_included: true,
    start_date: futureDate(3),
    end_date: futureDate(7),
    description: 'Need experienced paddy harvesting workers. Will provide meals twice a day. Transport from Doddaballapur bus stand available.',
    status: 'open',
    posted_at: new Date().toISOString(),
    applicants: []
  },
  {
    id: uuidv4(),
    title: 'Tomato Planting — 5 Workers',
    farmer_name: 'Suresh Patil',
    farmer_phone: '9765432109',
    village: 'Hubli',
    district: 'Dharwad',
    state: 'Karnataka',
    crop: 'Tomato',
    work_type: 'Planting',
    workers_needed: 5,
    workers_applied: 1,
    wage_per_day: 400,
    food_included: false,
    start_date: futureDate(1),
    end_date: futureDate(4),
    description: 'Tomato seedling transplanting work. Experience preferred but will train. Daily payment.',
    status: 'open',
    posted_at: new Date().toISOString(),
    applicants: []
  },
  {
    id: uuidv4(),
    title: 'Cotton Picking — 15 Workers Urgent',
    farmer_name: 'Vijay Deshmukh',
    farmer_phone: '9654321098',
    village: 'Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    crop: 'Cotton',
    work_type: 'Harvesting',
    workers_needed: 15,
    workers_applied: 7,
    wage_per_day: 500,
    food_included: true,
    start_date: futureDate(0),
    end_date: futureDate(10),
    description: 'Urgent cotton picking needed. Long-term work available for 10 days. Accommodation available for outstation workers.',
    status: 'open',
    posted_at: new Date().toISOString(),
    applicants: []
  }
];

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// GET /api/labour/jobs
router.get('/jobs', (req, res) => {
  const { state, district, work_type, crop } = req.query;
  let jobs = JOBS.filter(j => j.status === 'open');

  if (state) jobs = jobs.filter(j => j.state.toLowerCase().includes(state.toLowerCase()));
  if (district) jobs = jobs.filter(j => j.district.toLowerCase().includes(district.toLowerCase()));
  if (work_type) jobs = jobs.filter(j => j.work_type.toLowerCase() === work_type.toLowerCase());
  if (crop) jobs = jobs.filter(j => j.crop.toLowerCase().includes(crop.toLowerCase()));

  res.json({ success: true, count: jobs.length, data: jobs });
});

// POST /api/labour/jobs — post a new job
router.post('/jobs', (req, res) => {
  const { title, farmer_name, farmer_phone, village, district, state, crop,
    work_type, workers_needed, wage_per_day, food_included, start_date, end_date, description } = req.body;

  if (!farmer_name || !farmer_phone || !village || !state || !workers_needed || !wage_per_day || !start_date) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const job = {
    id: uuidv4(),
    title: title || `${work_type} workers needed in ${village}`,
    farmer_name, farmer_phone, village, district, state, crop,
    work_type, workers_needed: parseInt(workers_needed),
    workers_applied: 0,
    wage_per_day: parseInt(wage_per_day),
    food_included: Boolean(food_included),
    start_date, end_date, description,
    status: 'open',
    posted_at: new Date().toISOString(),
    applicants: []
  };

  JOBS.unshift(job);
  res.status(201).json({ success: true, data: job });
});

// POST /api/labour/jobs/:id/apply — worker applies for a job
router.post('/jobs/:id/apply', (req, res) => {
  const job = JOBS.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'open') return res.status(400).json({ error: 'Job is no longer accepting applications' });

  const { worker_name, worker_phone, workers_count, message } = req.body;
  if (!worker_name || !worker_phone) return res.status(400).json({ error: 'Name and phone required' });

  const application = {
    id: uuidv4(),
    worker_name, worker_phone,
    workers_count: parseInt(workers_count) || 1,
    message: message || '',
    applied_at: new Date().toISOString(),
    status: 'pending'
  };

  job.applicants.push(application);
  job.workers_applied = job.applicants.length;
  if (job.workers_applied >= job.workers_needed) job.status = 'filled';

  res.status(201).json({ success: true, message: `Application submitted! ${job.farmer_name} will contact you at ${worker_phone}`, data: application });
});

// GET /api/labour/work-types
router.get('/work-types', (req, res) => {
  res.json({ success: true, data: ['Harvesting', 'Planting', 'Weeding', 'Spraying', 'Irrigation', 'Land Preparation', 'Sorting & Packing', 'Transport'] });
});

module.exports = router;
