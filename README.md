# 🌾 Kisan Platform: Premium AI Ecosystem for Farmers

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/trivikramkalagi91-commits/kisan-platform)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/trivikramkalagi91-commits/kisan-platform&root-directory=frontend)

A state-of-the-art digital platform designed to empower farmers with AI-driven insights, real-time market data, and a unified government benefits dashboard.

## Modules included
- 📈 **Live Crop Prices** — Real-time mandi prices via AgMarknet, 30-day trend charts, price alerts
- 🏛️ **Government Schemes** — Central + state scheme finder with eligibility checker
- 👷 **Labour Hiring** — Post harvest jobs, workers apply directly, SMS-ready
- 🛒 **Farmer Marketplace** — Buy/sell equipment, seeds, livestock, produce — farmer to farmer.

---

## Project structure

```
kisan-platform/
├── backend/
│   ├── server.js              ← Express server entry point
│   ├── routes/
│   │   ├── cropPrices.js      ← /api/prices
│   │   ├── schemes.js         ← /api/schemes
│   │   ├── labour.js          ← /api/labour
│   │   └── marketplace.js     ← /api/marketplace
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             ← Routes + layout
│   │   ├── index.js           ← React entry point
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── CropPrices.js
│   │   │   ├── Schemes.js
│   │   │   ├── Labour.js
│   │   │   └── Marketplace.js
│   │   ├── utils/
│   │   │   └── api.js         ← All API calls in one place
│   │   └── styles/
│   │       └── global.css
│   ├── package.json
│   └── .env.example
└── package.json               ← Root scripts to run everything
```

---

## Setup — Step by step

### Step 1 — Install Node.js
Download and install from https://nodejs.org (choose LTS version)

Verify it works:
```bash
node --version   # should show v18 or higher
npm --version    # should show v9 or higher
```

### Step 2 — Install dependencies

```bash
# Go into the project folder
cd kisan-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3 — Set up environment files

```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

### Step 4 — Run the app

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd kisan-platform/backend
npm run dev
```
You should see: `Kisan Platform API running on port 5000`

**Terminal 2 — Frontend:**
```bash
cd kisan-platform/frontend
npm start
```
Browser will open at `http://localhost:3000` automatically.

---

## API Endpoints

### Crop Prices
```
GET /api/prices                        All prices
GET /api/prices?state=Karnataka        Filter by state
GET /api/prices?commodity=Tomato       Filter by crop
GET /api/prices/states                 List all states
GET /api/prices/commodities            List all crops
GET /api/prices/top?commodity=Tomato   Highest paying mandis
```

### Government Schemes
```
GET  /api/schemes                      All schemes
GET  /api/schemes?state=Karnataka      Filter by state
GET  /api/schemes?category=insurance   Filter by category
GET  /api/schemes/:id                  Single scheme detail
POST /api/schemes/check-eligibility    Check which schemes farmer qualifies for
     Body: { state, land_acres, farmer_type }
```

### Labour
```
GET  /api/labour/jobs                  All open jobs
GET  /api/labour/jobs?state=Karnataka  Filter by state
POST /api/labour/jobs                  Post a new job
POST /api/labour/jobs/:id/apply        Apply for a job
GET  /api/labour/work-types            List of work types
```

### Marketplace
```
GET   /api/marketplace                 All listings
GET   /api/marketplace?category=seeds  Filter by category
GET   /api/marketplace/:id             Single listing detail
POST  /api/marketplace                 Create new listing
PATCH /api/marketplace/:id/sold        Mark as sold
GET   /api/marketplace/categories      All categories
```

---

## Deploying to production (free)

### Backend — Railway.app (free tier)
1. Create account at https://railway.app
2. Connect your GitHub repo
3. Railway auto-detects Node.js and deploys
4. Set environment variables in Railway dashboard
5. Get a live URL like `https://kisan-platform-api.railway.app`

### Frontend — Vercel (free)
1. Create account at https://vercel.com
2. Import your GitHub repo
3. Set root directory to `frontend`
4. Set `REACT_APP_API_URL` to your Railway backend URL
5. Deploy — get URL like `https://kisan-platform.vercel.app`

---

## Connecting real AgMarknet data

The app currently uses realistic mock data. To connect live government data:

1. Visit https://agmarknet.gov.in
2. The free data download is at: https://agmarknet.gov.in/PriceAndArrivals/CommodityWiseReport.aspx
3. For programmatic access, use the Data.gov.in API:
   - Register at https://data.gov.in
   - Search "AgMarknet" and get your API key
   - Replace the mock data in `backend/routes/cropPrices.js` with live API calls

---

## Adding a database (for production)

Currently data is stored in memory (resets on server restart).
For production, replace with MongoDB Atlas (free tier):

1. Create free account at https://www.mongodb.com/atlas
2. Install mongoose: `npm install mongoose` in backend
3. Replace the in-memory arrays in `labour.js` and `marketplace.js` with Mongoose models
4. Add your MongoDB connection string to `.env`

---

## What to build next (remaining 6 modules)

| Module | Complexity | What you need |
|--------|-----------|---------------|
| Barter System | Medium | Match farmers by location + crop |
| AI Crop Advisor | High | Soil API + OpenWeather + Claude AI |
| Fear Crusher | Medium | District data + YouTube videos |
| Learn Farming Videos | Low | YouTube Data API |
| Business Hub | Medium | Mudra/PMEGP scheme data |
| Finance Section | Low | Bank loan data |

---

## Tech stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 | Most popular, easy to find help |
| Routing | React Router v6 | Standard routing |
| Charts | Recharts | Easy price trend charts |
| HTTP client | Axios | Clean API calls |
| Backend | Node.js + Express | Fast, simple |
| Data | In-memory (→ MongoDB) | Easy to start, upgrade later |
| Styling | Plain CSS | No build complexity |

---

Built with ❤️ for Indian farmers. Free forever.
