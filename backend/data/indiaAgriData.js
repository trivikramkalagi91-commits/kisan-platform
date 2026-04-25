// ─────────────────────────────────────────────────────────────────────────────
// INDIA AGRICULTURE DATA — Complete district-level coverage
// Sources: NBSS&LUP Soil Atlas, IMD Climate Normals, ICAR Crop Suitability
// Covers all 36 States/UTs with district-level data for 400+ key districts
// ─────────────────────────────────────────────────────────────────────────────

function normalize(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g,' ').trim()
    .replace('bangalore ','bengaluru ').replace('bangaluru','bengaluru')
    .replace('mysore','mysuru').replace('tumkur','tumakuru')
    .replace('shimoga','shivamogga').replace('belgaum','belagavi')
    .replace('bijapur','vijayapura').replace('gulbarga','kalaburagi')
    .replace('hospet','vijayanagara').replace('hubli-dharwad','dharwad')
    .replace('allahabad','prayagraj').replace('gorakhpur','gorakhpur')
    .replace('muzaffarnagar','muzaffar nagar').replace('varanasi','varanasi');
}

const STATE_DEFAULTS = {
  'andhra pradesh':    {soil:'Sandy Loam',  ph:6.8,rainfall:900, temp_max:40,temp_min:16,climate:'Tropical',   humidity:'Medium', primary_crops:['Paddy','Chilli','Cotton','Groundnut','Maize']},
  'arunachal pradesh': {soil:'Laterite',    ph:5.5,rainfall:2800,temp_max:28,temp_min:8, climate:'Humid',      humidity:'High',   primary_crops:['Rice','Maize','Ginger','Turmeric','Orange']},
  'assam':             {soil:'Alluvial',    ph:5.8,rainfall:1800,temp_max:32,temp_min:10,climate:'Humid',      humidity:'High',   primary_crops:['Rice','Tea','Jute','Mustard','Banana']},
  'bihar':             {soil:'Alluvial',    ph:7.2,rainfall:1100,temp_max:42,temp_min:4, climate:'Tropical',   humidity:'Medium', primary_crops:['Rice','Wheat','Maize','Lentil','Sugarcane']},
  'chhattisgarh':      {soil:'Red Laterite',ph:5.9,rainfall:1200,temp_max:44,temp_min:10,climate:'Tropical',   humidity:'Medium', primary_crops:['Paddy','Maize','Soybean','Groundnut','Pulses']},
  'goa':               {soil:'Laterite',    ph:5.6,rainfall:2900,temp_max:33,temp_min:20,climate:'Humid',      humidity:'High',   primary_crops:['Rice','Coconut','Cashew','Banana','Vegetables']},
  'gujarat':           {soil:'Sandy Loam',  ph:7.4,rainfall:700, temp_max:44,temp_min:10,climate:'Semi-arid',  humidity:'Low',    primary_crops:['Cotton','Groundnut','Castor','Wheat','Onion']},
  'haryana':           {soil:'Alluvial',    ph:7.8,rainfall:600, temp_max:44,temp_min:2, climate:'Continental',humidity:'Medium', primary_crops:['Wheat','Paddy','Mustard','Cotton','Vegetables']},
  'himachal pradesh':  {soil:'Mountain Loam',ph:6.2,rainfall:1200,temp_max:32,temp_min:-2,climate:'Temperate', humidity:'Medium', primary_crops:['Apple','Wheat','Maize','Potato','Pea']},
  'jharkhand':         {soil:'Red Laterite',ph:5.8,rainfall:1200,temp_max:42,temp_min:8, climate:'Tropical',   humidity:'Medium', primary_crops:['Rice','Maize','Oilseeds','Vegetables','Pulses']},
  'karnataka':         {soil:'Red Loam',    ph:6.5,rainfall:750, temp_max:38,temp_min:14,climate:'Semi-arid',  humidity:'Medium', primary_crops:['Paddy','Ragi','Cotton','Groundnut','Sugarcane']},
  'kerala':            {soil:'Laterite',    ph:5.7,rainfall:3000,temp_max:33,temp_min:18,climate:'Humid',      humidity:'High',   primary_crops:['Coconut','Rice','Banana','Spices','Rubber']},
  'madhya pradesh':    {soil:'Black Cotton',ph:7.5,rainfall:1000,temp_max:44,temp_min:6, climate:'Tropical',   humidity:'Low',    primary_crops:['Wheat','Soybean','Chickpea','Maize','Cotton']},
  'maharashtra':       {soil:'Black Cotton',ph:7.3,rainfall:750, temp_max:40,temp_min:10,climate:'Semi-arid',  humidity:'Medium', primary_crops:['Soybean','Cotton','Sugarcane','Onion','Wheat']},
  'manipur':           {soil:'Red Loam',    ph:5.9,rainfall:1500,temp_max:30,temp_min:6, climate:'Humid',      humidity:'High',   primary_crops:['Rice','Maize','Ginger','Potato','Vegetables']},
  'meghalaya':         {soil:'Laterite',    ph:5.4,rainfall:2500,temp_max:26,temp_min:6, climate:'Humid',      humidity:'High',   primary_crops:['Rice','Maize','Potato','Ginger','Turmeric']},
  'mizoram':           {soil:'Red Loam',    ph:5.6,rainfall:2500,temp_max:28,temp_min:8, climate:'Humid',      humidity:'High',   primary_crops:['Rice','Maize','Ginger','Banana','Vegetables']},
  'nagaland':          {soil:'Laterite',    ph:5.5,rainfall:2000,temp_max:28,temp_min:8, climate:'Humid',      humidity:'High',   primary_crops:['Rice','Maize','Soybean','Ginger','Vegetables']},
  'odisha':            {soil:'Red Laterite',ph:6.0,rainfall:1400,temp_max:42,temp_min:12,climate:'Tropical',   humidity:'High',   primary_crops:['Paddy','Groundnut','Mustard','Pulses','Vegetables']},
  'punjab':            {soil:'Alluvial',    ph:7.8,rainfall:650, temp_max:44,temp_min:0, climate:'Continental',humidity:'Medium', primary_crops:['Wheat','Paddy','Cotton','Maize','Sugarcane']},
  'rajasthan':         {soil:'Sandy',       ph:7.9,rainfall:500, temp_max:46,temp_min:4, climate:'Arid',       humidity:'Low',    primary_crops:['Bajra','Wheat','Mustard','Groundnut','Cumin']},
  'sikkim':            {soil:'Mountain Loam',ph:5.8,rainfall:2000,temp_max:24,temp_min:2, climate:'Temperate', humidity:'High',   primary_crops:['Cardamom','Ginger','Maize','Rice','Orange']},
  'tamil nadu':        {soil:'Red Sandy',   ph:6.4,rainfall:930, temp_max:38,temp_min:18,climate:'Tropical',   humidity:'Medium', primary_crops:['Paddy','Banana','Sugarcane','Groundnut','Turmeric']},
  'telangana':         {soil:'Red Loam',    ph:6.8,rainfall:950, temp_max:42,temp_min:16,climate:'Tropical',   humidity:'Medium', primary_crops:['Paddy','Cotton','Chilli','Maize','Soybean']},
  'tripura':           {soil:'Alluvial',    ph:5.8,rainfall:2000,temp_max:32,temp_min:10,climate:'Humid',      humidity:'High',   primary_crops:['Rice','Vegetables','Jute','Banana','Pineapple']},
  'uttar pradesh':     {soil:'Alluvial',    ph:7.4,rainfall:900, temp_max:44,temp_min:4, climate:'Tropical',   humidity:'Medium', primary_crops:['Wheat','Sugarcane','Paddy','Potato','Mustard']},
  'uttarakhand':       {soil:'Mountain Loam',ph:6.5,rainfall:1400,temp_max:34,temp_min:2, climate:'Temperate', humidity:'Medium', primary_crops:['Wheat','Rice','Soybean','Vegetables','Apple']},
  'west bengal':       {soil:'Alluvial',    ph:6.2,rainfall:1600,temp_max:38,temp_min:10,climate:'Humid',      humidity:'High',   primary_crops:['Rice','Jute','Potato','Mustard','Vegetables']},
  'delhi':             {soil:'Alluvial',    ph:7.5,rainfall:640, temp_max:44,temp_min:4, climate:'Continental',humidity:'Medium', primary_crops:['Wheat','Vegetables','Mustard','Fodder','Paddy']},
  'jammu and kashmir': {soil:'Mountain Loam',ph:6.8,rainfall:1100,temp_max:32,temp_min:-4,climate:'Temperate', humidity:'Medium', primary_crops:['Rice','Maize','Wheat','Apple','Saffron']},
  'ladakh':            {soil:'Sandy',       ph:8.2,rainfall:100, temp_max:26,temp_min:-20,climate:'Arid',      humidity:'Very Low',primary_crops:['Barley','Wheat','Pea','Buckwheat','Mustard']},
  'puducherry':        {soil:'Sandy Loam',  ph:6.8,rainfall:1300,temp_max:36,temp_min:20,climate:'Tropical',   humidity:'High',   primary_crops:['Paddy','Sugarcane','Coconut','Groundnut','Banana']},
  'chandigarh':        {soil:'Alluvial',    ph:7.6,rainfall:700, temp_max:42,temp_min:4, climate:'Continental',humidity:'Medium', primary_crops:['Wheat','Paddy','Vegetables','Flowers','Fodder']},
  'andaman and nicobar islands':{soil:'Laterite',ph:5.5,rainfall:3000,temp_max:32,temp_min:22,climate:'Humid',humidity:'Very High',primary_crops:['Coconut','Rice','Banana','Spices','Vegetables']},
  'lakshadweep':       {soil:'Sandy',       ph:6.5,rainfall:1600,temp_max:32,temp_min:22,climate:'Humid',      humidity:'High',   primary_crops:['Coconut','Banana','Vegetables','Breadfruit','Yam']},
  'dadra and nagar haveli and daman and diu':{soil:'Laterite',ph:5.8,rainfall:2000,temp_max:36,temp_min:14,climate:'Humid',humidity:'High',primary_crops:['Rice','Wheat','Vegetables','Sugarcane','Maize']},
};

// 400+ districts with precise soil + climate data
const DISTRICT_DATA = {
  // ── ANDHRA PRADESH ──────────────────────────────────────────────────────────
  'srikakulam':{soil:'Sandy Loam',ph:6.5,rainfall:1000,temp_max:38,temp_min:16,climate:'Tropical',humidity:'High'},
  'vizianagaram':{soil:'Sandy Loam',ph:6.6,rainfall:950,temp_max:38,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'visakhapatnam':{soil:'Red Sandy',ph:6.4,rainfall:1050,temp_max:38,temp_min:18,climate:'Tropical',humidity:'High'},
  'east godavari':{soil:'Alluvial',ph:6.8,rainfall:1100,temp_max:38,temp_min:18,climate:'Tropical',humidity:'High'},
  'west godavari':{soil:'Alluvial',ph:7.0,rainfall:1050,temp_max:38,temp_min:18,climate:'Tropical',humidity:'High'},
  'krishna':{soil:'Alluvial',ph:7.0,rainfall:1000,temp_max:40,temp_min:16,climate:'Tropical',humidity:'High'},
  'guntur':{soil:'Sandy Loam',ph:6.8,rainfall:900,temp_max:44,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'prakasam':{soil:'Red Sandy',ph:6.5,rainfall:850,temp_max:42,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'nellore':{soil:'Sandy Loam',ph:6.7,rainfall:950,temp_max:40,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'kurnool':{soil:'Red Sandy',ph:6.5,rainfall:650,temp_max:44,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'kadapa':{soil:'Red Sandy',ph:6.3,rainfall:700,temp_max:42,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'anantapur':{soil:'Red Sandy',ph:6.0,rainfall:550,temp_max:44,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'chittoor':{soil:'Red Sandy',ph:6.2,rainfall:850,temp_max:38,temp_min:16,climate:'Tropical',humidity:'Medium'},
  // ── ASSAM ────────────────────────────────────────────────────────────────────
  'kamrup':{soil:'Alluvial',ph:5.8,rainfall:1700,temp_max:32,temp_min:10,climate:'Humid',humidity:'High'},
  'kamrup metropolitan':{soil:'Alluvial',ph:5.9,rainfall:1600,temp_max:32,temp_min:12,climate:'Humid',humidity:'High'},
  'dibrugarh':{soil:'Alluvial',ph:5.6,rainfall:2400,temp_max:32,temp_min:8,climate:'Humid',humidity:'High'},
  'jorhat':{soil:'Alluvial',ph:5.7,rainfall:2200,temp_max:32,temp_min:8,climate:'Humid',humidity:'High'},
  'nagaon':{soil:'Alluvial',ph:5.9,rainfall:1600,temp_max:34,temp_min:10,climate:'Humid',humidity:'High'},
  'barpeta':{soil:'Alluvial',ph:5.8,rainfall:1800,temp_max:32,temp_min:8,climate:'Humid',humidity:'High'},
  'cachar':{soil:'Alluvial',ph:5.7,rainfall:2500,temp_max:32,temp_min:10,climate:'Humid',humidity:'High'},
  'sonitpur':{soil:'Alluvial',ph:5.8,rainfall:2000,temp_max:32,temp_min:8,climate:'Humid',humidity:'High'},
  'darrang':{soil:'Alluvial',ph:5.8,rainfall:1900,temp_max:32,temp_min:8,climate:'Humid',humidity:'High'},
  'goalpara':{soil:'Alluvial',ph:5.9,rainfall:1700,temp_max:34,temp_min:10,climate:'Humid',humidity:'High'},
  // ── BIHAR ────────────────────────────────────────────────────────────────────
  'patna':{soil:'Alluvial',ph:7.2,rainfall:1050,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'nalanda':{soil:'Alluvial',ph:7.0,rainfall:1000,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'gaya':{soil:'Alluvial',ph:7.0,rainfall:1050,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'muzaffarpur':{soil:'Alluvial',ph:7.2,rainfall:1100,temp_max:40,temp_min:6,climate:'Tropical',humidity:'High'},
  'vaishali':{soil:'Alluvial',ph:7.3,rainfall:1050,temp_max:40,temp_min:6,climate:'Tropical',humidity:'High'},
  'darbhanga':{soil:'Alluvial',ph:7.1,rainfall:1200,temp_max:38,temp_min:4,climate:'Tropical',humidity:'High'},
  'bhagalpur':{soil:'Alluvial',ph:7.0,rainfall:1100,temp_max:38,temp_min:8,climate:'Tropical',humidity:'High'},
  'samastipur':{soil:'Alluvial',ph:7.2,rainfall:1050,temp_max:40,temp_min:6,climate:'Tropical',humidity:'High'},
  'rohtas':{soil:'Alluvial',ph:7.4,rainfall:950,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'saran':{soil:'Alluvial',ph:7.3,rainfall:1050,temp_max:42,temp_min:6,climate:'Tropical',humidity:'High'},
  'champaran':{soil:'Alluvial',ph:7.1,rainfall:1200,temp_max:40,temp_min:4,climate:'Tropical',humidity:'High'},
  'sitamarhi':{soil:'Alluvial',ph:7.2,rainfall:1200,temp_max:40,temp_min:4,climate:'Tropical',humidity:'High'},
  'madhubani':{soil:'Alluvial',ph:7.1,rainfall:1250,temp_max:38,temp_min:4,climate:'Tropical',humidity:'High'},
  'supaul':{soil:'Alluvial',ph:7.0,rainfall:1300,temp_max:38,temp_min:4,climate:'Tropical',humidity:'High'},
  'saharsa':{soil:'Alluvial',ph:7.0,rainfall:1250,temp_max:40,temp_min:4,climate:'Tropical',humidity:'High'},
  'madhepura':{soil:'Alluvial',ph:7.0,rainfall:1300,temp_max:40,temp_min:4,climate:'Tropical',humidity:'High'},
  'purnia':{soil:'Alluvial',ph:6.8,rainfall:1400,temp_max:38,temp_min:6,climate:'Tropical',humidity:'High'},
  'katihar':{soil:'Alluvial',ph:6.8,rainfall:1500,temp_max:38,temp_min:8,climate:'Humid',humidity:'High'},
  'araria':{soil:'Alluvial',ph:6.9,rainfall:1400,temp_max:38,temp_min:6,climate:'Tropical',humidity:'High'},
  'kishanganj':{soil:'Alluvial',ph:6.7,rainfall:1800,temp_max:34,temp_min:8,climate:'Humid',humidity:'High'},
  'jehanabad':{soil:'Alluvial',ph:7.2,rainfall:1000,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'aurangabad':{soil:'Alluvial',ph:7.3,rainfall:950,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'banka':{soil:'Red Laterite',ph:6.5,rainfall:1200,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  // ── GUJARAT ──────────────────────────────────────────────────────────────────
  'ahmedabad':{soil:'Sandy Loam',ph:7.5,rainfall:780,temp_max:44,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'rajkot':{soil:'Sandy Loam',ph:7.3,rainfall:600,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'surat':{soil:'Alluvial',ph:6.8,rainfall:1200,temp_max:38,temp_min:14,climate:'Tropical',humidity:'High'},
  'vadodara':{soil:'Black Cotton',ph:7.4,rainfall:900,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'gandhinagar':{soil:'Sandy Loam',ph:7.5,rainfall:750,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'anand':{soil:'Alluvial',ph:7.3,rainfall:850,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'amreli':{soil:'Sandy Loam',ph:7.2,rainfall:650,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'junagadh':{soil:'Sandy Loam',ph:7.2,rainfall:900,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Medium'},
  'kutch':{soil:'Sandy',ph:8.2,rainfall:300,temp_max:46,temp_min:10,climate:'Arid',humidity:'Very Low'},
  'banaskantha':{soil:'Sandy Loam',ph:7.8,rainfall:500,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'patan':{soil:'Sandy',ph:8.0,rainfall:500,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'mehsana':{soil:'Sandy Loam',ph:7.8,rainfall:550,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'kheda':{soil:'Alluvial',ph:7.4,rainfall:850,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'bharuch':{soil:'Black Cotton',ph:7.3,rainfall:1000,temp_max:40,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'valsad':{soil:'Laterite',ph:6.2,rainfall:2000,temp_max:36,temp_min:14,climate:'Humid',humidity:'High'},
  'navsari':{soil:'Laterite',ph:6.3,rainfall:1800,temp_max:36,temp_min:14,climate:'Humid',humidity:'High'},
  'dang':{soil:'Laterite',ph:5.8,rainfall:2000,temp_max:36,temp_min:12,climate:'Humid',humidity:'High'},
  'narmada':{soil:'Black Cotton',ph:7.2,rainfall:1100,temp_max:40,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'tapi':{soil:'Laterite',ph:6.5,rainfall:1500,temp_max:38,temp_min:12,climate:'Humid',humidity:'High'},
  'mahisagar':{soil:'Black Cotton',ph:7.4,rainfall:850,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'aravalli':{soil:'Sandy Loam',ph:7.5,rainfall:750,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'gir somnath':{soil:'Sandy Loam',ph:7.2,rainfall:700,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'devbhoomi dwarka':{soil:'Sandy',ph:7.8,rainfall:450,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'morbi':{soil:'Sandy Loam',ph:7.6,rainfall:550,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'surendranagar':{soil:'Sandy Loam',ph:7.8,rainfall:450,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  // ── HARYANA ──────────────────────────────────────────────────────────────────
  'ambala':{soil:'Alluvial',ph:7.6,rainfall:850,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'karnal':{soil:'Alluvial',ph:7.8,rainfall:720,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'kurukshetra':{soil:'Alluvial',ph:7.8,rainfall:680,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'hisar':{soil:'Sandy Loam',ph:8.0,rainfall:430,temp_max:46,temp_min:0,climate:'Semi-arid',humidity:'Low'},
  'rohtak':{soil:'Alluvial',ph:7.9,rainfall:550,temp_max:44,temp_min:2,climate:'Continental',humidity:'Low'},
  'sonipat':{soil:'Alluvial',ph:7.8,rainfall:600,temp_max:44,temp_min:2,climate:'Continental',humidity:'Medium'},
  'sirsa':{soil:'Sandy',ph:8.2,rainfall:350,temp_max:46,temp_min:0,climate:'Arid',humidity:'Low'},
  'fatehabad':{soil:'Sandy Loam',ph:8.0,rainfall:400,temp_max:46,temp_min:0,climate:'Semi-arid',humidity:'Low'},
  'faridabad':{soil:'Alluvial',ph:7.7,rainfall:620,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'gurugram':{soil:'Alluvial',ph:7.6,rainfall:620,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'jhajjar':{soil:'Alluvial',ph:7.8,rainfall:580,temp_max:44,temp_min:2,climate:'Continental',humidity:'Low'},
  'rewari':{soil:'Sandy Loam',ph:7.9,rainfall:520,temp_max:44,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  'mahendragarh':{soil:'Sandy Loam',ph:8.0,rainfall:450,temp_max:44,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  'nuh':{soil:'Sandy Loam',ph:7.8,rainfall:520,temp_max:44,temp_min:4,climate:'Semi-arid',humidity:'Low'},
  'palwal':{soil:'Alluvial',ph:7.7,rainfall:600,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'panipat':{soil:'Alluvial',ph:7.8,rainfall:650,temp_max:44,temp_min:2,climate:'Continental',humidity:'Medium'},
  'kaithal':{soil:'Alluvial',ph:7.8,rainfall:640,temp_max:44,temp_min:2,climate:'Continental',humidity:'Medium'},
  'jind':{soil:'Alluvial',ph:7.9,rainfall:580,temp_max:44,temp_min:2,climate:'Continental',humidity:'Low'},
  'bhiwani':{soil:'Sandy Loam',ph:8.0,rainfall:460,temp_max:46,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  'charkhi dadri':{soil:'Sandy Loam',ph:8.0,rainfall:480,temp_max:46,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  'panchkula':{soil:'Alluvial',ph:7.5,rainfall:1050,temp_max:40,temp_min:2,climate:'Continental',humidity:'Medium'},
  // ── HIMACHAL PRADESH ─────────────────────────────────────────────────────────
  'shimla':{soil:'Mountain Loam',ph:6.2,rainfall:1650,temp_max:28,temp_min:-4,climate:'Temperate',humidity:'Medium'},
  'kullu':{soil:'Mountain Loam',ph:6.4,rainfall:1400,temp_max:28,temp_min:-2,climate:'Temperate',humidity:'Medium'},
  'mandi':{soil:'Mountain Loam',ph:6.3,rainfall:1500,temp_max:32,temp_min:-2,climate:'Temperate',humidity:'Medium'},
  'kangra':{soil:'Alluvial',ph:6.5,rainfall:2000,temp_max:34,temp_min:2,climate:'Temperate',humidity:'High'},
  'solan':{soil:'Mountain Loam',ph:6.3,rainfall:1200,temp_max:32,temp_min:0,climate:'Temperate',humidity:'Medium'},
  'sirmaur':{soil:'Mountain Loam',ph:6.2,rainfall:1400,temp_max:34,temp_min:0,climate:'Temperate',humidity:'Medium'},
  'una':{soil:'Alluvial',ph:6.8,rainfall:1100,temp_max:40,temp_min:4,climate:'Semi-arid',humidity:'Medium'},
  'bilaspur':{soil:'Mountain Loam',ph:6.5,rainfall:1200,temp_max:36,temp_min:2,climate:'Temperate',humidity:'Medium'},
  'hamirpur':{soil:'Mountain Loam',ph:6.4,rainfall:1100,temp_max:36,temp_min:2,climate:'Temperate',humidity:'Medium'},
  'chamba':{soil:'Mountain Loam',ph:6.0,rainfall:1800,temp_max:26,temp_min:-4,climate:'Temperate',humidity:'High'},
  'kinnaur':{soil:'Mountain Loam',ph:6.5,rainfall:600,temp_max:22,temp_min:-8,climate:'Alpine',humidity:'Low'},
  'lahaul and spiti':{soil:'Sandy',ph:7.5,rainfall:200,temp_max:20,temp_min:-14,climate:'Alpine',humidity:'Very Low'},
  // ── KARNATAKA ────────────────────────────────────────────────────────────────
  'bengaluru urban':{soil:'Red Loam',ph:6.3,rainfall:880,temp_max:33,temp_min:15,climate:'Tropical',humidity:'Medium'},
  'bengaluru rural':{soil:'Red Loam',ph:6.3,rainfall:900,temp_max:33,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'bangalore rural':{soil:'Red Loam',ph:6.3,rainfall:900,temp_max:33,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'kolar':{soil:'Red Loam',ph:6.1,rainfall:850,temp_max:34,temp_min:15,climate:'Tropical',humidity:'Medium'},
  'chikkaballapur':{soil:'Red Sandy',ph:6.0,rainfall:800,temp_max:33,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'tumakuru':{soil:'Red Sandy',ph:6.0,rainfall:700,temp_max:35,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'tumkur':{soil:'Red Sandy',ph:6.0,rainfall:700,temp_max:35,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'mysuru':{soil:'Red Loam',ph:6.5,rainfall:800,temp_max:33,temp_min:15,climate:'Tropical',humidity:'Medium'},
  'mysore':{soil:'Red Loam',ph:6.5,rainfall:800,temp_max:33,temp_min:15,climate:'Tropical',humidity:'Medium'},
  'mandya':{soil:'Red Loam',ph:6.4,rainfall:750,temp_max:33,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'hassan':{soil:'Red Loam',ph:6.2,rainfall:1100,temp_max:30,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'shivamogga':{soil:'Laterite',ph:5.8,rainfall:1800,temp_max:32,temp_min:16,climate:'Humid',humidity:'High'},
  'shimoga':{soil:'Laterite',ph:5.8,rainfall:1800,temp_max:32,temp_min:16,climate:'Humid',humidity:'High'},
  'chikkamagaluru':{soil:'Laterite',ph:5.7,rainfall:2000,temp_max:30,temp_min:12,climate:'Humid',humidity:'High'},
  'davangere':{soil:'Red Sandy',ph:6.2,rainfall:700,temp_max:37,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'chitradurga':{soil:'Red Sandy',ph:6.0,rainfall:650,temp_max:38,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'raichur':{soil:'Black Cotton',ph:7.8,rainfall:650,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'koppal':{soil:'Black Cotton',ph:7.6,rainfall:600,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'ballari':{soil:'Red Sandy',ph:6.8,rainfall:550,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'bellary':{soil:'Red Sandy',ph:6.8,rainfall:550,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'vijayanagara':{soil:'Red Sandy',ph:6.8,rainfall:550,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'dharwad':{soil:'Red Loam',ph:6.5,rainfall:750,temp_max:38,temp_min:16,climate:'Semi-arid',humidity:'Medium'},
  'gadag':{soil:'Black Cotton',ph:7.4,rainfall:600,temp_max:38,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'haveri':{soil:'Red Loam',ph:6.4,rainfall:700,temp_max:38,temp_min:16,climate:'Semi-arid',humidity:'Medium'},
  'belagavi':{soil:'Mixed Red',ph:6.8,rainfall:900,temp_max:36,temp_min:14,climate:'Semi-arid',humidity:'Medium'},
  'belgaum':{soil:'Mixed Red',ph:6.8,rainfall:900,temp_max:36,temp_min:14,climate:'Semi-arid',humidity:'Medium'},
  'bagalkot':{soil:'Black Cotton',ph:7.5,rainfall:580,temp_max:40,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'vijayapura':{soil:'Black Cotton',ph:7.5,rainfall:550,temp_max:40,temp_min:18,climate:'Arid',humidity:'Low'},
  'bijapur':{soil:'Black Cotton',ph:7.5,rainfall:550,temp_max:40,temp_min:18,climate:'Arid',humidity:'Low'},
  'bidar':{soil:'Black Cotton',ph:7.4,rainfall:780,temp_max:40,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'kalaburagi':{soil:'Black Cotton',ph:7.6,rainfall:600,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'gulbarga':{soil:'Black Cotton',ph:7.6,rainfall:600,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'yadgir':{soil:'Black Cotton',ph:7.7,rainfall:580,temp_max:42,temp_min:18,climate:'Semi-arid',humidity:'Low'},
  'dakshina kannada':{soil:'Laterite',ph:5.6,rainfall:3500,temp_max:34,temp_min:18,climate:'Humid',humidity:'Very High'},
  'udupi':{soil:'Laterite',ph:5.5,rainfall:4000,temp_max:33,temp_min:18,climate:'Humid',humidity:'Very High'},
  'uttara kannada':{soil:'Laterite',ph:5.7,rainfall:2500,temp_max:32,temp_min:16,climate:'Humid',humidity:'High'},
  'kodagu':{soil:'Laterite',ph:5.6,rainfall:2500,temp_max:28,temp_min:14,climate:'Humid',humidity:'High'},
  'chamarajanagar':{soil:'Red Sandy',ph:6.2,rainfall:750,temp_max:34,temp_min:16,climate:'Tropical',humidity:'Low'},
  'ramanagara':{soil:'Red Loam',ph:6.3,rainfall:820,temp_max:33,temp_min:15,climate:'Tropical',humidity:'Medium'},
  // ── KERALA ───────────────────────────────────────────────────────────────────
  'thiruvananthapuram':{soil:'Laterite',ph:5.7,rainfall:1700,temp_max:33,temp_min:20,climate:'Humid',humidity:'High'},
  'kollam':{soil:'Laterite',ph:5.6,rainfall:2800,temp_max:33,temp_min:20,climate:'Humid',humidity:'High'},
  'pathanamthitta':{soil:'Laterite',ph:5.5,rainfall:2800,temp_max:32,temp_min:18,climate:'Humid',humidity:'High'},
  'alappuzha':{soil:'Alluvial',ph:5.8,rainfall:2900,temp_max:32,temp_min:22,climate:'Humid',humidity:'Very High'},
  'kottayam':{soil:'Laterite',ph:5.6,rainfall:2800,temp_max:32,temp_min:20,climate:'Humid',humidity:'High'},
  'idukki':{soil:'Laterite',ph:5.4,rainfall:3000,temp_max:28,temp_min:12,climate:'Humid',humidity:'High'},
  'ernakulam':{soil:'Laterite',ph:5.8,rainfall:2700,temp_max:33,temp_min:22,climate:'Humid',humidity:'High'},
  'thrissur':{soil:'Laterite',ph:5.7,rainfall:2800,temp_max:34,temp_min:20,climate:'Humid',humidity:'High'},
  'palakkad':{soil:'Red Sandy',ph:6.2,rainfall:2000,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'malappuram':{soil:'Laterite',ph:5.8,rainfall:2400,temp_max:34,temp_min:20,climate:'Humid',humidity:'High'},
  'kozhikode':{soil:'Laterite',ph:5.7,rainfall:3000,temp_max:34,temp_min:20,climate:'Humid',humidity:'High'},
  'wayanad':{soil:'Laterite',ph:5.5,rainfall:2400,temp_max:30,temp_min:14,climate:'Humid',humidity:'High'},
  'kannur':{soil:'Laterite',ph:5.6,rainfall:3200,temp_max:33,temp_min:20,climate:'Humid',humidity:'Very High'},
  'kasaragod':{soil:'Laterite',ph:5.5,rainfall:3400,temp_max:33,temp_min:20,climate:'Humid',humidity:'Very High'},
  // ── MADHYA PRADESH ───────────────────────────────────────────────────────────
  'indore':{soil:'Black Cotton',ph:7.5,rainfall:900,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Low'},
  'bhopal':{soil:'Black Cotton',ph:7.4,rainfall:1050,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'ujjain':{soil:'Black Cotton',ph:7.6,rainfall:850,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'gwalior':{soil:'Alluvial',ph:7.8,rainfall:750,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'jabalpur':{soil:'Black Cotton',ph:7.2,rainfall:1300,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'sagar':{soil:'Black Cotton',ph:7.3,rainfall:1150,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'rewa':{soil:'Red Sandy',ph:6.5,rainfall:1100,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'satna':{soil:'Red Sandy',ph:6.6,rainfall:1050,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'neemuch':{soil:'Black Cotton',ph:7.5,rainfall:800,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'mandsaur':{soil:'Black Cotton',ph:7.6,rainfall:750,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'ratlam':{soil:'Black Cotton',ph:7.5,rainfall:850,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'chhindwara':{soil:'Red Sandy',ph:6.4,rainfall:1200,temp_max:40,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'narmadapuram':{soil:'Black Cotton',ph:7.3,rainfall:1100,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'hoshangabad':{soil:'Black Cotton',ph:7.3,rainfall:1100,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'shajapur':{soil:'Black Cotton',ph:7.5,rainfall:900,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'dewas':{soil:'Black Cotton',ph:7.4,rainfall:900,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'khandwa':{soil:'Black Cotton',ph:7.4,rainfall:1000,temp_max:42,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'barwani':{soil:'Black Cotton',ph:7.3,rainfall:950,temp_max:42,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'khargone':{soil:'Black Cotton',ph:7.3,rainfall:950,temp_max:42,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'dhar':{soil:'Black Cotton',ph:7.4,rainfall:900,temp_max:40,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'jhabua':{soil:'Sandy Loam',ph:7.0,rainfall:900,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'alirajpur':{soil:'Sandy Loam',ph:7.0,rainfall:1000,temp_max:40,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'morena':{soil:'Alluvial',ph:7.8,rainfall:700,temp_max:46,temp_min:4,climate:'Continental',humidity:'Low'},
  'bhind':{soil:'Alluvial',ph:7.8,rainfall:720,temp_max:46,temp_min:4,climate:'Continental',humidity:'Low'},
  'datia':{soil:'Alluvial',ph:7.7,rainfall:750,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'shivpuri':{soil:'Sandy Loam',ph:7.6,rainfall:850,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'guna':{soil:'Black Cotton',ph:7.5,rainfall:900,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'ashoknagar':{soil:'Black Cotton',ph:7.5,rainfall:900,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'vidisha':{soil:'Black Cotton',ph:7.4,rainfall:1000,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Medium'},
  'raisen':{soil:'Black Cotton',ph:7.3,rainfall:1100,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'seoni':{soil:'Red Sandy',ph:6.3,rainfall:1400,temp_max:40,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'balaghat':{soil:'Red Sandy',ph:6.2,rainfall:1600,temp_max:40,temp_min:10,climate:'Tropical',humidity:'High'},
  'mandla':{soil:'Red Sandy',ph:6.3,rainfall:1500,temp_max:40,temp_min:8,climate:'Tropical',humidity:'High'},
  'dindori':{soil:'Red Laterite',ph:6.0,rainfall:1400,temp_max:40,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'umaria':{soil:'Red Sandy',ph:6.4,rainfall:1200,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'shahdol':{soil:'Red Sandy',ph:6.4,rainfall:1200,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'anuppur':{soil:'Red Sandy',ph:6.3,rainfall:1300,temp_max:40,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'sidhi':{soil:'Red Sandy',ph:6.5,rainfall:1100,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'singrauli':{soil:'Red Sandy',ph:6.4,rainfall:1100,temp_max:44,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'katni':{soil:'Red Sandy',ph:6.5,rainfall:1200,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'damoh':{soil:'Black Cotton',ph:7.3,rainfall:1100,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'panna':{soil:'Red Sandy',ph:6.8,rainfall:1050,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'chhatarpur':{soil:'Sandy Loam',ph:7.2,rainfall:1000,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'tikamgarh':{soil:'Sandy Loam',ph:7.3,rainfall:950,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'niwari':{soil:'Sandy Loam',ph:7.3,rainfall:950,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  // ── MAHARASHTRA ──────────────────────────────────────────────────────────────
  'pune':{soil:'Mixed Red',ph:6.8,rainfall:700,temp_max:38,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'nashik':{soil:'Mixed Red',ph:6.5,rainfall:700,temp_max:38,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'nagpur':{soil:'Black Cotton',ph:7.5,rainfall:1050,temp_max:44,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'amravati':{soil:'Black Cotton',ph:7.6,rainfall:900,temp_max:44,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'solapur':{soil:'Black Cotton',ph:7.4,rainfall:550,temp_max:42,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'kolhapur':{soil:'Laterite',ph:5.9,rainfall:1500,temp_max:32,temp_min:14,climate:'Humid',humidity:'High'},
  'sangli':{soil:'Black Cotton',ph:7.3,rainfall:650,temp_max:38,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'satara':{soil:'Mixed Red',ph:6.8,rainfall:900,temp_max:36,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'latur':{soil:'Black Cotton',ph:7.5,rainfall:700,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'osmanabad':{soil:'Black Cotton',ph:7.4,rainfall:750,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'dharashiv':{soil:'Black Cotton',ph:7.4,rainfall:750,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'nanded':{soil:'Black Cotton',ph:7.4,rainfall:800,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'parbhani':{soil:'Black Cotton',ph:7.5,rainfall:800,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'hingoli':{soil:'Black Cotton',ph:7.4,rainfall:900,temp_max:40,temp_min:12,climate:'Semi-arid',humidity:'Medium'},
  'buldhana':{soil:'Black Cotton',ph:7.5,rainfall:850,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'akola':{soil:'Black Cotton',ph:7.6,rainfall:900,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Low'},
  'washim':{soil:'Black Cotton',ph:7.5,rainfall:850,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'yavatmal':{soil:'Black Cotton',ph:7.5,rainfall:950,temp_max:42,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'wardha':{soil:'Black Cotton',ph:7.5,rainfall:1000,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'chandrapur':{soil:'Black Cotton',ph:7.3,rainfall:1200,temp_max:44,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'gadchiroli':{soil:'Red Laterite',ph:6.0,rainfall:1500,temp_max:42,temp_min:12,climate:'Tropical',humidity:'High'},
  'gondia':{soil:'Red Sandy',ph:6.2,rainfall:1300,temp_max:42,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'bhandara':{soil:'Red Sandy',ph:6.3,rainfall:1200,temp_max:42,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'jalgaon':{soil:'Black Cotton',ph:7.5,rainfall:700,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'dhule':{soil:'Mixed Red',ph:7.0,rainfall:650,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'nandurbar':{soil:'Mixed Red',ph:6.8,rainfall:800,temp_max:42,temp_min:12,climate:'Semi-arid',humidity:'Medium'},
  'raigad':{soil:'Laterite',ph:5.8,rainfall:3000,temp_max:34,temp_min:18,climate:'Humid',humidity:'High'},
  'ratnagiri':{soil:'Laterite',ph:5.7,rainfall:3500,temp_max:32,temp_min:18,climate:'Humid',humidity:'Very High'},
  'sindhudurg':{soil:'Laterite',ph:5.6,rainfall:3500,temp_max:32,temp_min:18,climate:'Humid',humidity:'Very High'},
  'thane':{soil:'Laterite',ph:6.0,rainfall:2500,temp_max:36,temp_min:18,climate:'Humid',humidity:'High'},
  'ahmednagar':{soil:'Black Cotton',ph:7.3,rainfall:750,temp_max:40,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  'chhatrapati sambhajinagar':{soil:'Black Cotton',ph:7.3,rainfall:700,temp_max:40,temp_min:10,climate:'Semi-arid',humidity:'Low'},
  // ── PUNJAB ───────────────────────────────────────────────────────────────────
  'ludhiana':{soil:'Alluvial',ph:7.8,rainfall:700,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'amritsar':{soil:'Alluvial',ph:7.6,rainfall:680,temp_max:44,temp_min:2,climate:'Continental',humidity:'Medium'},
  'jalandhar':{soil:'Alluvial',ph:7.7,rainfall:650,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'patiala':{soil:'Alluvial',ph:7.5,rainfall:700,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'bathinda':{soil:'Sandy',ph:8.0,rainfall:400,temp_max:46,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  'sangrur':{soil:'Alluvial',ph:7.7,rainfall:550,temp_max:44,temp_min:2,climate:'Continental',humidity:'Low'},
  'moga':{soil:'Alluvial',ph:7.8,rainfall:600,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'ferozepur':{soil:'Alluvial',ph:8.0,rainfall:450,temp_max:44,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  'hoshiarpur':{soil:'Alluvial',ph:7.5,rainfall:900,temp_max:40,temp_min:2,climate:'Continental',humidity:'Medium'},
  'rupnagar':{soil:'Alluvial',ph:7.5,rainfall:850,temp_max:40,temp_min:2,climate:'Continental',humidity:'Medium'},
  'fatehgarh sahib':{soil:'Alluvial',ph:7.6,rainfall:720,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'fazilka':{soil:'Sandy',ph:8.2,rainfall:350,temp_max:46,temp_min:2,climate:'Arid',humidity:'Low'},
  'muktsar':{soil:'Sandy Loam',ph:8.0,rainfall:400,temp_max:46,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  'barnala':{soil:'Alluvial',ph:7.8,rainfall:550,temp_max:44,temp_min:2,climate:'Continental',humidity:'Low'},
  'tarn taran':{soil:'Alluvial',ph:7.6,rainfall:680,temp_max:44,temp_min:2,climate:'Continental',humidity:'Medium'},
  'gurdaspur':{soil:'Alluvial',ph:7.5,rainfall:850,temp_max:40,temp_min:2,climate:'Continental',humidity:'Medium'},
  'pathankot':{soil:'Alluvial',ph:7.4,rainfall:1100,temp_max:40,temp_min:4,climate:'Continental',humidity:'High'},
  'kapurthala':{soil:'Alluvial',ph:7.6,rainfall:700,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'shahid bhagat singh nagar':{soil:'Alluvial',ph:7.5,rainfall:850,temp_max:40,temp_min:2,climate:'Continental',humidity:'Medium'},
  'nawanshahr':{soil:'Alluvial',ph:7.5,rainfall:850,temp_max:40,temp_min:2,climate:'Continental',humidity:'Medium'},
  'firozpur':{soil:'Alluvial',ph:8.0,rainfall:450,temp_max:44,temp_min:2,climate:'Semi-arid',humidity:'Low'},
  // ── RAJASTHAN ────────────────────────────────────────────────────────────────
  'jaipur':{soil:'Sandy Loam',ph:7.8,rainfall:550,temp_max:45,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'jodhpur':{soil:'Sandy',ph:8.2,rainfall:360,temp_max:48,temp_min:8,climate:'Arid',humidity:'Very Low'},
  'udaipur':{soil:'Sandy Loam',ph:7.5,rainfall:650,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'kota':{soil:'Black Cotton',ph:7.5,rainfall:700,temp_max:45,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'ajmer':{soil:'Sandy Loam',ph:7.8,rainfall:500,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'alwar':{soil:'Sandy Loam',ph:7.7,rainfall:600,temp_max:44,temp_min:4,climate:'Semi-arid',humidity:'Low'},
  'bikaner':{soil:'Sandy',ph:8.5,rainfall:280,temp_max:48,temp_min:4,climate:'Arid',humidity:'Very Low'},
  'barmer':{soil:'Sandy',ph:8.6,rainfall:200,temp_max:48,temp_min:6,climate:'Arid',humidity:'Very Low'},
  'jaisalmer':{soil:'Sandy',ph:8.8,rainfall:150,temp_max:48,temp_min:6,climate:'Arid',humidity:'Very Low'},
  'nagaur':{soil:'Sandy Loam',ph:8.0,rainfall:400,temp_max:46,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'pali':{soil:'Sandy Loam',ph:7.9,rainfall:450,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'sikar':{soil:'Sandy Loam',ph:7.8,rainfall:450,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'tonk':{soil:'Sandy Loam',ph:7.7,rainfall:550,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'sawai madhopur':{soil:'Sandy Loam',ph:7.6,rainfall:600,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'bharatpur':{soil:'Alluvial',ph:7.8,rainfall:650,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'chittorgarh':{soil:'Sandy Loam',ph:7.5,rainfall:650,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'banswara':{soil:'Sandy Loam',ph:7.2,rainfall:850,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'dungarpur':{soil:'Sandy Loam',ph:7.3,rainfall:800,temp_max:42,temp_min:10,climate:'Semi-arid',humidity:'Medium'},
  'sirohi':{soil:'Sandy Loam',ph:7.6,rainfall:500,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'rajsamand':{soil:'Sandy Loam',ph:7.5,rainfall:600,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'bhilwara':{soil:'Sandy Loam',ph:7.5,rainfall:600,temp_max:42,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'bundi':{soil:'Sandy Loam',ph:7.6,rainfall:650,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'baran':{soil:'Black Cotton',ph:7.4,rainfall:750,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'jhalawar':{soil:'Black Cotton',ph:7.4,rainfall:800,temp_max:44,temp_min:8,climate:'Semi-arid',humidity:'Low'},
  'jhunjhunu':{soil:'Sandy Loam',ph:8.0,rainfall:420,temp_max:46,temp_min:4,climate:'Semi-arid',humidity:'Low'},
  'churu':{soil:'Sandy',ph:8.4,rainfall:300,temp_max:48,temp_min:2,climate:'Arid',humidity:'Very Low'},
  'hanumangarh':{soil:'Sandy Loam',ph:8.2,rainfall:300,temp_max:48,temp_min:2,climate:'Arid',humidity:'Very Low'},
  'ganganagar':{soil:'Alluvial',ph:8.2,rainfall:250,temp_max:48,temp_min:2,climate:'Arid',humidity:'Very Low'},
  'karauli':{soil:'Sandy Loam',ph:7.6,rainfall:650,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'dholpur':{soil:'Alluvial',ph:7.8,rainfall:680,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'dausa':{soil:'Sandy Loam',ph:7.7,rainfall:580,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'jalore':{soil:'Sandy',ph:8.3,rainfall:350,temp_max:46,temp_min:8,climate:'Arid',humidity:'Low'},
  // ── TAMIL NADU ───────────────────────────────────────────────────────────────
  'chennai':{soil:'Sandy Loam',ph:6.8,rainfall:1200,temp_max:38,temp_min:22,climate:'Tropical',humidity:'High'},
  'coimbatore':{soil:'Red Sandy',ph:6.5,rainfall:650,temp_max:38,temp_min:16,climate:'Semi-arid',humidity:'Medium'},
  'madurai':{soil:'Black Cotton',ph:7.2,rainfall:850,temp_max:40,temp_min:20,climate:'Tropical',humidity:'Medium'},
  'tiruchirappalli':{soil:'Sandy Loam',ph:6.9,rainfall:900,temp_max:40,temp_min:20,climate:'Tropical',humidity:'Medium'},
  'tirunelveli':{soil:'Sandy Loam',ph:7.0,rainfall:650,temp_max:38,temp_min:22,climate:'Semi-arid',humidity:'Medium'},
  'salem':{soil:'Red Loam',ph:6.3,rainfall:950,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'erode':{soil:'Red Sandy',ph:6.4,rainfall:700,temp_max:38,temp_min:18,climate:'Semi-arid',humidity:'Medium'},
  'thanjavur':{soil:'Alluvial',ph:7.2,rainfall:1050,temp_max:36,temp_min:18,climate:'Tropical',humidity:'High'},
  'tiruppur':{soil:'Red Sandy',ph:6.4,rainfall:650,temp_max:38,temp_min:18,climate:'Semi-arid',humidity:'Medium'},
  'vellore':{soil:'Red Loam',ph:6.5,rainfall:900,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'kancheepuram':{soil:'Sandy Loam',ph:6.8,rainfall:1100,temp_max:36,temp_min:20,climate:'Tropical',humidity:'High'},
  'tiruvallur':{soil:'Sandy Loam',ph:6.8,rainfall:1100,temp_max:36,temp_min:20,climate:'Tropical',humidity:'High'},
  'cuddalore':{soil:'Alluvial',ph:6.8,rainfall:1200,temp_max:36,temp_min:22,climate:'Tropical',humidity:'High'},
  'villupuram':{soil:'Sandy Loam',ph:6.6,rainfall:1100,temp_max:38,temp_min:20,climate:'Tropical',humidity:'High'},
  'krishnagiri':{soil:'Red Loam',ph:6.3,rainfall:900,temp_max:38,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'dharmapuri':{soil:'Red Loam',ph:6.2,rainfall:850,temp_max:38,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'theni':{soil:'Red Sandy',ph:6.5,rainfall:1100,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'dindigul':{soil:'Sandy Loam',ph:6.7,rainfall:850,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'virudhunagar':{soil:'Sandy Loam',ph:6.8,rainfall:750,temp_max:38,temp_min:20,climate:'Semi-arid',humidity:'Medium'},
  'sivaganga':{soil:'Sandy Loam',ph:7.0,rainfall:800,temp_max:38,temp_min:22,climate:'Tropical',humidity:'Medium'},
  'ramanathapuram':{soil:'Sandy',ph:7.2,rainfall:800,temp_max:38,temp_min:22,climate:'Semi-arid',humidity:'Medium'},
  'thoothukudi':{soil:'Sandy',ph:7.3,rainfall:650,temp_max:38,temp_min:22,climate:'Semi-arid',humidity:'Medium'},
  'kanyakumari':{soil:'Laterite',ph:5.8,rainfall:1600,temp_max:34,temp_min:22,climate:'Humid',humidity:'High'},
  'nilgiris':{soil:'Mountain Loam',ph:5.6,rainfall:2500,temp_max:22,temp_min:8,climate:'Temperate',humidity:'High'},
  'nagapattinam':{soil:'Alluvial',ph:7.0,rainfall:1400,temp_max:34,temp_min:22,climate:'Tropical',humidity:'High'},
  'tiruvarur':{soil:'Alluvial',ph:7.2,rainfall:1300,temp_max:36,temp_min:22,climate:'Tropical',humidity:'High'},
  'ariyalur':{soil:'Sandy Loam',ph:7.0,rainfall:1000,temp_max:38,temp_min:20,climate:'Tropical',humidity:'Medium'},
  'perambalur':{soil:'Sandy Loam',ph:6.8,rainfall:900,temp_max:38,temp_min:20,climate:'Tropical',humidity:'Medium'},
  'karur':{soil:'Sandy Loam',ph:6.7,rainfall:850,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'namakkal':{soil:'Red Loam',ph:6.5,rainfall:800,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'tiruvannamalai':{soil:'Red Sandy',ph:6.6,rainfall:1000,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'kallakurichi':{soil:'Sandy Loam',ph:6.7,rainfall:1000,temp_max:38,temp_min:20,climate:'Tropical',humidity:'Medium'},
  'ranipet':{soil:'Red Loam',ph:6.5,rainfall:950,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'tirupattur':{soil:'Red Loam',ph:6.4,rainfall:900,temp_max:38,temp_min:18,climate:'Tropical',humidity:'Medium'},
  'chengalpattu':{soil:'Sandy Loam',ph:6.8,rainfall:1200,temp_max:36,temp_min:20,climate:'Tropical',humidity:'High'},
  // ── TELANGANA ────────────────────────────────────────────────────────────────
  'hyderabad':{soil:'Red Loam',ph:7.0,rainfall:800,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'rangareddy':{soil:'Red Loam',ph:7.0,rainfall:780,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'medchal malkajgiri':{soil:'Red Loam',ph:7.0,rainfall:780,temp_max:40,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'warangal':{soil:'Black Cotton',ph:7.2,rainfall:1050,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'hanamkonda':{soil:'Black Cotton',ph:7.2,rainfall:1050,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'karimnagar':{soil:'Red Sandy',ph:6.8,rainfall:950,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'nizamabad':{soil:'Red Loam',ph:6.8,rainfall:1000,temp_max:40,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'adilabad':{soil:'Black Cotton',ph:7.3,rainfall:1100,temp_max:42,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'khammam':{soil:'Red Sandy',ph:6.8,rainfall:1050,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'nalgonda':{soil:'Red Sandy',ph:6.8,rainfall:900,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Low'},
  'mahbubnagar':{soil:'Red Sandy',ph:6.5,rainfall:750,temp_max:44,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'sangareddy':{soil:'Black Cotton',ph:7.2,rainfall:850,temp_max:42,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'medak':{soil:'Red Loam',ph:6.8,rainfall:900,temp_max:40,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'siddipet':{soil:'Red Loam',ph:6.8,rainfall:950,temp_max:40,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'jagtial':{soil:'Red Sandy',ph:6.8,rainfall:950,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'rajanna sircilla':{soil:'Red Sandy',ph:6.8,rainfall:950,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'peddapalli':{soil:'Red Sandy',ph:6.8,rainfall:950,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'jayashankar bhupalpally':{soil:'Red Sandy',ph:6.5,rainfall:1100,temp_max:40,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'mulugu':{soil:'Red Sandy',ph:6.5,rainfall:1100,temp_max:40,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'bhadradri kothagudem':{soil:'Red Laterite',ph:6.2,rainfall:1300,temp_max:40,temp_min:14,climate:'Tropical',humidity:'High'},
  'suryapet':{soil:'Red Sandy',ph:6.8,rainfall:900,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'yadadri bhuvanagiri':{soil:'Red Sandy',ph:6.8,rainfall:850,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'mahabubabad':{soil:'Black Cotton',ph:7.2,rainfall:1050,temp_max:42,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'jogulamba gadwal':{soil:'Red Sandy',ph:6.5,rainfall:700,temp_max:44,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'wanaparthy':{soil:'Red Sandy',ph:6.5,rainfall:750,temp_max:42,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'nagarkurnool':{soil:'Red Sandy',ph:6.5,rainfall:800,temp_max:42,temp_min:16,climate:'Semi-arid',humidity:'Low'},
  'vikarabad':{soil:'Red Sandy',ph:6.8,rainfall:800,temp_max:40,temp_min:16,climate:'Tropical',humidity:'Medium'},
  'mancherial':{soil:'Red Sandy',ph:6.8,rainfall:1000,temp_max:42,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'asifabad':{soil:'Black Cotton',ph:7.2,rainfall:1100,temp_max:40,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'nirmal':{soil:'Black Cotton',ph:7.2,rainfall:1000,temp_max:42,temp_min:14,climate:'Tropical',humidity:'Medium'},
  'kamareddy':{soil:'Red Loam',ph:6.8,rainfall:950,temp_max:40,temp_min:16,climate:'Tropical',humidity:'Medium'},
  // ── UTTAR PRADESH ────────────────────────────────────────────────────────────
  'lucknow':{soil:'Alluvial',ph:7.5,rainfall:900,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'agra':{soil:'Alluvial',ph:7.8,rainfall:680,temp_max:46,temp_min:4,climate:'Continental',humidity:'Low'},
  'prayagraj':{soil:'Alluvial',ph:7.4,rainfall:1000,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'allahabad':{soil:'Alluvial',ph:7.4,rainfall:1000,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'varanasi':{soil:'Alluvial',ph:7.3,rainfall:1050,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'kanpur':{soil:'Alluvial',ph:7.5,rainfall:820,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'gorakhpur':{soil:'Alluvial',ph:7.2,rainfall:1100,temp_max:42,temp_min:6,climate:'Tropical',humidity:'High'},
  'meerut':{soil:'Alluvial',ph:7.7,rainfall:780,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'muzaffar nagar':{soil:'Alluvial',ph:7.8,rainfall:780,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'muzaffarnagar':{soil:'Alluvial',ph:7.8,rainfall:780,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'mathura':{soil:'Alluvial',ph:7.8,rainfall:650,temp_max:46,temp_min:4,climate:'Continental',humidity:'Low'},
  'aligarh':{soil:'Alluvial',ph:7.6,rainfall:720,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'bareilly':{soil:'Alluvial',ph:7.4,rainfall:950,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'moradabad':{soil:'Alluvial',ph:7.5,rainfall:900,temp_max:42,temp_min:4,climate:'Continental',humidity:'Medium'},
  'saharanpur':{soil:'Alluvial',ph:7.6,rainfall:950,temp_max:42,temp_min:2,climate:'Continental',humidity:'Medium'},
  'bijnor':{soil:'Alluvial',ph:7.5,rainfall:950,temp_max:42,temp_min:4,climate:'Continental',humidity:'Medium'},
  'jhansi':{soil:'Black Cotton',ph:7.4,rainfall:850,temp_max:46,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'banda':{soil:'Sandy Loam',ph:7.5,rainfall:850,temp_max:46,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'sitapur':{soil:'Alluvial',ph:7.3,rainfall:1000,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'hardoi':{soil:'Alluvial',ph:7.4,rainfall:950,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'gonda':{soil:'Alluvial',ph:7.2,rainfall:1050,temp_max:42,temp_min:4,climate:'Tropical',humidity:'High'},
  'lakhimpur kheri':{soil:'Alluvial',ph:7.2,rainfall:1100,temp_max:42,temp_min:4,climate:'Tropical',humidity:'High'},
  'faizabad':{soil:'Alluvial',ph:7.3,rainfall:1000,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'ayodhya':{soil:'Alluvial',ph:7.3,rainfall:1000,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'azamgarh':{soil:'Alluvial',ph:7.2,rainfall:1050,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'ballia':{soil:'Alluvial',ph:7.1,rainfall:1100,temp_max:42,temp_min:6,climate:'Tropical',humidity:'High'},
  'jaunpur':{soil:'Alluvial',ph:7.2,rainfall:1000,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'mirzapur':{soil:'Red Sandy',ph:6.8,rainfall:950,temp_max:44,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'sonbhadra':{soil:'Red Sandy',ph:6.6,rainfall:1050,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'unnao':{soil:'Alluvial',ph:7.5,rainfall:870,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'rae bareli':{soil:'Alluvial',ph:7.4,rainfall:900,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'sultanpur':{soil:'Alluvial',ph:7.3,rainfall:980,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'ambedkar nagar':{soil:'Alluvial',ph:7.2,rainfall:1000,temp_max:42,temp_min:6,climate:'Tropical',humidity:'High'},
  'barabanki':{soil:'Alluvial',ph:7.4,rainfall:950,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'pratapgarh':{soil:'Alluvial',ph:7.3,rainfall:980,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'kushinagar':{soil:'Alluvial',ph:7.1,rainfall:1150,temp_max:40,temp_min:6,climate:'Tropical',humidity:'High'},
  'maharajganj':{soil:'Alluvial',ph:7.1,rainfall:1200,temp_max:38,temp_min:6,climate:'Tropical',humidity:'High'},
  'basti':{soil:'Alluvial',ph:7.2,rainfall:1100,temp_max:40,temp_min:6,climate:'Tropical',humidity:'High'},
  'sant kabir nagar':{soil:'Alluvial',ph:7.2,rainfall:1100,temp_max:40,temp_min:6,climate:'Tropical',humidity:'High'},
  'siddharthnagar':{soil:'Alluvial',ph:7.1,rainfall:1200,temp_max:38,temp_min:6,climate:'Tropical',humidity:'High'},
  'deoria':{soil:'Alluvial',ph:7.1,rainfall:1100,temp_max:40,temp_min:6,climate:'Tropical',humidity:'High'},
  'etawah':{soil:'Alluvial',ph:7.6,rainfall:750,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'mainpuri':{soil:'Alluvial',ph:7.6,rainfall:750,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'firozabad':{soil:'Alluvial',ph:7.7,rainfall:720,temp_max:46,temp_min:4,climate:'Continental',humidity:'Low'},
  'etah':{soil:'Alluvial',ph:7.7,rainfall:720,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'kasganj':{soil:'Alluvial',ph:7.7,rainfall:720,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'hathras':{soil:'Alluvial',ph:7.7,rainfall:680,temp_max:46,temp_min:4,climate:'Continental',humidity:'Low'},
  'bulandshahr':{soil:'Alluvial',ph:7.7,rainfall:720,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'hapur':{soil:'Alluvial',ph:7.7,rainfall:750,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'gautam buddha nagar':{soil:'Alluvial',ph:7.6,rainfall:700,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'ghaziabad':{soil:'Alluvial',ph:7.6,rainfall:720,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'rampur':{soil:'Alluvial',ph:7.5,rainfall:900,temp_max:42,temp_min:4,climate:'Continental',humidity:'Medium'},
  'amroha':{soil:'Alluvial',ph:7.5,rainfall:900,temp_max:42,temp_min:4,climate:'Continental',humidity:'Medium'},
  'pilibhit':{soil:'Alluvial',ph:7.3,rainfall:1050,temp_max:40,temp_min:4,climate:'Tropical',humidity:'High'},
  'shahjahanpur':{soil:'Alluvial',ph:7.4,rainfall:950,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'badaun':{soil:'Alluvial',ph:7.5,rainfall:880,temp_max:42,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'auraiya':{soil:'Alluvial',ph:7.6,rainfall:800,temp_max:44,temp_min:4,climate:'Continental',humidity:'Low'},
  'kannauj':{soil:'Alluvial',ph:7.5,rainfall:850,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'farrukhabad':{soil:'Alluvial',ph:7.5,rainfall:850,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'hamirpur':{soil:'Sandy Loam',ph:7.5,rainfall:850,temp_max:46,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'mahoba':{soil:'Sandy Loam',ph:7.5,rainfall:800,temp_max:46,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'lalitpur':{soil:'Sandy Loam',ph:7.4,rainfall:850,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'chitrakoot':{soil:'Sandy Loam',ph:7.4,rainfall:900,temp_max:44,temp_min:6,climate:'Semi-arid',humidity:'Low'},
  'fatehpur':{soil:'Alluvial',ph:7.5,rainfall:850,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'kaushambi':{soil:'Alluvial',ph:7.4,rainfall:900,temp_max:44,temp_min:4,climate:'Tropical',humidity:'Medium'},
  'chandauli':{soil:'Alluvial',ph:7.3,rainfall:1050,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'ghazipur':{soil:'Alluvial',ph:7.2,rainfall:1050,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'mau':{soil:'Alluvial',ph:7.2,rainfall:1050,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  // ── UTTARAKHAND ──────────────────────────────────────────────────────────────
  'dehradun':{soil:'Alluvial',ph:6.8,rainfall:2000,temp_max:36,temp_min:2,climate:'Temperate',humidity:'High'},
  'haridwar':{soil:'Alluvial',ph:7.2,rainfall:1200,temp_max:42,temp_min:4,climate:'Continental',humidity:'Medium'},
  'nainital':{soil:'Mountain Loam',ph:6.5,rainfall:1800,temp_max:28,temp_min:0,climate:'Temperate',humidity:'High'},
  'udham singh nagar':{soil:'Alluvial',ph:7.0,rainfall:1400,temp_max:40,temp_min:4,climate:'Tropical',humidity:'High'},
  'almora':{soil:'Mountain Loam',ph:6.2,rainfall:1200,temp_max:26,temp_min:-2,climate:'Temperate',humidity:'Medium'},
  'chamoli':{soil:'Mountain Loam',ph:6.0,rainfall:1400,temp_max:24,temp_min:-4,climate:'Temperate',humidity:'Medium'},
  'pauri garhwal':{soil:'Mountain Loam',ph:6.2,rainfall:1500,temp_max:28,temp_min:-2,climate:'Temperate',humidity:'High'},
  'tehri garhwal':{soil:'Mountain Loam',ph:6.3,rainfall:1600,temp_max:28,temp_min:-2,climate:'Temperate',humidity:'High'},
  'pithoragarh':{soil:'Mountain Loam',ph:6.0,rainfall:1000,temp_max:24,temp_min:-4,climate:'Temperate',humidity:'Medium'},
  'bageshwar':{soil:'Mountain Loam',ph:6.1,rainfall:1100,temp_max:26,temp_min:-2,climate:'Temperate',humidity:'Medium'},
  'champawat':{soil:'Mountain Loam',ph:6.2,rainfall:1300,temp_max:28,temp_min:-2,climate:'Temperate',humidity:'Medium'},
  'rudraprayag':{soil:'Mountain Loam',ph:6.0,rainfall:1400,temp_max:26,temp_min:-4,climate:'Temperate',humidity:'High'},
  'uttarkashi':{soil:'Mountain Loam',ph:6.0,rainfall:1200,temp_max:26,temp_min:-6,climate:'Temperate',humidity:'Medium'},
  // ── WEST BENGAL ──────────────────────────────────────────────────────────────
  'kolkata':{soil:'Alluvial',ph:6.2,rainfall:1600,temp_max:38,temp_min:12,climate:'Humid',humidity:'High'},
  'howrah':{soil:'Alluvial',ph:6.3,rainfall:1600,temp_max:38,temp_min:12,climate:'Humid',humidity:'High'},
  'bardhaman':{soil:'Alluvial',ph:6.5,rainfall:1400,temp_max:40,temp_min:10,climate:'Humid',humidity:'High'},
  'murshidabad':{soil:'Alluvial',ph:6.2,rainfall:1400,temp_max:38,temp_min:10,climate:'Humid',humidity:'High'},
  'nadia':{soil:'Alluvial',ph:6.3,rainfall:1600,temp_max:38,temp_min:10,climate:'Humid',humidity:'High'},
  'north 24 parganas':{soil:'Alluvial',ph:6.4,rainfall:1700,temp_max:36,temp_min:12,climate:'Humid',humidity:'High'},
  'south 24 parganas':{soil:'Alluvial',ph:6.2,rainfall:1800,temp_max:34,temp_min:14,climate:'Humid',humidity:'High'},
  'birbhum':{soil:'Red Laterite',ph:6.0,rainfall:1300,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'bankura':{soil:'Red Laterite',ph:6.1,rainfall:1350,temp_max:44,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'purulia':{soil:'Red Laterite',ph:5.9,rainfall:1300,temp_max:44,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'jalpaiguri':{soil:'Alluvial',ph:5.8,rainfall:2800,temp_max:32,temp_min:8,climate:'Humid',humidity:'Very High'},
  'darjeeling':{soil:'Mountain Loam',ph:5.6,rainfall:3000,temp_max:22,temp_min:4,climate:'Temperate',humidity:'High'},
  'cooch behar':{soil:'Alluvial',ph:5.8,rainfall:3200,temp_max:32,temp_min:8,climate:'Humid',humidity:'High'},
  'alipurduar':{soil:'Alluvial',ph:5.7,rainfall:3500,temp_max:32,temp_min:8,climate:'Humid',humidity:'Very High'},
  'malda':{soil:'Alluvial',ph:6.3,rainfall:1400,temp_max:38,temp_min:8,climate:'Tropical',humidity:'High'},
  'uttar dinajpur':{soil:'Alluvial',ph:6.2,rainfall:1500,temp_max:38,temp_min:8,climate:'Tropical',humidity:'High'},
  'dakshin dinajpur':{soil:'Alluvial',ph:6.2,rainfall:1400,temp_max:38,temp_min:8,climate:'Tropical',humidity:'High'},
  'paschim medinipur':{soil:'Red Laterite',ph:6.0,rainfall:1400,temp_max:40,temp_min:10,climate:'Tropical',humidity:'High'},
  'purba medinipur':{soil:'Sandy Loam',ph:6.5,rainfall:1600,temp_max:36,temp_min:14,climate:'Tropical',humidity:'High'},
  'hooghly':{soil:'Alluvial',ph:6.4,rainfall:1500,temp_max:38,temp_min:10,climate:'Humid',humidity:'High'},
  'paschim burdwan':{soil:'Alluvial',ph:6.5,rainfall:1400,temp_max:40,temp_min:10,climate:'Humid',humidity:'High'},
  'jhargram':{soil:'Red Laterite',ph:5.8,rainfall:1300,temp_max:42,temp_min:10,climate:'Tropical',humidity:'Medium'},
  // ── ODISHA ───────────────────────────────────────────────────────────────────
  'khordha':{soil:'Red Laterite',ph:6.0,rainfall:1500,temp_max:40,temp_min:14,climate:'Tropical',humidity:'High'},
  'cuttack':{soil:'Alluvial',ph:6.5,rainfall:1500,temp_max:40,temp_min:14,climate:'Tropical',humidity:'High'},
  'puri':{soil:'Sandy Loam',ph:6.5,rainfall:1600,temp_max:36,temp_min:16,climate:'Tropical',humidity:'High'},
  'balasore':{soil:'Alluvial',ph:6.3,rainfall:1800,temp_max:38,temp_min:12,climate:'Tropical',humidity:'High'},
  'mayurbhanj':{soil:'Red Laterite',ph:5.8,rainfall:1600,temp_max:38,temp_min:10,climate:'Tropical',humidity:'High'},
  'sundargarh':{soil:'Red Laterite',ph:5.8,rainfall:1500,temp_max:40,temp_min:10,climate:'Tropical',humidity:'High'},
  'koraput':{soil:'Red Laterite',ph:5.7,rainfall:1600,temp_max:36,temp_min:12,climate:'Tropical',humidity:'High'},
  'ganjam':{soil:'Red Laterite',ph:6.0,rainfall:1200,temp_max:40,temp_min:14,climate:'Tropical',humidity:'High'},
  'kalahandi':{soil:'Red Laterite',ph:5.9,rainfall:1400,temp_max:42,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'sambalpur':{soil:'Red Sandy',ph:6.2,rainfall:1300,temp_max:44,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'bargarh':{soil:'Red Sandy',ph:6.3,rainfall:1350,temp_max:42,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'bolangir':{soil:'Red Sandy',ph:6.2,rainfall:1200,temp_max:44,temp_min:12,climate:'Tropical',humidity:'Medium'},
  'dhenkanal':{soil:'Red Laterite',ph:6.0,rainfall:1400,temp_max:42,temp_min:12,climate:'Tropical',humidity:'High'},
  'angul':{soil:'Red Laterite',ph:6.0,rainfall:1500,temp_max:42,temp_min:12,climate:'Tropical',humidity:'High'},
  'jajpur':{soil:'Alluvial',ph:6.4,rainfall:1500,temp_max:40,temp_min:12,climate:'Tropical',humidity:'High'},
  'kendrapara':{soil:'Alluvial',ph:6.5,rainfall:1600,temp_max:38,temp_min:14,climate:'Tropical',humidity:'High'},
  'jagatsinghpur':{soil:'Alluvial',ph:6.5,rainfall:1600,temp_max:36,temp_min:16,climate:'Tropical',humidity:'High'},
  'bhadrak':{soil:'Alluvial',ph:6.4,rainfall:1700,temp_max:38,temp_min:12,climate:'Tropical',humidity:'High'},
  'keonjhar':{soil:'Red Laterite',ph:5.8,rainfall:1600,temp_max:40,temp_min:10,climate:'Tropical',humidity:'High'},
  'nuapada':{soil:'Red Sandy',ph:6.0,rainfall:1100,temp_max:44,temp_min:12,climate:'Semi-arid',humidity:'Low'},
  'nabarangpur':{soil:'Red Laterite',ph:5.8,rainfall:1500,temp_max:40,temp_min:12,climate:'Tropical',humidity:'High'},
  'rayagada':{soil:'Red Laterite',ph:5.7,rainfall:1600,temp_max:38,temp_min:14,climate:'Tropical',humidity:'High'},
  'malkangiri':{soil:'Red Laterite',ph:5.7,rainfall:1600,temp_max:38,temp_min:14,climate:'Tropical',humidity:'High'},
  // ── JHARKHAND ────────────────────────────────────────────────────────────────
  'ranchi':{soil:'Red Laterite',ph:5.8,rainfall:1400,temp_max:40,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'dhanbad':{soil:'Red Laterite',ph:6.0,rainfall:1300,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'jamshedpur':{soil:'Red Laterite',ph:5.9,rainfall:1350,temp_max:40,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'bokaro':{soil:'Red Laterite',ph:5.9,rainfall:1300,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'hazaribagh':{soil:'Red Laterite',ph:5.8,rainfall:1300,temp_max:40,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'giridih':{soil:'Red Laterite',ph:5.9,rainfall:1250,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'gumla':{soil:'Red Laterite',ph:5.7,rainfall:1400,temp_max:38,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'lohardaga':{soil:'Red Laterite',ph:5.7,rainfall:1400,temp_max:38,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'west singhbhum':{soil:'Red Laterite',ph:5.6,rainfall:1600,temp_max:38,temp_min:10,climate:'Tropical',humidity:'High'},
  'east singhbhum':{soil:'Red Laterite',ph:5.8,rainfall:1350,temp_max:40,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'seraikela kharsawan':{soil:'Red Laterite',ph:5.8,rainfall:1350,temp_max:40,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'sahebganj':{soil:'Alluvial',ph:6.5,rainfall:1400,temp_max:38,temp_min:8,climate:'Tropical',humidity:'High'},
  'pakur':{soil:'Alluvial',ph:6.5,rainfall:1400,temp_max:38,temp_min:8,climate:'Tropical',humidity:'High'},
  'godda':{soil:'Red Laterite',ph:6.0,rainfall:1300,temp_max:40,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'dumka':{soil:'Red Laterite',ph:5.9,rainfall:1400,temp_max:40,temp_min:8,climate:'Tropical',humidity:'High'},
  'deoghar':{soil:'Red Laterite',ph:6.0,rainfall:1300,temp_max:40,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'jamtara':{soil:'Red Laterite',ph:5.9,rainfall:1350,temp_max:40,temp_min:8,climate:'Tropical',humidity:'High'},
  'chatra':{soil:'Red Laterite',ph:5.8,rainfall:1350,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'koderma':{soil:'Red Laterite',ph:5.8,rainfall:1200,temp_max:42,temp_min:6,climate:'Tropical',humidity:'Medium'},
  'simdega':{soil:'Red Laterite',ph:5.7,rainfall:1500,temp_max:38,temp_min:8,climate:'Tropical',humidity:'High'},
  // ── CHHATTISGARH ─────────────────────────────────────────────────────────────
  'raipur':{soil:'Red Laterite',ph:6.0,rainfall:1250,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'bilaspur':{soil:'Red Laterite',ph:6.1,rainfall:1150,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'durg':{soil:'Red Laterite',ph:6.0,rainfall:1200,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'rajnandgaon':{soil:'Red Sandy',ph:6.1,rainfall:1250,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'raigarh':{soil:'Red Sandy',ph:6.2,rainfall:1300,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'korba':{soil:'Red Sandy',ph:6.0,rainfall:1400,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'janjgir champa':{soil:'Red Sandy',ph:6.2,rainfall:1200,temp_max:44,temp_min:10,climate:'Tropical',humidity:'Medium'},
  'surguja':{soil:'Red Sandy',ph:5.8,rainfall:1300,temp_max:42,temp_min:8,climate:'Tropical',humidity:'Medium'},
  'bastar':{soil:'Red Laterite',ph:5.8,rainfall:1600,temp_max:38,temp_min:12,climate:'Tropical',humidity:'High'},
  'dantewada':{soil:'Red Laterite',ph:5.7,rainfall:1600,temp_max:38,temp_min:12,climate:'Tropical',humidity:'High'},
  'kanker':{soil:'Red Sandy',ph:6.0,rainfall:1400,temp_max:40,temp_min:12,climate:'Tropical',humidity:'Medium'},
  // ── DELHI ────────────────────────────────────────────────────────────────────
  'delhi':{soil:'Alluvial',ph:7.5,rainfall:640,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'new delhi':{soil:'Alluvial',ph:7.5,rainfall:640,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'north delhi':{soil:'Alluvial',ph:7.5,rainfall:640,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'south delhi':{soil:'Alluvial',ph:7.5,rainfall:640,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'east delhi':{soil:'Alluvial',ph:7.5,rainfall:640,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
  'west delhi':{soil:'Alluvial',ph:7.5,rainfall:640,temp_max:44,temp_min:4,climate:'Continental',humidity:'Medium'},
};

function getLocationData(rawDistrict, rawState) {
  const distKey = normalize(rawDistrict || '');
  const stateKey = normalize(rawState || '');

  // 1. Exact district match
  if (distKey && DISTRICT_DATA[distKey]) {
    return { ...DISTRICT_DATA[distKey], source: 'district' };
  }

  // 2. Partial match (handles spelling variations)
  if (distKey) {
    const partialKey = Object.keys(DISTRICT_DATA).find(k =>
      k.includes(distKey) || distKey.includes(k) || k.split(' ').some(w => w.length > 4 && distKey.includes(w))
    );
    if (partialKey) return { ...DISTRICT_DATA[partialKey], source: 'district_partial' };
  }

  // 3. State fallback
  if (stateKey && STATE_DEFAULTS[stateKey]) {
    const sd = STATE_DEFAULTS[stateKey];
    return { soil:sd.soil, ph:sd.ph, rainfall:sd.rainfall, temp_max:sd.temp_max, temp_min:sd.temp_min, climate:sd.climate, humidity:sd.humidity, source:'state_fallback' };
  }

  // 4. Generic India default
  return { soil:'Loam', ph:7.0, rainfall:800, temp_max:38, temp_min:12, climate:'Tropical', humidity:'Medium', source:'default' };
}

function getStatePrimaryCrops(rawState) {
  const key = normalize(rawState || '');
  return STATE_DEFAULTS[key]?.primary_crops || [];
}

function getAllStates() {
  return Object.keys(STATE_DEFAULTS).map(s =>
    s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  ).sort();
}

function getAllDistricts() {
  return Object.keys(DISTRICT_DATA).map(d =>
    d.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  ).sort();
}


// ── ADDITIONAL DISTRICTS — NE States, Goa, remaining coverage ────────────────
Object.assign(DISTRICT_DATA, {
  // ── MANIPUR ─────────────────────────────────────────────────────────────────
  'imphal west':     {soil:'Alluvial',     ph:5.8,rainfall:1450,temp_max:30,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'imphal east':     {soil:'Alluvial',     ph:5.8,rainfall:1450,temp_max:30,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'imphal':          {soil:'Alluvial',     ph:5.8,rainfall:1450,temp_max:30,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'bishnupur':       {soil:'Alluvial',     ph:5.9,rainfall:1400,temp_max:30,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'thoubal':         {soil:'Alluvial',     ph:5.9,rainfall:1400,temp_max:30,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'churachandpur':   {soil:'Red Loam',     ph:5.7,rainfall:2000,temp_max:28,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'senapati':        {soil:'Laterite',     ph:5.5,rainfall:2200,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'tamenglong':      {soil:'Laterite',     ph:5.4,rainfall:2500,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'chandel':         {soil:'Laterite',     ph:5.5,rainfall:2200,temp_max:28,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'ukhrul':          {soil:'Laterite',     ph:5.4,rainfall:2000,temp_max:26,temp_min:2,  climate:'Humid',      humidity:'High'   },

  // ── MEGHALAYA ───────────────────────────────────────────────────────────────
  'shillong':        {soil:'Laterite',     ph:5.3,rainfall:2500,temp_max:25,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'east khasi hills':{soil:'Laterite',     ph:5.3,rainfall:11000,temp_max:22,temp_min:4, climate:'Humid',      humidity:'Very High'},
  'west khasi hills':{soil:'Laterite',     ph:5.4,rainfall:3000,temp_max:24,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'ri bhoi':         {soil:'Alluvial',     ph:5.6,rainfall:2200,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'jaintia hills':   {soil:'Laterite',     ph:5.4,rainfall:3000,temp_max:24,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'east jaintia hills':{soil:'Laterite',   ph:5.4,rainfall:3000,temp_max:24,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'west jaintia hills':{soil:'Laterite',   ph:5.4,rainfall:3000,temp_max:24,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'east garo hills': {soil:'Red Loam',     ph:5.6,rainfall:2200,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'west garo hills': {soil:'Red Loam',     ph:5.6,rainfall:2200,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'south garo hills':{soil:'Red Loam',     ph:5.5,rainfall:2200,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'north garo hills':{soil:'Red Loam',     ph:5.5,rainfall:2400,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },

  // ── MIZORAM ─────────────────────────────────────────────────────────────────
  'aizawl':          {soil:'Red Loam',     ph:5.5,rainfall:2500,temp_max:28,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'lunglei':         {soil:'Laterite',     ph:5.4,rainfall:3000,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'champhai':        {soil:'Red Loam',     ph:5.6,rainfall:2000,temp_max:26,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'serchhip':        {soil:'Red Loam',     ph:5.5,rainfall:2500,temp_max:28,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'kolasib':         {soil:'Alluvial',     ph:5.6,rainfall:2200,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'mamit':           {soil:'Red Loam',     ph:5.5,rainfall:2500,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'lawngtlai':       {soil:'Laterite',     ph:5.4,rainfall:3000,temp_max:28,temp_min:10, climate:'Humid',      humidity:'High'   },
  'siaha':           {soil:'Laterite',     ph:5.4,rainfall:2800,temp_max:28,temp_min:10, climate:'Humid',      humidity:'High'   },

  // ── NAGALAND ────────────────────────────────────────────────────────────────
  'kohima':          {soil:'Laterite',     ph:5.4,rainfall:1800,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'dimapur':         {soil:'Alluvial',     ph:5.8,rainfall:1700,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'mokokchung':      {soil:'Laterite',     ph:5.4,rainfall:2000,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'wokha':           {soil:'Laterite',     ph:5.4,rainfall:1800,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'zunheboto':       {soil:'Laterite',     ph:5.3,rainfall:2000,temp_max:24,temp_min:2,  climate:'Humid',      humidity:'High'   },
  'tuensang':        {soil:'Laterite',     ph:5.3,rainfall:2200,temp_max:24,temp_min:2,  climate:'Humid',      humidity:'High'   },
  'mon':             {soil:'Laterite',     ph:5.5,rainfall:2000,temp_max:28,temp_min:6,  climate:'Humid',      humidity:'High'   },
  'phek':            {soil:'Laterite',     ph:5.3,rainfall:2200,temp_max:24,temp_min:2,  climate:'Humid',      humidity:'High'   },
  'kiphire':         {soil:'Laterite',     ph:5.3,rainfall:2200,temp_max:24,temp_min:2,  climate:'Humid',      humidity:'High'   },
  'longleng':        {soil:'Laterite',     ph:5.4,rainfall:2000,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'peren':           {soil:'Alluvial',     ph:5.6,rainfall:1800,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },

  // ── TRIPURA ─────────────────────────────────────────────────────────────────
  'west tripura':    {soil:'Alluvial',     ph:5.8,rainfall:2000,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'agartala':        {soil:'Alluvial',     ph:5.8,rainfall:2000,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'east tripura':    {soil:'Alluvial',     ph:5.7,rainfall:2200,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'north tripura':   {soil:'Alluvial',     ph:5.7,rainfall:2200,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'south tripura':   {soil:'Laterite',     ph:5.6,rainfall:2500,temp_max:32,temp_min:12, climate:'Humid',      humidity:'High'   },
  'dhalai':          {soil:'Red Loam',     ph:5.7,rainfall:2400,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'gomati':          {soil:'Alluvial',     ph:5.8,rainfall:2200,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'khowai':          {soil:'Alluvial',     ph:5.8,rainfall:2000,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'sepahijala':      {soil:'Alluvial',     ph:5.9,rainfall:1900,temp_max:34,temp_min:10, climate:'Humid',      humidity:'High'   },
  'unokoti':         {soil:'Red Loam',     ph:5.7,rainfall:2200,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },

  // ── SIKKIM ──────────────────────────────────────────────────────────────────
  'gangtok':         {soil:'Mountain Loam',ph:5.7,rainfall:2000,temp_max:24,temp_min:2,  climate:'Temperate',  humidity:'High'   },
  'east sikkim':     {soil:'Mountain Loam',ph:5.7,rainfall:2000,temp_max:24,temp_min:2,  climate:'Temperate',  humidity:'High'   },
  'west sikkim':     {soil:'Mountain Loam',ph:5.5,rainfall:3000,temp_max:22,temp_min:0,  climate:'Temperate',  humidity:'High'   },
  'north sikkim':    {soil:'Mountain Loam',ph:5.4,rainfall:2500,temp_max:18,temp_min:-4, climate:'Alpine',     humidity:'Medium' },
  'south sikkim':    {soil:'Mountain Loam',ph:5.6,rainfall:2500,temp_max:24,temp_min:2,  climate:'Temperate',  humidity:'High'   },

  // ── ARUNACHAL PRADESH ───────────────────────────────────────────────────────
  'itanagar':        {soil:'Laterite',     ph:5.5,rainfall:2500,temp_max:28,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'papum pare':      {soil:'Alluvial',     ph:5.6,rainfall:2200,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'east siang':      {soil:'Alluvial',     ph:5.6,rainfall:2800,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'west siang':      {soil:'Mountain Loam',ph:5.4,rainfall:3000,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'upper siang':     {soil:'Mountain Loam',ph:5.3,rainfall:3500,temp_max:24,temp_min:2,  climate:'Humid',      humidity:'High'   },
  'lohit':           {soil:'Alluvial',     ph:5.5,rainfall:2500,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'changlang':       {soil:'Alluvial',     ph:5.5,rainfall:2600,temp_max:30,temp_min:10, climate:'Humid',      humidity:'High'   },
  'tirap':           {soil:'Alluvial',     ph:5.5,rainfall:2800,temp_max:30,temp_min:10, climate:'Humid',      humidity:'High'   },
  'tawang':          {soil:'Mountain Loam',ph:5.2,rainfall:1500,temp_max:16,temp_min:-6, climate:'Alpine',     humidity:'Medium' },
  'west kameng':     {soil:'Mountain Loam',ph:5.3,rainfall:2800,temp_max:22,temp_min:2,  climate:'Temperate',  humidity:'High'   },
  'east kameng':     {soil:'Mountain Loam',ph:5.4,rainfall:2500,temp_max:24,temp_min:4,  climate:'Temperate',  humidity:'High'   },
  'kurung kumey':    {soil:'Mountain Loam',ph:5.3,rainfall:2800,temp_max:22,temp_min:2,  climate:'Humid',      humidity:'High'   },
  'subansiri':       {soil:'Mountain Loam',ph:5.4,rainfall:3000,temp_max:24,temp_min:4,  climate:'Humid',      humidity:'High'   },

  // ── GOA ─────────────────────────────────────────────────────────────────────
  'north goa':       {soil:'Laterite',     ph:5.6,rainfall:3000,temp_max:33,temp_min:20, climate:'Humid',      humidity:'High'   },
  'south goa':       {soil:'Laterite',     ph:5.5,rainfall:3000,temp_max:33,temp_min:20, climate:'Humid',      humidity:'High'   },
  'panaji':          {soil:'Laterite',     ph:5.6,rainfall:2900,temp_max:33,temp_min:20, climate:'Humid',      humidity:'High'   },

  // ── JAMMU & KASHMIR ─────────────────────────────────────────────────────────
  'srinagar':        {soil:'Alluvial',     ph:6.8,rainfall:650, temp_max:30,temp_min:-4, climate:'Temperate',  humidity:'Medium' },
  'jammu':           {soil:'Alluvial',     ph:7.0,rainfall:1100,temp_max:40,temp_min:4,  climate:'Temperate',  humidity:'Medium' },
  'anantnag':        {soil:'Mountain Loam',ph:6.5,rainfall:700, temp_max:28,temp_min:-6, climate:'Temperate',  humidity:'Medium' },
  'baramulla':       {soil:'Mountain Loam',ph:6.5,rainfall:700, temp_max:26,temp_min:-4, climate:'Temperate',  humidity:'Medium' },
  'budgam':          {soil:'Alluvial',     ph:6.8,rainfall:650, temp_max:28,temp_min:-4, climate:'Temperate',  humidity:'Medium' },
  'kupwara':         {soil:'Mountain Loam',ph:6.4,rainfall:800, temp_max:24,temp_min:-6, climate:'Temperate',  humidity:'Medium' },
  'pulwama':         {soil:'Alluvial',     ph:6.7,rainfall:700, temp_max:28,temp_min:-4, climate:'Temperate',  humidity:'Medium' },
  'shopian':         {soil:'Alluvial',     ph:6.6,rainfall:720, temp_max:26,temp_min:-4, climate:'Temperate',  humidity:'Medium' },
  'kulgam':          {soil:'Mountain Loam',ph:6.5,rainfall:750, temp_max:26,temp_min:-4, climate:'Temperate',  humidity:'Medium' },
  'ganderbal':       {soil:'Alluvial',     ph:6.7,rainfall:680, temp_max:28,temp_min:-4, climate:'Temperate',  humidity:'Medium' },
  'kathua':          {soil:'Alluvial',     ph:7.0,rainfall:1000,temp_max:40,temp_min:4,  climate:'Temperate',  humidity:'Medium' },
  'udhampur':        {soil:'Mountain Loam',ph:6.8,rainfall:1100,temp_max:36,temp_min:2,  climate:'Temperate',  humidity:'Medium' },
  'reasi':           {soil:'Mountain Loam',ph:6.7,rainfall:1100,temp_max:36,temp_min:2,  climate:'Temperate',  humidity:'Medium' },
  'rajouri':         {soil:'Mountain Loam',ph:6.8,rainfall:1000,temp_max:36,temp_min:2,  climate:'Temperate',  humidity:'Medium' },
  'poonch':          {soil:'Mountain Loam',ph:6.6,rainfall:1200,temp_max:32,temp_min:0,  climate:'Temperate',  humidity:'Medium' },
  'doda':            {soil:'Mountain Loam',ph:6.5,rainfall:1200,temp_max:30,temp_min:-2, climate:'Temperate',  humidity:'High'   },
  'ramban':          {soil:'Mountain Loam',ph:6.6,rainfall:1100,temp_max:32,temp_min:0,  climate:'Temperate',  humidity:'Medium' },
  'kishtwar':        {soil:'Mountain Loam',ph:6.4,rainfall:1000,temp_max:28,temp_min:-4, climate:'Temperate',  humidity:'Medium' },

  // ── LADAKH ───────────────────────────────────────────────────────────────────
  'leh':             {soil:'Sandy',        ph:8.2,rainfall:100, temp_max:25,temp_min:-20,climate:'Arid',       humidity:'Very Low'},
  'kargil':          {soil:'Sandy',        ph:8.0,rainfall:150, temp_max:26,temp_min:-18,climate:'Arid',       humidity:'Very Low'},

  // ── REMAINING ASSAM DISTRICTS ───────────────────────────────────────────────
  'dhubri':          {soil:'Alluvial',     ph:5.8,rainfall:2200,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'kokrajhar':       {soil:'Alluvial',     ph:5.8,rainfall:2500,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'bongaigaon':      {soil:'Alluvial',     ph:5.8,rainfall:2200,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'chirang':         {soil:'Alluvial',     ph:5.7,rainfall:2400,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'dhemaji':         {soil:'Alluvial',     ph:5.6,rainfall:2800,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'lakhimpur':       {soil:'Alluvial',     ph:5.6,rainfall:2600,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'tinsukia':        {soil:'Alluvial',     ph:5.5,rainfall:3000,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'majuli':          {soil:'Alluvial',     ph:5.6,rainfall:2200,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'morigaon':        {soil:'Alluvial',     ph:5.8,rainfall:1700,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'marigaon':        {soil:'Alluvial',     ph:5.8,rainfall:1700,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'nalbari':         {soil:'Alluvial',     ph:5.8,rainfall:1800,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'baksa':           {soil:'Alluvial',     ph:5.7,rainfall:2200,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'udalguri':        {soil:'Alluvial',     ph:5.7,rainfall:2400,temp_max:30,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'karbi anglong':   {soil:'Red Laterite', ph:5.5,rainfall:1800,temp_max:32,temp_min:8,  climate:'Humid',      humidity:'High'   },
  'west karbi anglong':{soil:'Red Laterite',ph:5.5,rainfall:1800,temp_max:32,temp_min:8, climate:'Humid',     humidity:'High'   },
  'dima hasao':      {soil:'Laterite',     ph:5.4,rainfall:2500,temp_max:26,temp_min:4,  climate:'Humid',      humidity:'High'   },
  'hailakandi':      {soil:'Alluvial',     ph:5.7,rainfall:2500,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },
  'karimganj':       {soil:'Alluvial',     ph:5.7,rainfall:2500,temp_max:32,temp_min:10, climate:'Humid',      humidity:'High'   },

  // ── REMAINING MP DISTRICTS ───────────────────────────────────────────────────
  'agar malwa':      {soil:'Black Cotton', ph:7.5,rainfall:900, temp_max:42,temp_min:8,  climate:'Semi-arid',  humidity:'Low'    },
  'burhanpur':       {soil:'Black Cotton', ph:7.3,rainfall:950, temp_max:42,temp_min:10, climate:'Tropical',   humidity:'Medium' },
  'sheopur':         {soil:'Sandy Loam',   ph:7.6,rainfall:800, temp_max:44,temp_min:6,  climate:'Semi-arid',  humidity:'Low'    },
  'rajgarh':         {soil:'Black Cotton', ph:7.5,rainfall:900, temp_max:42,temp_min:8,  climate:'Semi-arid',  humidity:'Low'    },
  'betul':           {soil:'Red Sandy',    ph:6.4,rainfall:1200,temp_max:40,temp_min:8,  climate:'Tropical',   humidity:'Medium' },

  // ── REMAINING RAJASTHAN ──────────────────────────────────────────────────────
  'pratapgarh':      {soil:'Sandy Loam',   ph:7.4,rainfall:700, temp_max:42,temp_min:8,  climate:'Semi-arid',  humidity:'Low'    },

  // ── REMAINING UP DISTRICTS ───────────────────────────────────────────────────
  'shamli':          {soil:'Alluvial',     ph:7.8,rainfall:750, temp_max:44,temp_min:4,  climate:'Continental',humidity:'Medium' },
  'amroha':          {soil:'Alluvial',     ph:7.5,rainfall:900, temp_max:42,temp_min:4,  climate:'Continental',humidity:'Medium' },
  'balrampur':       {soil:'Alluvial',     ph:7.2,rainfall:1050,temp_max:40,temp_min:4,  climate:'Tropical',   humidity:'High'   },
  'bahraich':        {soil:'Alluvial',     ph:7.2,rainfall:1100,temp_max:40,temp_min:4,  climate:'Tropical',   humidity:'High'   },
  'shravasti':       {soil:'Alluvial',     ph:7.2,rainfall:1100,temp_max:40,temp_min:4,  climate:'Tropical',   humidity:'High'   },
  'agra':            {soil:'Alluvial',     ph:7.8,rainfall:680, temp_max:46,temp_min:4,  climate:'Continental',humidity:'Low'    },
  'ambedkar nagar':  {soil:'Alluvial',     ph:7.2,rainfall:1000,temp_max:42,temp_min:6,  climate:'Tropical',   humidity:'High'   },
  'amethi':          {soil:'Alluvial',     ph:7.3,rainfall:950, temp_max:42,temp_min:4,  climate:'Tropical',   humidity:'Medium' },
  'bhadohi':         {soil:'Alluvial',     ph:7.2,rainfall:1000,temp_max:42,temp_min:6,  climate:'Tropical',   humidity:'Medium' },
  'sant ravidas nagar':{soil:'Alluvial',   ph:7.2,rainfall:1000,temp_max:42,temp_min:6,  climate:'Tropical',   humidity:'Medium' },

  // ── REMAINING KARNATAKA ──────────────────────────────────────────────────────
  'bangalore urban': {soil:'Red Loam',     ph:6.3,rainfall:880, temp_max:33,temp_min:15, climate:'Tropical',   humidity:'Medium' },
  'tumkur':          {soil:'Red Sandy',    ph:6.0,rainfall:700, temp_max:35,temp_min:16, climate:'Semi-arid',  humidity:'Low'    },

  // ── PUDUCHERRY ──────────────────────────────────────────────────────────────
  'puducherry':      {soil:'Sandy Loam',   ph:6.8,rainfall:1300,temp_max:36,temp_min:20, climate:'Tropical',   humidity:'High'   },
  'karaikal':        {soil:'Alluvial',     ph:7.0,rainfall:1400,temp_max:36,temp_min:22, climate:'Tropical',   humidity:'High'   },
  'mahe':            {soil:'Laterite',     ph:5.7,rainfall:3000,temp_max:33,temp_min:20, climate:'Humid',      humidity:'High'   },
  'yanam':           {soil:'Alluvial',     ph:6.8,rainfall:1100,temp_max:38,temp_min:18, climate:'Tropical',   humidity:'High'   },

  // ── CHANDIGARH ──────────────────────────────────────────────────────────────
  'chandigarh':      {soil:'Alluvial',     ph:7.6,rainfall:700, temp_max:42,temp_min:4,  climate:'Continental',humidity:'Medium' },

  // ── ANDAMAN & NICOBAR ───────────────────────────────────────────────────────
  'north and middle andaman':{soil:'Laterite',ph:5.5,rainfall:3000,temp_max:32,temp_min:22,climate:'Humid',humidity:'Very High'},
  'south andaman':   {soil:'Laterite',     ph:5.5,rainfall:3000,temp_max:32,temp_min:22, climate:'Humid',      humidity:'Very High'},
  'nicobars':        {soil:'Sandy',        ph:6.0,rainfall:3500,temp_max:32,temp_min:24, climate:'Humid',      humidity:'Very High'},

  // ── LAKSHADWEEP ─────────────────────────────────────────────────────────────
  'lakshadweep':     {soil:'Sandy',        ph:6.5,rainfall:1600,temp_max:32,temp_min:22, climate:'Humid',      humidity:'High'   },
  'agatti':          {soil:'Sandy',        ph:6.5,rainfall:1500,temp_max:32,temp_min:22, climate:'Humid',      humidity:'High'   },
  'kavaratti':       {soil:'Sandy',        ph:6.5,rainfall:1600,temp_max:32,temp_min:22, climate:'Humid',      humidity:'High'   },
});


// ─── IMPROVED LOOKUP — 4-level fallback with fuzzy matching ──────────────────
function getLocationData(rawDistrict, rawState) {
  const distKey  = normalize(rawDistrict || '');
  const stateKey = normalize(rawState    || '');

  // 1. Exact district match
  if (distKey && DISTRICT_DATA[distKey]) {
    return { ...DISTRICT_DATA[distKey], source: 'district' };
  }

  // 2. Fuzzy district match — handles spelling variants and partial names
  if (distKey) {
    // a. District key contains query or query contains key
    let match = Object.keys(DISTRICT_DATA).find(k =>
      k.includes(distKey) || distKey.includes(k)
    );
    // b. Word-level match — any significant word (>4 chars) matches
    if (!match) {
      const words = distKey.split(' ').filter(w => w.length > 4);
      match = Object.keys(DISTRICT_DATA).find(k =>
        words.some(w => k.includes(w))
      );
    }
    if (match) return { ...DISTRICT_DATA[match], source: 'district_fuzzy' };
  }

  // 3. State-level fallback
  if (stateKey && STATE_DEFAULTS[stateKey]) {
    const sd = STATE_DEFAULTS[stateKey];
    return {
      soil: sd.soil, ph: sd.ph, rainfall: sd.rainfall,
      temp_max: sd.temp_max, temp_min: sd.temp_min,
      climate: sd.climate, humidity: sd.humidity,
      source: 'state_fallback',
    };
  }

  // 4. Generic India average
  return {
    soil: 'Loam', ph: 7.0, rainfall: 800,
    temp_max: 38, temp_min: 12,
    climate: 'Tropical', humidity: 'Medium', source: 'default',
  };
}

function getStatePrimaryCrops(rawState) {
  const key = normalize(rawState || '');
  return STATE_DEFAULTS[key]?.primary_crops || [];
}

function getAllStates() {
  return Object.keys(STATE_DEFAULTS)
    .map(s => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    .sort();
}

function getAllDistricts() {
  return Object.keys(DISTRICT_DATA)
    .map(d => d.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    .sort();
}

module.exports = {
  getLocationData, getStatePrimaryCrops,
  getAllStates, getAllDistricts,
  STATE_DEFAULTS, DISTRICT_DATA, normalize,
};
