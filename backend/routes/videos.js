const express = require('express');
const router = express.Router();

function ytSearch(channel, query) {
  const channelQuery = {
    'DD Kisan':      'DD Kisan',
    'ICAR':          'ICAR India official',
    'Krishi Jagran': 'Krishi Jagran',
    'UAS Dharwad':   'UAS Dharwad',
    'PAU Ludhiana':  'PAU Ludhiana',
  };
  const ch = channelQuery[channel] || channel;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(ch + ' ' + query)}`;
}

// Multilingual aliases: English / Kannada / Hindi for every crop
const CROP_ALIASES = {
  'Paddy':        ['paddy','rice','ಭತ್ತ','ಅಕ್ಕಿ','धान','चावल'],
  'Wheat':        ['wheat','ಗೋಧಿ','गेहूं','गेहूँ'],
  'Maize':        ['maize','corn','ಮೆಕ್ಕೆಜೋಳ','मक्का','भुट्टा'],
  'Jowar':        ['jowar','sorghum','ಜೋಳ','ज्वार'],
  'Bajra':        ['bajra','pearl millet','ಸಜ್ಜೆ','बाजरा'],
  'Ragi':         ['ragi','finger millet','nachni','ರಾಗಿ','रागी','नाचनी'],
  'Barley':       ['barley','ಜವೆ ಗೋಧಿ','जौ'],
  'Tur Dal':      ['tur','arhar','pigeon pea','ತೊಗರಿ','तुअर','अरहर'],
  'Moong Dal':    ['moong','green gram','ಹೆಸರು ಕಾಳು','मूंग'],
  'Urad Dal':     ['urad','black gram','ಉದ್ದು','उड़द'],
  'Chana':        ['chana','chickpea','gram','ಕಡಲೆ','चना','छोला'],
  'Lentil':       ['lentil','masur','ಮಸೂರ','मसूर'],
  'Groundnut':    ['groundnut','peanut','ಕಡಲೆಕಾಯಿ','मूंगफली'],
  'Soybean':      ['soybean','soya','ಸೋಯಾಬೀನ್','सोयाबीन'],
  'Sunflower':    ['sunflower','ಸೂರ್ಯಕಾಂತಿ','सूरजमुखी'],
  'Mustard':      ['mustard','rapeseed','ಸಾಸಿವೆ','सरसों','राई'],
  'Sesame':       ['sesame','til','ಎಳ್ಳು','तिल'],
  'Tomato':       ['tomato','ಟೊಮೆಟೊ','टमाटर'],
  'Onion':        ['onion','ಈರುಳ್ಳಿ','प्याज','प्याज़'],
  'Potato':       ['potato','ಆಲೂಗಡ್ಡೆ','आलू'],
  'Brinjal':      ['brinjal','eggplant','baingan','ಬದನೆಕಾಯಿ','बैंगन'],
  'Cabbage':      ['cabbage','ಎಲೆಕೋಸು','पत्तागोभी','बंदगोभी'],
  'Cauliflower':  ['cauliflower','ಹೂಕೋಸು','फूलगोभी'],
  'Okra':         ['okra','ladyfinger','bhendi','ಬೆಂಡೆಕಾಯಿ','भिंडी'],
  'Peas':         ['peas','ಬಟಾಣಿ','मटर'],
  'Bitter Gourd': ['bitter gourd','karela','ಹಾಗಲಕಾಯಿ','करेला'],
  'Bottle Gourd': ['bottle gourd','lauki','ಸೋರೆಕಾಯಿ','लौकी'],
  'Cucumber':     ['cucumber','ಸೌತೆಕಾಯಿ','खीरा'],
  'Pumpkin':      ['pumpkin','ಕುಂಬಳಕಾಯಿ','कद्दू'],
  'Drumstick':    ['drumstick','moringa','ನುಗ್ಗೆಕಾಯಿ','सहजन'],
  'Spinach':      ['spinach','palak','ಪಾಲಕ್','पालक'],
  'Carrot':       ['carrot','ಗಾಜರ','गाजर'],
  'Garlic':       ['garlic','ಬೆಳ್ಳುಳ್ಳಿ','लहसुन'],
  'Ginger':       ['ginger','ಶುಂಠಿ','अदरक'],
  'Capsicum':     ['capsicum','bell pepper','ಕ್ಯಾಪ್ಸಿಕಂ','शिमला मिर्च'],
  'Mango':        ['mango','ಮಾವು','आम'],
  'Banana':       ['banana','ಬಾಳೆ','केला'],
  'Grape':        ['grape','ದ್ರಾಕ್ಷಿ','अंगूर'],
  'Pomegranate':  ['pomegranate','ದಾಳಿಂಬೆ','अनार'],
  'Papaya':       ['papaya','ಪಪ್ಪಾಯ','पपीता'],
  'Guava':        ['guava','ಸೀಬೆ','अमरूद'],
  'Coconut':      ['coconut','ತೆಂಗಿನಕಾಯಿ','नारियल'],
  'Lemon':        ['lemon','citrus','ನಿಂಬೆ','नींबू'],
  'Watermelon':   ['watermelon','ಕಲ್ಲಂಗಡಿ','तरबूज'],
  'Cotton':       ['cotton','ಹತ್ತಿ','कपास'],
  'Sugarcane':    ['sugarcane','ಕಬ್ಬು','गन्ना','ईख'],
  'Turmeric':     ['turmeric','haldi','ಅರಿಶಿನ','हल्दी'],
  'Chilli':       ['chilli','chili','pepper','ಮೆಣಸಿನಕಾಯಿ','मिर्च'],
  'Cardamom':     ['cardamom','elaichi','ಏಲಕ್ಕಿ','इलायची'],
  'Pepper':       ['pepper','black pepper','ಕಾಳುಮೆಣಸು','काली मिर्च'],
  'Coffee':       ['coffee','ಕಾಫಿ','कॉफी'],
  'Arecanut':     ['arecanut','betelnut','ಅಡಿಕೆ','सुपारी'],
};

const VIDEOS = [
  // PADDY
  { id:'v-paddy-1', crop:'Paddy', language:'Kannada', channel:'DD Kisan', level:'Beginner',
    title:'ಭತ್ತ ಬೇಸಾಯ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ — SRI ಪದ್ಧತಿ', duration:'28 min', views:'2.3L',
    youtube_url: ytSearch('DD Kisan','paddy SRI method Karnataka Kannada'),
    tags:['paddy','rice','ಭತ್ತ','ಅಕ್ಕಿ','sri','kharif'] },
  { id:'v-paddy-2', crop:'Paddy', language:'Hindi', channel:'ICAR', level:'Beginner',
    title:'धान की खेती — बीज उपचार और किस्म चुनाव', duration:'22 min', views:'1.8L',
    youtube_url: ytSearch('ICAR','paddy variety selection seed treatment Hindi'),
    tags:['paddy','धान','seeds','variety'] },
  { id:'v-paddy-3', crop:'Paddy', language:'English', channel:'ICAR', level:'Advanced',
    title:'Paddy Pest Management — Blast & BPH Control', duration:'18 min', views:'95K',
    youtube_url: ytSearch('ICAR','paddy pest management blast BPH control'),
    tags:['paddy','rice','pest','disease','blast'] },

  // WHEAT
  { id:'v-wheat-1', crop:'Wheat', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'गेहूं की खेती — रबी सीजन सम्पूर्ण मार्गदर्शिका', duration:'25 min', views:'5.6L',
    youtube_url: ytSearch('DD Kisan','wheat farming rabi season Hindi'),
    tags:['wheat','गेहूं','rabi','msp'] },
  { id:'v-wheat-2', crop:'Wheat', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಗೋಧಿ ಬೇಸಾಯ — ತಳಿ ಆಯ್ಕೆ ಮತ್ತು ಬಿತ್ತನೆ ಮಾರ್ಗದರ್ಶಿ', duration:'20 min', views:'1.1L',
    youtube_url: ytSearch('UAS Dharwad','wheat farming variety selection Kannada'),
    tags:['wheat','ಗೋಧಿ','rabi','sowing'] },
  { id:'v-wheat-3', crop:'Wheat', language:'English', channel:'PAU Ludhiana', level:'Intermediate',
    title:'Wheat Rust Disease Identification and Control', duration:'20 min', views:'1.1L',
    youtube_url: ytSearch('PAU Ludhiana','wheat rust disease identification control'),
    tags:['wheat','disease','rust','fungicide'] },

  // MAIZE
  { id:'v-maize-1', crop:'Maize', language:'Hindi', channel:'ICAR', level:'Beginner',
    title:'मक्का की खेती — उच्च उत्पादन तकनीक', duration:'22 min', views:'2.1L',
    youtube_url: ytSearch('ICAR','maize farming high yield techniques Hindi'),
    tags:['maize','मक्का','corn','yield'] },
  { id:'v-maize-2', crop:'Maize', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಮೆಕ್ಕೆಜೋಳ ಬೆಳೆ — ಸಂಪೂರ್ಣ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ', duration:'19 min', views:'98K',
    youtube_url: ytSearch('UAS Dharwad','maize crop farming guide Kannada'),
    tags:['maize','ಮೆಕ್ಕೆಜೋಳ','kharif'] },
  { id:'v-maize-3', crop:'Maize', language:'English', channel:'ICAR', level:'Advanced',
    title:'Maize Fall Armyworm Detection and Management', duration:'17 min', views:'76K',
    youtube_url: ytSearch('ICAR','maize fall armyworm detection management'),
    tags:['maize','pest','armyworm'] },

  // JOWAR
  { id:'v-jowar-1', crop:'Jowar', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಜೋಳ ಬೇಸಾಯ — ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಅಧಿಕ ಇಳುವರಿ', duration:'21 min', views:'1.4L',
    youtube_url: ytSearch('UAS Dharwad','jowar sorghum farming Kannada low water'),
    tags:['jowar','ಜೋಳ','sorghum','dryland'] },
  { id:'v-jowar-2', crop:'Jowar', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'ज्वार की खेती — किस्में और उत्पादन तकनीक', duration:'18 min', views:'1.1L',
    youtube_url: ytSearch('DD Kisan','jowar sorghum farming varieties Hindi'),
    tags:['jowar','ज्वार','sorghum','kharif'] },
  { id:'v-jowar-3', crop:'Jowar', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Jowar Cultivation: Variety Selection and Pest Control', duration:'16 min', views:'55K',
    youtube_url: ytSearch('ICAR','jowar sorghum cultivation variety pest control'),
    tags:['jowar','sorghum','pest','variety'] },

  // BAJRA
  { id:'v-bajra-1', crop:'Bajra', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'बाजरा की खेती — उन्नत किस्में और सिंचाई', duration:'19 min', views:'1.3L',
    youtube_url: ytSearch('DD Kisan','bajra pearl millet farming Hindi varieties'),
    tags:['bajra','बाजरा','pearl millet'] },
  { id:'v-bajra-2', crop:'Bajra', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಸಜ್ಜೆ ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'17 min', views:'72K',
    youtube_url: ytSearch('UAS Dharwad','bajra pearl millet farming Kannada'),
    tags:['bajra','ಸಜ್ಜೆ','pearl millet','dryland'] },
  { id:'v-bajra-3', crop:'Bajra', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Bajra Downy Mildew Disease Control', duration:'14 min', views:'45K',
    youtube_url: ytSearch('ICAR','bajra pearl millet downy mildew disease control'),
    tags:['bajra','disease','downy mildew'] },

  // RAGI
  { id:'v-ragi-1', crop:'Ragi', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ರಾಗಿ ಬೇಸಾಯ — ಕರ್ನಾಟಕದ ಮುಖ್ಯ ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ', duration:'24 min', views:'3.2L',
    youtube_url: ytSearch('UAS Dharwad','ragi finger millet farming Karnataka Kannada'),
    tags:['ragi','ರಾಗಿ','finger millet','nachni','kharif'] },
  { id:'v-ragi-2', crop:'Ragi', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'रागी की खेती — पोषण से भरपूर अनाज उत्पादन', duration:'18 min', views:'89K',
    youtube_url: ytSearch('DD Kisan','ragi finger millet farming Hindi'),
    tags:['ragi','रागी','finger millet','nachni'] },
  { id:'v-ragi-3', crop:'Ragi', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Ragi Blast Disease Management and Yield Improvement', duration:'16 min', views:'61K',
    youtube_url: ytSearch('ICAR','ragi finger millet blast disease management'),
    tags:['ragi','disease','blast','yield'] },

  // TOMATO
  { id:'v-tomato-1', crop:'Tomato', language:'Kannada', channel:'Krishi Jagran', level:'Beginner',
    title:'ಟೊಮೆಟೊ ಬೆಳೆ — ಹೈಬ್ರಿಡ್ ತಳಿ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'24 min', views:'3.1L',
    youtube_url: ytSearch('Krishi Jagran','tomato hybrid variety farming Kannada'),
    tags:['tomato','ಟೊಮೆಟೊ','hybrid','horticulture'] },
  { id:'v-tomato-2', crop:'Tomato', language:'Hindi', channel:'DD Kisan', level:'Intermediate',
    title:'टमाटर की खेती — ड्रिप सिंचाई और रोग प्रबंधन', duration:'19 min', views:'1.5L',
    youtube_url: ytSearch('DD Kisan','tomato drip irrigation disease management Hindi'),
    tags:['tomato','टमाटर','drip','irrigation'] },
  { id:'v-tomato-3', crop:'Tomato', language:'English', channel:'ICAR', level:'Advanced',
    title:'Tomato Disease Control — Early Blight and Wilt', duration:'21 min', views:'88K',
    youtube_url: ytSearch('ICAR','tomato early blight wilt disease control'),
    tags:['tomato','disease','blight','wilt'] },

  // ONION
  { id:'v-onion-1', crop:'Onion', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಈರುಳ್ಳಿ ಬೇಸಾಯ — ನೆಡುವಿಕೆಯಿಂದ ಸಂಗ್ರಹಣೆವರೆಗೆ', duration:'22 min', views:'2.1L',
    youtube_url: ytSearch('UAS Dharwad','onion farming planting to storage Kannada'),
    tags:['onion','ಈರುಳ್ಳಿ','storage','rabi'] },
  { id:'v-onion-2', crop:'Onion', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'प्याज की खेती — नाशिक विधि चरण दर चरण', duration:'23 min', views:'3.4L',
    youtube_url: ytSearch('Krishi Jagran','onion farming Nashik method Hindi'),
    tags:['onion','प्याज','nashik','storage'] },
  { id:'v-onion-3', crop:'Onion', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Onion Thrips Management and Post-Harvest Storage', duration:'18 min', views:'92K',
    youtube_url: ytSearch('ICAR','onion thrips management post harvest storage'),
    tags:['onion','pest','thrips','storage'] },

  // POTATO
  { id:'v-potato-1', crop:'Potato', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'आलू की खेती — उन्नत तकनीक और रोग नियंत्रण', duration:'24 min', views:'4.1L',
    youtube_url: ytSearch('DD Kisan','potato farming advanced technique disease control Hindi'),
    tags:['potato','आलू','rabi','disease'] },
  { id:'v-potato-2', crop:'Potato', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಆಲೂಗಡ್ಡೆ ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ', duration:'20 min', views:'1.2L',
    youtube_url: ytSearch('UAS Dharwad','potato farming complete guide Kannada'),
    tags:['potato','ಆಲೂಗಡ್ಡೆ','rabi'] },
  { id:'v-potato-3', crop:'Potato', language:'English', channel:'ICAR', level:'Advanced',
    title:'Potato Late Blight Disease Identification and Management', duration:'17 min', views:'78K',
    youtube_url: ytSearch('ICAR','potato late blight disease identification management'),
    tags:['potato','disease','blight'] },

  // BRINJAL
  { id:'v-brinjal-1', crop:'Brinjal', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಬದನೆಕಾಯಿ ಬೇಸಾಯ — ತಳಿ ಆಯ್ಕೆ ಮತ್ತು ಪೋಷಣೆ', duration:'18 min', views:'1.4L',
    youtube_url: ytSearch('UAS Dharwad','brinjal eggplant farming Kannada variety'),
    tags:['brinjal','ಬದನೆಕಾಯಿ','eggplant','baingan'] },
  { id:'v-brinjal-2', crop:'Brinjal', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'बैंगन की खेती — रोग और कीट प्रबंधन', duration:'16 min', views:'1.1L',
    youtube_url: ytSearch('Krishi Jagran','brinjal baingan farming disease pest Hindi'),
    tags:['brinjal','बैंगन','eggplant','pest'] },
  { id:'v-brinjal-3', crop:'Brinjal', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Brinjal Shoot and Fruit Borer Control', duration:'15 min', views:'62K',
    youtube_url: ytSearch('ICAR','brinjal shoot fruit borer control'),
    tags:['brinjal','pest','borer'] },

  // OKRA
  { id:'v-okra-1', crop:'Okra', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಬೆಂಡೆಕಾಯಿ ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'16 min', views:'1.1L',
    youtube_url: ytSearch('UAS Dharwad','okra bhendi ladyfinger farming Kannada'),
    tags:['okra','ಬೆಂಡೆಕಾಯಿ','bhendi','ladyfinger'] },
  { id:'v-okra-2', crop:'Okra', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'भिंडी की खेती — उन्नत किस्में और सिंचाई प्रबंधन', duration:'17 min', views:'1.3L',
    youtube_url: ytSearch('DD Kisan','okra bhindi farming varieties Hindi'),
    tags:['okra','भिंडी','bhendi'] },
  { id:'v-okra-3', crop:'Okra', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Okra Yellow Vein Mosaic Virus — Identification and Control', duration:'14 min', views:'54K',
    youtube_url: ytSearch('ICAR','okra yellow vein mosaic virus control'),
    tags:['okra','disease','virus','mosaic'] },

  // CHILLI
  { id:'v-chilli-1', crop:'Chilli', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಮೆಣಸಿನಕಾಯಿ ಬೇಸಾಯ — ಬ್ಯಾಡಗಿ ತಳಿ ಮಾರ್ಗದರ್ಶಿ', duration:'26 min', views:'2.8L',
    youtube_url: ytSearch('UAS Dharwad','Byadagi chilli farming Kannada'),
    tags:['chilli','ಮೆಣಸಿನಕಾಯಿ','byadagi','horticulture'] },
  { id:'v-chilli-2', crop:'Chilli', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'मिर्च की खेती — उन्नत तकनीक और रोग नियंत्रण', duration:'20 min', views:'1.7L',
    youtube_url: ytSearch('Krishi Jagran','chilli pepper farming technique Hindi'),
    tags:['chilli','मिर्च','horticulture'] },
  { id:'v-chilli-3', crop:'Chilli', language:'English', channel:'ICAR', level:'Advanced',
    title:'Chilli Thrips and Mite Control — Integrated Approach', duration:'17 min', views:'76K',
    youtube_url: ytSearch('ICAR','chilli thrips mite control integrated pest management'),
    tags:['chilli','pest','thrips','mite'] },

  // COTTON
  { id:'v-cotton-1', crop:'Cotton', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಹತ್ತಿ ಬೇಸಾಯ — BT ತಳಿ ಬಿತ್ತನೆಯಿಂದ ಕೊಯ್ಲುವರೆಗೆ', duration:'28 min', views:'2.4L',
    youtube_url: ytSearch('UAS Dharwad','cotton BT variety farming Kannada'),
    tags:['cotton','ಹತ್ತಿ','bt cotton','kharif'] },
  { id:'v-cotton-2', crop:'Cotton', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'कपास की खेती — बुवाई से कटाई तक पूरी जानकारी', duration:'32 min', views:'4.2L',
    youtube_url: ytSearch('DD Kisan','cotton BT farming sowing picking Hindi'),
    tags:['cotton','कपास','bt cotton','kharif'] },
  { id:'v-cotton-3', crop:'Cotton', language:'English', channel:'Krishi Jagran', level:'Advanced',
    title:'Cotton Pink Bollworm Control and Resistance Management', duration:'15 min', views:'1.2L',
    youtube_url: ytSearch('Krishi Jagran','cotton pink bollworm control resistance management'),
    tags:['cotton','pest','bollworm'] },

  // SUGARCANE
  { id:'v-sugarcane-1', crop:'Sugarcane', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಕಬ್ಬು ಬೇಸಾಯ — ನಾಟಿಯಿಂದ ಕಟಾವಿಗೆ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'30 min', views:'2.7L',
    youtube_url: ytSearch('UAS Dharwad','sugarcane farming planting harvest Kannada'),
    tags:['sugarcane','ಕಬ್ಬು','jaggery','kharif'] },
  { id:'v-sugarcane-2', crop:'Sugarcane', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'गन्ने की खेती — उन्नत तकनीक और रोग प्रबंधन', duration:'26 min', views:'3.5L',
    youtube_url: ytSearch('DD Kisan','sugarcane farming advanced technique Hindi'),
    tags:['sugarcane','गन्ना','ईख','jaggery'] },
  { id:'v-sugarcane-3', crop:'Sugarcane', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Sugarcane Ratoon Management for Higher Yields', duration:'20 min', views:'88K',
    youtube_url: ytSearch('ICAR','sugarcane ratoon management higher yield'),
    tags:['sugarcane','ratoon','yield'] },

  // GROUNDNUT
  { id:'v-groundnut-1', crop:'Groundnut', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಕಡಲೆಕಾಯಿ ಬೇಸಾಯ — ಕರ್ನಾಟಕಕ್ಕೆ ಸೂಕ್ತ ತಳಿಗಳು', duration:'20 min', views:'1.6L',
    youtube_url: ytSearch('UAS Dharwad','groundnut peanut farming Karnataka Kannada'),
    tags:['groundnut','ಕಡಲೆಕಾಯಿ','peanut','oilseed'] },
  { id:'v-groundnut-2', crop:'Groundnut', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'मूंगफली की खेती — बुवाई, पोषण और कटाई', duration:'18 min', views:'1.4L',
    youtube_url: ytSearch('DD Kisan','groundnut peanut farming Hindi'),
    tags:['groundnut','मूंगफली','peanut','oilseed'] },
  { id:'v-groundnut-3', crop:'Groundnut', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Groundnut Leaf Spot and Rust Disease Management', duration:'16 min', views:'68K',
    youtube_url: ytSearch('ICAR','groundnut leaf spot rust disease management'),
    tags:['groundnut','disease','leaf spot','rust'] },

  // SOYBEAN
  { id:'v-soybean-1', crop:'Soybean', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'सोयाबीन की खेती — उन्नत तकनीक और कटाई', duration:'21 min', views:'2.3L',
    youtube_url: ytSearch('DD Kisan','soybean farming advanced technique Hindi'),
    tags:['soybean','सोयाबीन','oilseed','kharif'] },
  { id:'v-soybean-2', crop:'Soybean', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಸೋಯಾಬೀನ್ ಬೇಸಾಯ — ಹೆಚ್ಚಿನ ಇಳುವರಿಗೆ ಸಲಹೆಗಳು', duration:'19 min', views:'1.1L',
    youtube_url: ytSearch('UAS Dharwad','soybean farming high yield Kannada'),
    tags:['soybean','ಸೋಯಾಬೀನ್','oilseed'] },
  { id:'v-soybean-3', crop:'Soybean', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Soybean Yellow Mosaic Virus and Stem Fly Management', duration:'15 min', views:'59K',
    youtube_url: ytSearch('ICAR','soybean yellow mosaic virus stem fly management'),
    tags:['soybean','disease','virus','pest'] },

  // TUR DAL
  { id:'v-tur-1', crop:'Tur Dal', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ತೊಗರಿ ಬೇಸಾಯ — ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ದ್ವಿದಳ ಧಾನ್ಯ', duration:'22 min', views:'1.8L',
    youtube_url: ytSearch('UAS Dharwad','tur dal arhar pigeon pea farming Kannada'),
    tags:['tur dal','ತೊಗರಿ','arhar','pigeon pea','pulse'] },
  { id:'v-tur-2', crop:'Tur Dal', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'अरहर / तुअर दाल की खेती — सम्पूर्ण जानकारी', duration:'20 min', views:'2.1L',
    youtube_url: ytSearch('DD Kisan','arhar tur dal pigeon pea farming Hindi'),
    tags:['tur dal','तुअर','अरहर','pigeon pea','pulse'] },
  { id:'v-tur-3', crop:'Tur Dal', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Pigeon Pea Wilt and Sterility Mosaic Disease Control', duration:'17 min', views:'72K',
    youtube_url: ytSearch('ICAR','pigeon pea tur wilt sterility mosaic disease control'),
    tags:['tur dal','disease','wilt','mosaic'] },

  // MOONG DAL
  { id:'v-moong-1', crop:'Moong Dal', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಹೆಸರು ಕಾಳು ಬೇಸಾಯ — ಬೇಸಿಗೆ ಮತ್ತು ಖಾರಿಫ್ ಮಾರ್ಗದರ್ಶಿ', duration:'18 min', views:'1.1L',
    youtube_url: ytSearch('UAS Dharwad','moong green gram farming Kannada'),
    tags:['moong dal','ಹೆಸರು ಕಾಳು','green gram','pulse'] },
  { id:'v-moong-2', crop:'Moong Dal', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'मूंग की खेती — गर्मी और खरीफ सीजन', duration:'16 min', views:'1.4L',
    youtube_url: ytSearch('DD Kisan','moong green gram farming Hindi'),
    tags:['moong dal','मूंग','green gram','pulse'] },
  { id:'v-moong-3', crop:'Moong Dal', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Moong Bean Yellow Mosaic Virus Management', duration:'13 min', views:'48K',
    youtube_url: ytSearch('ICAR','moong bean yellow mosaic virus management'),
    tags:['moong dal','disease','virus'] },

  // CHANA
  { id:'v-chana-1', crop:'Chana', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'चना (छोला) की खेती — रबी सीजन गाइड', duration:'20 min', views:'2.8L',
    youtube_url: ytSearch('DD Kisan','chana chickpea gram farming rabi Hindi'),
    tags:['chana','चना','छोला','chickpea','rabi'] },
  { id:'v-chana-2', crop:'Chana', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಕಡಲೆ ಬೇಸಾಯ — ರಬಿ ಋತು ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'18 min', views:'1.2L',
    youtube_url: ytSearch('UAS Dharwad','chana chickpea farming rabi Kannada'),
    tags:['chana','ಕಡಲೆ','chickpea','gram','rabi'] },
  { id:'v-chana-3', crop:'Chana', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Chickpea Wilt and Root Rot Management', duration:'15 min', views:'63K',
    youtube_url: ytSearch('ICAR','chickpea chana wilt root rot disease management'),
    tags:['chana','disease','wilt','root rot'] },

  // SUNFLOWER
  { id:'v-sunflower-1', crop:'Sunflower', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಸೂರ್ಯಕಾಂತಿ ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'19 min', views:'1.3L',
    youtube_url: ytSearch('UAS Dharwad','sunflower farming complete guide Kannada'),
    tags:['sunflower','ಸೂರ್ಯಕಾಂತಿ','oilseed'] },
  { id:'v-sunflower-2', crop:'Sunflower', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'सूरजमुखी की खेती — उन्नत तकनीक', duration:'17 min', views:'1.1L',
    youtube_url: ytSearch('DD Kisan','sunflower farming advanced technique Hindi'),
    tags:['sunflower','सूरजमुखी','oilseed'] },
  { id:'v-sunflower-3', crop:'Sunflower', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Sunflower Downy Mildew and Alternaria Blight Control', duration:'14 min', views:'42K',
    youtube_url: ytSearch('ICAR','sunflower downy mildew alternaria blight control'),
    tags:['sunflower','disease','blight','mildew'] },

  // MUSTARD
  { id:'v-mustard-1', crop:'Mustard', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'सरसों की खेती — रबी सीजन पूरी जानकारी', duration:'20 min', views:'3.2L',
    youtube_url: ytSearch('DD Kisan','mustard rapeseed farming rabi Hindi'),
    tags:['mustard','सरसों','राई','rapeseed','rabi'] },
  { id:'v-mustard-2', crop:'Mustard', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಸಾಸಿವೆ ಬೇಸಾಯ — ರಬಿ ಋತು ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'16 min', views:'72K',
    youtube_url: ytSearch('UAS Dharwad','mustard farming rabi Kannada'),
    tags:['mustard','ಸಾಸಿವೆ','rapeseed','rabi'] },
  { id:'v-mustard-3', crop:'Mustard', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Mustard Aphid and Alternaria Blight Management', duration:'14 min', views:'55K',
    youtube_url: ytSearch('ICAR','mustard aphid alternaria blight disease management'),
    tags:['mustard','pest','aphid','disease'] },

  // TURMERIC
  { id:'v-turmeric-1', crop:'Turmeric', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಅರಿಶಿನ ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ', duration:'22 min', views:'1.9L',
    youtube_url: ytSearch('UAS Dharwad','turmeric haldi farming Kannada'),
    tags:['turmeric','ಅರಿಶಿನ','haldi','spice'] },
  { id:'v-turmeric-2', crop:'Turmeric', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'हल्दी की खेती — बुवाई से भंडारण तक', duration:'20 min', views:'1.7L',
    youtube_url: ytSearch('Krishi Jagran','turmeric haldi farming planting storage Hindi'),
    tags:['turmeric','हल्दी','spice','storage'] },
  { id:'v-turmeric-3', crop:'Turmeric', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Turmeric Rhizome Rot and Leaf Blotch Management', duration:'15 min', views:'64K',
    youtube_url: ytSearch('ICAR','turmeric rhizome rot leaf blotch disease management'),
    tags:['turmeric','disease','rhizome rot'] },

  // GINGER
  { id:'v-ginger-1', crop:'Ginger', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಶುಂಠಿ ಬೇಸಾಯ — ನಾಟಿ, ಪೋಷಣೆ ಮತ್ತು ಸಂಗ್ರಹಣೆ', duration:'20 min', views:'1.4L',
    youtube_url: ytSearch('UAS Dharwad','ginger farming planting storage Kannada'),
    tags:['ginger','ಶುಂಠಿ','spice','rhizome'] },
  { id:'v-ginger-2', crop:'Ginger', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'अदरक की खेती — उन्नत तकनीक और उत्पादन', duration:'18 min', views:'1.6L',
    youtube_url: ytSearch('DD Kisan','ginger farming advanced technique Hindi'),
    tags:['ginger','अदरक','spice'] },
  { id:'v-ginger-3', crop:'Ginger', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Ginger Soft Rot Disease — Prevention and Management', duration:'14 min', views:'56K',
    youtube_url: ytSearch('ICAR','ginger soft rot disease prevention management'),
    tags:['ginger','disease','soft rot'] },

  // BANANA
  { id:'v-banana-1', crop:'Banana', language:'Kannada', channel:'UAS Dharwad', level:'Intermediate',
    title:'ಬಾಳೆ ಟಿಶ್ಯೂ ಕಲ್ಚರ್ ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'29 min', views:'1.9L',
    youtube_url: ytSearch('UAS Dharwad','banana tissue culture farming Kannada'),
    tags:['banana','ಬಾಳೆ','tissue culture','horticulture'] },
  { id:'v-banana-2', crop:'Banana', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'केला की खेती — उन्नत तकनीक और रोग प्रबंधन', duration:'24 min', views:'2.3L',
    youtube_url: ytSearch('Krishi Jagran','banana farming advanced technique disease Hindi'),
    tags:['banana','केला','horticulture'] },
  { id:'v-banana-3', crop:'Banana', language:'English', channel:'ICAR', level:'Advanced',
    title:'Banana Panama Wilt and Sigatoka Disease Management', duration:'18 min', views:'82K',
    youtube_url: ytSearch('ICAR','banana panama wilt sigatoka disease management'),
    tags:['banana','disease','wilt','sigatoka'] },

  // MANGO
  { id:'v-mango-1', crop:'Mango', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಮಾವು ತೋಟ — ಬೇಸಾಯ, ಗೊಬ್ಬರ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ', duration:'25 min', views:'2.6L',
    youtube_url: ytSearch('UAS Dharwad','mango orchard farming disease Kannada'),
    tags:['mango','ಮಾವು','orchard','horticulture'] },
  { id:'v-mango-2', crop:'Mango', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'आम की खेती — बागवानी और रोग नियंत्रण', duration:'22 min', views:'3.1L',
    youtube_url: ytSearch('DD Kisan','mango farming orchard disease control Hindi'),
    tags:['mango','आम','orchard'] },
  { id:'v-mango-3', crop:'Mango', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Mango Powdery Mildew, Anthracnose and Mealybug Management', duration:'19 min', views:'91K',
    youtube_url: ytSearch('ICAR','mango powdery mildew anthracnose mealybug management'),
    tags:['mango','disease','pest','mealybug'] },

  // COCONUT
  { id:'v-coconut-1', crop:'Coconut', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ತೆಂಗಿನಕಾಯಿ ತೋಟ — ಸಂಪೂರ್ಣ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ', duration:'23 min', views:'2.2L',
    youtube_url: ytSearch('UAS Dharwad','coconut farming plantation Kannada'),
    tags:['coconut','ತೆಂಗಿನಕಾಯಿ','plantation'] },
  { id:'v-coconut-2', crop:'Coconut', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'नारियल की खेती — रोपण से कटाई तक', duration:'20 min', views:'1.8L',
    youtube_url: ytSearch('DD Kisan','coconut farming planting harvest Hindi'),
    tags:['coconut','नारियल','plantation'] },
  { id:'v-coconut-3', crop:'Coconut', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Coconut Root Wilt and Bud Rot Disease Management', duration:'16 min', views:'74K',
    youtube_url: ytSearch('ICAR','coconut root wilt bud rot disease management'),
    tags:['coconut','disease','root wilt','bud rot'] },

  // POMEGRANATE
  { id:'v-pomegranate-1', crop:'Pomegranate', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ದಾಳಿಂಬೆ ತೋಟ — ಬೇಸಾಯ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ', duration:'20 min', views:'1.7L',
    youtube_url: ytSearch('UAS Dharwad','pomegranate farming disease control Kannada'),
    tags:['pomegranate','ದಾಳಿಂಬೆ','horticulture'] },
  { id:'v-pomegranate-2', crop:'Pomegranate', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'अनार की खेती — उन्नत तकनीक और रोग प्रबंधन', duration:'18 min', views:'2.1L',
    youtube_url: ytSearch('Krishi Jagran','pomegranate farming advanced technique Hindi'),
    tags:['pomegranate','अनार','horticulture'] },
  { id:'v-pomegranate-3', crop:'Pomegranate', language:'English', channel:'ICAR', level:'Advanced',
    title:'Pomegranate Bacterial Blight and Fruit Borer Management', duration:'15 min', views:'66K',
    youtube_url: ytSearch('ICAR','pomegranate bacterial blight fruit borer management'),
    tags:['pomegranate','disease','bacterial blight','pest'] },

  // ARECANUT
  { id:'v-arecanut-1', crop:'Arecanut', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಅಡಿಕೆ ತೋಟ — ಬೇಸಾಯ, ಗೊಬ್ಬರ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ', duration:'26 min', views:'3.4L',
    youtube_url: ytSearch('UAS Dharwad','arecanut betelnut farming Kannada disease'),
    tags:['arecanut','ಅಡಿಕೆ','betelnut','plantation'] },
  { id:'v-arecanut-2', crop:'Arecanut', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'सुपारी की खेती — रोपण, पोषण और रोग प्रबंधन', duration:'22 min', views:'1.4L',
    youtube_url: ytSearch('Krishi Jagran','arecanut betelnut farming Hindi disease'),
    tags:['arecanut','सुपारी','betelnut','plantation'] },
  { id:'v-arecanut-3', crop:'Arecanut', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Arecanut Koleroga (Mahali) and Bud Rot Disease Control', duration:'18 min', views:'88K',
    youtube_url: ytSearch('ICAR','arecanut koleroga mahali bud rot disease control'),
    tags:['arecanut','disease','koleroga','bud rot'] },

  // PAPAYA
  { id:'v-papaya-1', crop:'Papaya', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಪಪ್ಪಾಯ ಬೇಸಾಯ — ತ್ವರಿತ ಆದಾಯದ ಬೆಳೆ', duration:'17 min', views:'1.3L',
    youtube_url: ytSearch('UAS Dharwad','papaya farming quick income Kannada'),
    tags:['papaya','ಪಪ್ಪಾಯ','horticulture'] },
  { id:'v-papaya-2', crop:'Papaya', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'पपीते की खेती — जल्दी आमदनी और उत्पादन', duration:'16 min', views:'1.9L',
    youtube_url: ytSearch('DD Kisan','papaya farming quick income Hindi'),
    tags:['papaya','पपीता','horticulture'] },
  { id:'v-papaya-3', crop:'Papaya', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Papaya Ring Spot Virus Management', duration:'13 min', views:'57K',
    youtube_url: ytSearch('ICAR','papaya ring spot virus management disease'),
    tags:['papaya','disease','virus','ring spot'] },

  // CABBAGE
  { id:'v-cabbage-1', crop:'Cabbage', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಎಲೆಕೋಸು ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'16 min', views:'98K',
    youtube_url: ytSearch('UAS Dharwad','cabbage farming Kannada'),
    tags:['cabbage','ಎಲೆಕೋಸು','vegetable','rabi'] },
  { id:'v-cabbage-2', crop:'Cabbage', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'पत्तागोभी की खेती — उन्नत तकनीक और कीट प्रबंधन', duration:'15 min', views:'1.1L',
    youtube_url: ytSearch('Krishi Jagran','cabbage farming pest management Hindi'),
    tags:['cabbage','पत्तागोभी','बंदगोभी','vegetable'] },
  { id:'v-cabbage-3', crop:'Cabbage', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Cabbage Diamondback Moth and Black Rot Management', duration:'13 min', views:'44K',
    youtube_url: ytSearch('ICAR','cabbage diamondback moth black rot management'),
    tags:['cabbage','pest','diamondback moth','disease'] },

  // CAULIFLOWER
  { id:'v-cauliflower-1', crop:'Cauliflower', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಹೂಕೋಸು ಬೇಸಾಯ — ಉತ್ತಮ ತಳಿ ಮತ್ತು ನೀರಾವರಿ', duration:'15 min', views:'86K',
    youtube_url: ytSearch('UAS Dharwad','cauliflower farming Kannada'),
    tags:['cauliflower','ಹೂಕೋಸು','vegetable'] },
  { id:'v-cauliflower-2', crop:'Cauliflower', language:'Hindi', channel:'DD Kisan', level:'Beginner',
    title:'फूलगोभी की खेती — किस्में और रोग प्रबंधन', duration:'16 min', views:'1.3L',
    youtube_url: ytSearch('DD Kisan','cauliflower farming varieties disease Hindi'),
    tags:['cauliflower','फूलगोभी','vegetable'] },
  { id:'v-cauliflower-3', crop:'Cauliflower', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Cauliflower Curding Disorders and Nutrient Management', duration:'13 min', views:'41K',
    youtube_url: ytSearch('ICAR','cauliflower curding disorders nutrient management'),
    tags:['cauliflower','nutrition','quality'] },

  // WATERMELON
  { id:'v-watermelon-1', crop:'Watermelon', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಕಲ್ಲಂಗಡಿ ಬೇಸಾಯ — ಬೇಸಿಗೆ ಕಾಲದ ಲಾಭದಾಯಕ ಬೆಳೆ', duration:'18 min', views:'1.5L',
    youtube_url: ytSearch('UAS Dharwad','watermelon farming summer Kannada'),
    tags:['watermelon','ಕಲ್ಲಂಗಡಿ','summer','horticulture'] },
  { id:'v-watermelon-2', crop:'Watermelon', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'तरबूज की खेती — गर्मी में अच्छी कमाई', duration:'17 min', views:'2.1L',
    youtube_url: ytSearch('Krishi Jagran','watermelon farming summer Hindi'),
    tags:['watermelon','तरबूज','summer'] },
  { id:'v-watermelon-3', crop:'Watermelon', language:'English', channel:'ICAR', level:'Intermediate',
    title:'Watermelon Fruit Fly and Downy Mildew Management', duration:'14 min', views:'52K',
    youtube_url: ytSearch('ICAR','watermelon fruit fly downy mildew management'),
    tags:['watermelon','pest','fruit fly','disease'] },

  // GRAPE
  { id:'v-grape-1', crop:'Grape', language:'Kannada', channel:'UAS Dharwad', level:'Intermediate',
    title:'ದ್ರಾಕ್ಷಿ ತೋಟ — ಕರ್ನಾಟಕಕ್ಕೆ ಸೂಕ್ತ ಬೇಸಾಯ ಮಾರ್ಗದರ್ಶಿ', duration:'28 min', views:'2.1L',
    youtube_url: ytSearch('UAS Dharwad','grape vineyard farming Karnataka Kannada'),
    tags:['grape','ದ್ರಾಕ್ಷಿ','vineyard','horticulture'] },
  { id:'v-grape-2', crop:'Grape', language:'Hindi', channel:'Krishi Jagran', level:'Intermediate',
    title:'अंगूर की खेती — छंटाई, सिंचाई और रोग नियंत्रण', duration:'24 min', views:'1.8L',
    youtube_url: ytSearch('Krishi Jagran','grape farming pruning irrigation disease Hindi'),
    tags:['grape','अंगूर','vineyard','pruning'] },
  { id:'v-grape-3', crop:'Grape', language:'English', channel:'ICAR', level:'Advanced',
    title:'Grape Powdery Mildew and Downy Mildew Disease Management', duration:'19 min', views:'78K',
    youtube_url: ytSearch('ICAR','grape powdery mildew downy mildew management'),
    tags:['grape','disease','powdery mildew'] },

  // PEPPER
  { id:'v-pepper-1', crop:'Pepper', language:'Kannada', channel:'UAS Dharwad', level:'Beginner',
    title:'ಕಾಳುಮೆಣಸು ಬೇಸಾಯ — ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ', duration:'20 min', views:'1.4L',
    youtube_url: ytSearch('UAS Dharwad','black pepper farming Kannada'),
    tags:['pepper','ಕಾಳುಮೆಣಸು','black pepper','spice'] },
  { id:'v-pepper-2', crop:'Pepper', language:'Hindi', channel:'Krishi Jagran', level:'Beginner',
    title:'काली मिर्च की खेती — बागवानी और रोग प्रबंधन', duration:'18 min', views:'1.2L',
    youtube_url: ytSearch('Krishi Jagran','black pepper farming disease Hindi'),
    tags:['pepper','काली मिर्च','spice'] },
  { id:'v-pepper-3', crop:'Pepper', language:'English', channel:'ICAR', level:'Advanced',
    title:'Black Pepper Phytophthora Rot and Pollu Beetle Management', duration:'16 min', views:'62K',
    youtube_url: ytSearch('ICAR','black pepper phytophthora rot pollu beetle'),
    tags:['pepper','disease','phytophthora','pest'] },

  // COFFEE
  { id:'v-coffee-1', crop:'Coffee', language:'Kannada', channel:'UAS Dharwad', level:'Intermediate',
    title:'ಕಾಫಿ ಬೇಸಾಯ — ಕರ್ನಾಟಕ ತೋಟ ನಿರ್ವಹಣೆ ಮಾರ್ಗದರ್ಶಿ', duration:'26 min', views:'1.8L',
    youtube_url: ytSearch('UAS Dharwad','coffee plantation farming Karnataka Kannada'),
    tags:['coffee','ಕಾಫಿ','plantation','coorg'] },
  { id:'v-coffee-2', crop:'Coffee', language:'Hindi', channel:'Krishi Jagran', level:'Intermediate',
    title:'कॉफी की खेती — बागान प्रबंधन और रोग नियंत्रण', duration:'22 min', views:'1.1L',
    youtube_url: ytSearch('Krishi Jagran','coffee plantation management disease Hindi'),
    tags:['coffee','कॉफी','plantation'] },
  { id:'v-coffee-3', crop:'Coffee', language:'English', channel:'ICAR', level:'Advanced',
    title:'Coffee White Stem Borer and Leaf Rust Disease Management', duration:'18 min', views:'74K',
    youtube_url: ytSearch('ICAR','coffee white stem borer leaf rust disease'),
    tags:['coffee','pest','disease','rust','borer'] },
];

// Build derived lookups
const CROPS     = [...new Set(VIDEOS.map(v => v.crop))].sort();
const LANGUAGES = [...new Set(VIDEOS.map(v => v.language))].sort();

// Build alias map: lowercased alias → canonical crop name
const ALIAS_MAP = {};
for (const [crop, aliases] of Object.entries(CROP_ALIASES)) {
  ALIAS_MAP[crop.toLowerCase()] = crop;
  for (const alias of aliases) {
    ALIAS_MAP[alias.toLowerCase()] = crop;
  }
}

// GET /api/videos?crop=&language=&level=&search=
router.get('/', (req, res) => {
  let { crop, language, level, search } = req.query;
  let videos = [...VIDEOS];

  if (crop)     videos = videos.filter(v => v.crop.toLowerCase() === crop.toLowerCase());
  if (language) videos = videos.filter(v => v.language.toLowerCase() === language.toLowerCase());
  if (level)    videos = videos.filter(v => v.level.toLowerCase() === level.toLowerCase());

  if (search) {
    const q = search.trim().toLowerCase();
    // Resolve multilingual alias to canonical crop name
    const resolvedCrop = ALIAS_MAP[q];
    videos = videos.filter(v => {
      if (resolvedCrop && v.crop === resolvedCrop) return true;
      if (v.title.toLowerCase().includes(q)) return true;
      if (v.tags.some(t => t.toLowerCase().includes(q))) return true;
      if (v.channel.toLowerCase().includes(q)) return true;
      if (v.language.toLowerCase().includes(q)) return true;
      // Partial alias match (handles partial Kannada/Hindi input)
      for (const [alias, canonical] of Object.entries(ALIAS_MAP)) {
        if (q.length >= 2 && alias.includes(q) && v.crop === canonical) return true;
      }
      return false;
    });
  }

  res.json({ success: true, count: videos.length, data: videos });
});

router.get('/crops',     (req, res) => res.json({ success: true, data: CROPS }));
router.get('/languages', (req, res) => res.json({ success: true, data: LANGUAGES }));

module.exports = router;
