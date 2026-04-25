const express = require('express');
const axios = require('axios');
const router = express.Router();

// ─── WMO Weather Code → human-readable description & icon ────────────────────
const WMO_CODES = {
  0:  { desc: 'Clear sky',                  icon: '☀️' },
  1:  { desc: 'Mainly clear',               icon: '🌤️' },
  2:  { desc: 'Partly cloudy',              icon: '⛅' },
  3:  { desc: 'Overcast',                   icon: '☁️' },
  45: { desc: 'Foggy',                      icon: '🌫️' },
  48: { desc: 'Depositing rime fog',        icon: '🌫️' },
  51: { desc: 'Light drizzle',              icon: '🌦️' },
  53: { desc: 'Moderate drizzle',           icon: '🌦️' },
  55: { desc: 'Dense drizzle',              icon: '🌧️' },
  61: { desc: 'Slight rain',                icon: '🌧️' },
  63: { desc: 'Moderate rain',              icon: '🌧️' },
  65: { desc: 'Heavy rain',                 icon: '🌧️' },
  71: { desc: 'Slight snowfall',            icon: '🌨️' },
  73: { desc: 'Moderate snowfall',          icon: '🌨️' },
  75: { desc: 'Heavy snowfall',             icon: '❄️' },
  80: { desc: 'Slight rain showers',        icon: '🌦️' },
  81: { desc: 'Moderate rain showers',      icon: '🌧️' },
  82: { desc: 'Violent rain showers',       icon: '⛈️' },
  95: { desc: 'Thunderstorm',               icon: '⛈️' },
  96: { desc: 'Thunderstorm with hail',     icon: '⛈️' },
  99: { desc: 'Thunderstorm + heavy hail',  icon: '⛈️' },
};

const RAINY_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];

function isRainyWeatherCode(code) {
  return RAINY_CODES.includes(code);
}

// ─── GET /weather — fetch live weather for given lat/lng ──────────────────────
router.get('/weather', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
    return res.status(400).json({
      success: false,
      error: 'lat and lng query parameters are required (valid numbers).',
    });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&hourly=precipitation_probability,temperature_2m,weather_code&forecast_days=1&timezone=auto`;

    const { data } = await axios.get(url, { timeout: 8000 });

    const current = data.current || {};
    const hourly  = data.hourly  || {};
    const weatherCode = current.weather_code ?? 0;
    const wmo = WMO_CODES[weatherCode] || { desc: 'Unknown', icon: '🌡️' };

    const precipProbs = (hourly.precipitation_probability || []).slice(0, 6);
    const maxRainProb = precipProbs.length > 0 ? Math.max(...precipProbs) : 0;
    const isCurrentlyRaining = isRainyWeatherCode(weatherCode);
    const rainLikely = maxRainProb >= 50 || isCurrentlyRaining;

    const hourlyForecast = [];
    const nowHour = new Date().getHours();
    for (let i = 0; i < Math.min(6, (hourly.time || []).length); i++) {
      const hCode = hourly.weather_code?.[i] ?? 0;
      const hWmo  = WMO_CODES[hCode] || { desc: 'Unknown', icon: '🌡️' };
      hourlyForecast.push({
        time:             hourly.time?.[i] || '',
        hour:             (nowHour + i) % 24,
        temperature:      hourly.temperature_2m?.[i],
        precipProbability: hourly.precipitation_probability?.[i] ?? 0,
        weatherCode:      hCode,
        icon:             hWmo.icon,
        desc:             hWmo.desc,
      });
    }

    res.json({
      success: true,
      weather: {
        temperature:        current.temperature_2m,
        feelsLike:          current.apparent_temperature,
        humidity:           current.relative_humidity_2m,
        windSpeed:          current.wind_speed_10m,
        pressure:           current.surface_pressure,
        weatherCode,
        description:        wmo.desc,
        icon:               wmo.icon,
        rainProbability:    maxRainProb,
        rainPrediction:     rainLikely ? 'yes' : 'no',
        isCurrentlyRaining,
        hourlyForecast,
      },
      timezone: data.timezone,
    });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(502).json({
      success: false,
      error: 'Failed to fetch weather data. Please try again or enter details manually.',
    });
  }
});

// ─── Crop Water Requirements (base litres per sq metre per session) ───────────
// More realistic agronomic values — litres/m²
const CROP_WATER = {
  rice:        8.0,
  wheat:       5.5,
  maize:       6.5,
  cotton:      7.0,
  sugarcane:   9.0,
  soybean:     5.8,
  groundnut:   4.8,
  mustard:     4.2,
  millet:      3.5,
  barley:      4.5,
  sunflower:   5.5,
  chickpea:    3.8,
  pigeon_pea:  4.3,
  sesame:      3.6,
  jute:        7.5,
  potato:      6.2,
  onion:       5.0,
  tomato:      6.8,
  chilli:      5.5,
  turmeric:    6.0,
};

const ACRE_TO_SQM = 4046.86;
const DEFAULT_FLOW_RATE_LPM = 200; // 200 Liters per minute (typical for 3-5HP pump)

// ─── Soil Factor (water retention — affects how much water is needed) ─────────
// sandy drains fast → needs more; clay retains → needs less
const SOIL_FACTOR = {
  sandy:    1.30,
  loamy:    1.00,
  clay:     0.80,
  silt:     0.90,
  peaty:    0.70,
  chalky:   1.10,
  saline:   1.20,
  black:    0.85,
  red:      1.05,
  laterite: 1.15,
  alluvial: 0.95,
};

// ─── Climate Factor ────────────────────────────────────────────────────────────
// Combines temperature + humidity to model actual evapotranspiration demand.
// High temp + low humidity = crop loses more water → needs more irrigation.
// Low temp + high humidity = less demand.
function getClimateFactor(temperature, humidity) {
  // Temperature component: scaled 0.8 – 1.4
  let tempFactor;
  if      (temperature > 40) tempFactor = 1.40;
  else if (temperature > 35) tempFactor = 1.30;
  else if (temperature > 28) tempFactor = 1.15;
  else if (temperature > 20) tempFactor = 1.00;
  else if (temperature > 12) tempFactor = 0.90;
  else                        tempFactor = 0.80;

  // Humidity component: drier air increases evaporation demand
  // humidity 0-30%: +15%, 31-50%: +5%, 51-70%: neutral, 71-100%: -10%
  let humFactor;
  if      (humidity <= 30) humFactor = 1.15;
  else if (humidity <= 50) humFactor = 1.05;
  else if (humidity <= 70) humFactor = 1.00;
  else                      humFactor = 0.90;

  // Combined climate factor (average of both components)
  return Math.round(((tempFactor + humFactor) / 2) * 100) / 100;
}

// ─── Compute water for a single crop ─────────────────────────────────────────
function computeWater(cropKey, soilKey, temperature, humidity, area = 1) {
  const base          = CROP_WATER[cropKey];
  const soilFactor    = SOIL_FACTOR[soilKey];
  const climateFactor = getClimateFactor(temperature, humidity);
  const litresPerSqM  = Math.round(base * soilFactor * climateFactor * 10) / 10;
  
  const totalLitres = Math.round(litresPerSqM * ACRE_TO_SQM * area);
  const minutes     = Math.round(totalLitres / DEFAULT_FLOW_RATE_LPM);

  return { base, soilFactor, climateFactor, litresPerSqM, totalLitres, minutes, area };
}

// ─── Validation helper ────────────────────────────────────────────────────────
function validateInput(body) {
  const errors = [];
  const { cropType, soilType, temperature, humidity, rainPrediction } = body;

  if (!cropType || typeof cropType !== 'string') {
    errors.push('cropType is required.');
  } else if (!CROP_WATER[cropType.toLowerCase()]) {
    errors.push(`Unknown crop type: "${cropType}". Valid options: ${Object.keys(CROP_WATER).join(', ')}`);
  }

  if (!soilType || typeof soilType !== 'string') {
    errors.push('soilType is required.');
  } else if (!SOIL_FACTOR[soilType.toLowerCase()]) {
    errors.push(`Unknown soil type: "${soilType}". Valid options: ${Object.keys(SOIL_FACTOR).join(', ')}`);
  }

  if (temperature === undefined || temperature === null || temperature === '') {
    errors.push('temperature is required.');
  } else if (isNaN(Number(temperature))) {
    errors.push('temperature must be a number.');
  } else if (Number(temperature) < -10 || Number(temperature) > 60) {
    errors.push('temperature must be between -10°C and 60°C.');
  }

  // humidity is optional (defaults to 50 if not provided)
  if (humidity !== undefined && humidity !== null && humidity !== '') {
    if (isNaN(Number(humidity)) || Number(humidity) < 0 || Number(humidity) > 100) {
      errors.push('humidity must be a number between 0 and 100.');
    }
  }

  if (rainPrediction === undefined || rainPrediction === null || rainPrediction === '') {
    errors.push('rainPrediction is required (yes / no).');
  }

  return errors;
}

// ─── GET /options — return available crop & soil options ──────────────────────
router.get('/options', (req, res) => {
  res.json({
    success: true,
    crops: Object.keys(CROP_WATER).map(key => ({
      value:     key,
      label:     key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      baseWater: CROP_WATER[key],
    })),
    soils: Object.keys(SOIL_FACTOR).map(key => ({
      value:  key,
      label:  key.replace(/\b\w/g, c => c.toUpperCase()),
      factor: SOIL_FACTOR[key],
    })),
  });
});

// ─── POST /predict — compute irrigation for selected crop ─────────────────────
router.post('/predict', (req, res) => {
  try {
    const validationErrors = validateInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, errors: validationErrors });
    }

    const cropType       = String(req.body.cropType).toLowerCase();
    const soilType       = String(req.body.soilType).toLowerCase();
    const temperature    = Number(req.body.temperature);
    const humidity       = req.body.humidity !== undefined ? Number(req.body.humidity) : 50;
    const rainPrediction = String(req.body.rainPrediction).toLowerCase();

    if (rainPrediction === 'yes') {
      return res.json({
        success: true,
        irrigationNeeded: false,
        message: 'No irrigation needed today',
        details: {
          reason: 'Rain is predicted for today — natural rainfall will provide sufficient water.',
          cropType, soilType, temperature, humidity, rainPrediction: 'yes',
        },
      });
    }

    const area           = req.body.area ? Number(req.body.area) : 1;
    const { base, soilFactor, climateFactor, litresPerSqM, totalLitres, minutes } = computeWater(cropType, soilType, temperature, humidity, area);

    res.json({
      success:          true,
      irrigationNeeded: true,
      irrigationTime:   `${minutes} mins`,
      totalLitres:      totalLitres,
      area:             area,
      details: {
        baseCropWater: base,
        soilFactor,
        climateFactor,
        temperature,
        humidity,
        cropType,
        soilType,
        litresPerSqM,
        totalLitres,
        minutes,
        area,
        rainPrediction: 'no',
        formula: `${base} L/m2 * ${soilFactor} (soil) * ${climateFactor} (climate) = ${litresPerSqM} L/m2`,
      },
    });
  } catch (err) {
    console.error('Irrigation predict error:', err);
    res.status(500).json({ success: false, error: 'Internal server error in irrigation advisor.' });
  }
});

// ─── POST /predict-all — compute irrigation for ALL crops at once ─────────────
// Frontend sends: { soilType, temperature, humidity, rainPrediction }
// Returns water needs for every crop so farmer sees the full picture
router.post('/predict-all', (req, res) => {
  try {
    const { soilType, temperature, humidity, rainPrediction, area } = req.body;
    const farmArea = area ? Number(area) : 1;

    if (!soilType || typeof soilType !== 'string' || !SOIL_FACTOR[soilType.toLowerCase()]) {
      return res.status(400).json({ success: false, error: 'Valid soilType is required.' });
    }
    if (temperature === undefined || isNaN(Number(temperature))) {
      return res.status(400).json({ success: false, error: 'Valid temperature is required.' });
    }

    const soil    = soilType.toLowerCase();
    const temp    = Number(temperature);
    const hum     = humidity !== undefined ? Number(humidity) : 50;
    const isRain  = String(rainPrediction).toLowerCase() === 'yes';

    if (isRain) {
      return res.json({
        success: true,
        rainPrediction: 'yes',
        message: 'No irrigation needed — rain predicted.',
        crops: [],
      });
    }

    const crops = Object.keys(CROP_WATER).map(key => {
      const { litresPerSqM, totalLitres, minutes, soilFactor, climateFactor } = computeWater(key, soil, temp, hum, farmArea);
      return {
        value:       key,
        label:       key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        litresPerSqM,
        totalLitres,
        minutes,
        soilFactor,
        climateFactor,
        urgency:     litresPerSqM > 7 ? 'high' : litresPerSqM > 5 ? 'medium' : 'low',
      };
    }).sort((a, b) => b.litresPerSqM - a.litresPerSqM); // highest water need first

    res.json({
      success: true,
      rainPrediction: 'no',
      soilType: soil,
      temperature: temp,
      humidity: hum,
      area: farmArea,
      climateFactor: getClimateFactor(temp, hum),
      crops,
    });
  } catch (err) {
    console.error('Irrigation predict-all error:', err);
    res.status(500).json({ success: false, error: 'Internal server error in irrigation advisor.' });
  }
});

module.exports = router;