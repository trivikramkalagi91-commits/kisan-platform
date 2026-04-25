const express = require('express');
const router = express.Router();
const { getSoilData, getSoilHealthTip } = require('../data/soilData');
const { getLocationBasedRecommendations, LOCATION_CLIMATE, getClimateKey } = require('../data/cropRecommendationData');

const DISTRICT_ENRICHMENT = {
  'Karnataka': {
    'Raichur':         { topCrops: ['Cotton', 'Paddy', 'Sunflower'], market: 'Raichur APMC' },
    'Dharwad':         { topCrops: ['Maize', 'Chilli', 'Soybean'],  market: 'Hubli APMC' },
    'Bangalore Rural': { topCrops: ['Tomato', 'Beans', 'Marigold'], market: 'Bengaluru APMC' },
  },
  'Maharashtra': {
    'Nashik':  { topCrops: ['Onion', 'Grapes', 'Tomato'],   market: 'Lasalgaon APMC' },
    'Nagpur':  { topCrops: ['Orange', 'Cotton', 'Soybean'], market: 'Nagpur APMC' },
  },
  'Punjab': {
    'Ludhiana': { topCrops: ['Wheat', 'Maize', 'Rice'], market: 'Ludhiana Mandi' },
  },
  'Andhra Pradesh': {
    'Guntur': { topCrops: ['Chilli', 'Groundnut', 'Cotton'], market: 'Guntur Mirchi Yard' },
  },
};

router.post('/recommend', (req, res) => {
  const {
    state, district, land_acres, water_availability, season,
    lat, lng, detected_temp, detected_humidity, detected_rainfall
  } = req.body;

  const overrideClimate = (detected_temp != null && detected_humidity != null && detected_rainfall != null)
    ? { temp: parseFloat(detected_temp), humidity: parseFloat(detected_humidity), rainfall: parseFloat(detected_rainfall) }
    : null;

  const recommendations = getLocationBasedRecommendations(
    state, district, overrideClimate,
    water_availability, season, land_acres || 1
  );

  const soilData = getSoilData(district, state);

  const soilEnriched = recommendations.map(crop => {
    let soilBoost = 0;
    let soilNote = crop.location_match_note;

    if (soilData) {
      const { soil_type, moisture_level } = soilData;
      const soilTypeMap = {
        'Black':    ['Cotton', 'Soybean', 'Wheat', 'Paddy', 'Rice', 'Sunflower'],
        'Alluvial': ['Wheat', 'Paddy', 'Rice', 'Maize', 'Sugarcane', 'Banana'],
        'Red':      ['Groundnut', 'Maize', 'Millet', 'Pigeon Peas', 'Mango', 'Coffee'],
        'Laterite': ['Coconut', 'Coffee', 'Cashew', 'Rubber', 'Papaya', 'Rice'],
        'Desert':   ['Moth Beans', 'Mung Bean', 'Muskmelon', 'Chickpea', 'Lentil'],
      };
      const goodCrops = soilTypeMap[soil_type] || [];
      if (goodCrops.some(c => crop.crop.toLowerCase().includes(c.toLowerCase()))) {
        soilBoost = 8;
        soilNote += ' · \u2713 Soil type match';
      }
      if (moisture_level === 'Low' && crop.water_need === 'high') soilBoost -= 10;
      if (moisture_level === 'High' && crop.water_need === 'high') soilBoost += 5;
    }

    const districtInfo = DISTRICT_ENRICHMENT[state]?.[district];
    if (districtInfo && districtInfo.topCrops.some(c => crop.crop.toLowerCase().includes(c.toLowerCase()))) {
      soilBoost += 5;
      soilNote += ` · Popular in ${district}`;
    }

    return { ...crop, location_match_note: soilNote, _final_score: (crop.location_score || 0) + soilBoost };
  });

  const result = soilEnriched
    .sort((a, b) => b._final_score - a._final_score)
    .map(({ _final_score, ...rest }) => rest)
    .slice(0, 10);

  const soilSummary = soilData ? {
    region_matched: `${district || ''}, ${state || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
    soil_type:      soilData.soil_type,
    soil_ph:        soilData.soil_ph,
    moisture_level: soilData.moisture_level,
    organic_carbon: soilData.organic_carbon,
    health_tip:     getSoilHealthTip(soilData),
  } : null;

  const climateKey = getClimateKey(state, district);
  const climateUsed = overrideClimate
    ? { ...overrideClimate, source: 'GPS-detected' }
    : { ...((LOCATION_CLIMATE[climateKey] || LOCATION_CLIMATE['default'])), source: `Region profile (${climateKey})` };

  res.json({ success: true, state, district, lat: lat||null, lng: lng||null, climate_used: climateUsed, soil_data: soilSummary, data: result });
});

router.get('/states', (req, res) => {
  const states = [
    'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Goa',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
    'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
    'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
    'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
  ];
  res.json({ success: true, data: states });
});

router.get('/districts/:state', (req, res) => {
  const districtMap = {
    'Karnataka': ['Bangalore Rural','Bangalore Urban','Belgaum','Bellary','Bidar','Chamarajanagar','Chikmagalur','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysore','Raichur','Ramanagara','Shivamogga','Tumkur','Udupi','Uttara Kannada','Vijayapura','Yadgir'],
    'Maharashtra': ['Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana','Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai','Nagpur','Nanded','Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal'],
    'Punjab': ['Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Fazilka','Ferozepur','Gurdaspur','Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga','Mohali','Muktsar','Pathankot','Patiala','Rupnagar','Sangrur','Tarn Taran'],
    'Andhra Pradesh': ['Chittoor','East Godavari','Guntur','Krishna','Kurnool','Nellore','Prakasam','Srikakulam','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa'],
    'Tamil Nadu': ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kancheepuram','Karur','Krishnagiri','Madurai','Nagapattinam','Namakkal','Nilgiris','Pudukkottai','Ramanathapuram','Salem','Sivaganga','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tiruppur','Tiruvallur','Tiruvannamalai','Vellore','Villupuram','Virudhunagar'],
    'Telangana': ['Adilabad','Bhadradri Kothagudem','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Komaram Bheem','Mahabubabad','Mahbubnagar','Mancherial','Medak','Medchal','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Ranga Reddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal Rural','Warangal Urban','Yadadri Bhuvanagiri'],
    'Gujarat': ['Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka','Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch','Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad'],
    'Rajasthan': ['Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner','Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Hanumangarh','Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Sri Ganganagar','Tonk','Udaipur'],
    'Uttar Pradesh': ['Agra','Aligarh','Allahabad','Ambedkar Nagar','Azamgarh','Bahraich','Ballia','Barabanki','Bareilly','Bijnor','Bulandshahr','Deoria','Etah','Faizabad','Farrukhabad','Fatehpur','Firozabad','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hardoi','Jaunpur','Jhansi','Kanpur Nagar','Lakhimpur Kheri','Lucknow','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Raebareli','Saharanpur','Sitapur','Sultanpur','Varanasi'],
    'West Bengal': ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur'],
    'Madhya Pradesh': ['Agar Malwa','Alirajpur','Anuppur','Ashoknagar','Balaghat','Barwani','Betul','Bhind','Bhopal','Burhanpur','Chhatarpur','Chhindwara','Damoh','Datia','Dewas','Dhar','Dindori','Guna','Gwalior','Harda','Hoshangabad','Indore','Jabalpur','Jhabua','Katni','Khandwa','Khargone','Mandla','Mandsaur','Morena','Narsinghpur','Neemuch','Niwari','Panna','Raisen','Rajgarh','Ratlam','Rewa','Sagar','Satna','Sehore','Seoni','Shahdol','Shajapur','Sheopur','Shivpuri','Sidhi','Singrauli','Tikamgarh','Ujjain','Umaria','Vidisha'],
    'Bihar': ['Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar','Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger','Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa','Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali','West Champaran'],
    'Kerala': ['Alappuzha','Ernakulam','Idukki','Kannur','Kasaragod','Kollam','Kottayam','Kozhikode','Malappuram','Palakkad','Pathanamthitta','Thiruvananthapuram','Thrissur','Wayanad'],
    'Haryana': ['Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram','Hisar','Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh','Nuh','Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa','Sonipat','Yamunanagar'],
  };
  const districts = districtMap[req.params.state] || [];
  res.json({ success: true, data: districts });
});

router.get('/soil', (req, res) => {
  const { district, state } = req.query;
  const soilData = getSoilData(district, state);
  if (!soilData) return res.status(404).json({ success: false, message: 'No soil data found for this region.' });
  res.json({ success: true, region: `${district || ''}, ${state || ''}`.trim(), ...soilData, health_tip: getSoilHealthTip(soilData) });
});

router.get('/climate-profile', (req, res) => {
  const { state, district } = req.query;
  const climateKey = getClimateKey(state, district);
  const profile = LOCATION_CLIMATE[climateKey] || LOCATION_CLIMATE['default'];
  res.json({ success: true, climate_key: climateKey, profile });
});

module.exports = router;
