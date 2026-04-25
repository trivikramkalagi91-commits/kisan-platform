import React, { useState } from 'react';

// ─── State/District Data ─────────────────────────────────────────────────────
const STATES_DATA = {
  'Andaman and Nicobar Islands': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
  'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Kadapa', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari'],
  'Arunachal Pradesh': ['Tawang', 'West Kameng', 'East Kameng', 'Papum Pare', 'Kurung Kumey', 'Kra Daadi', 'Lower Subansiri', 'Upper Subansiri', 'West Siang', 'East Siang', 'Siang', 'Upper Siang', 'Lower Siang', 'Lower Dibang Valley', 'Dibang Valley', 'Anjaw', 'Lohit', 'Namsai', 'Changlang', 'Tirap', 'Longding'],
  'Assam': ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup Metropolitan', 'Kamrup', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'],
  'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
  'Chandigarh': ['Chandigarh'],
  'Chhattisgarh': ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
  'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
  'Jammu and Kashmir': ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'],
  'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribag', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela-Kharsawan', 'Simdega', 'West Singhbhum'],
  'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'],
  'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
  'Ladakh': ['Kargil', 'Leh'],
  'Lakshadweep': ['Lakshadweep'],
  'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'],
  'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
  'Mizoram': ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'],
  'Nagaland': ['Chumukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghapur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Sonepur', 'Sundargarh'],
  'Puducherry': ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr', 'Pathankot', 'Patiala', 'Rupnagar', 'Mohali', 'Sangrur', 'Tarn Taran'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
  'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal', 'Nagarkurnool', 'Nalgonda', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'],
  'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
  'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
  'West Bengal': ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'],
};

// ─── Buyer Categories ────────────────────────────────────────────────────────
const GOVT_BUYERS = [
  { name: 'FCI — Food Corporation of India', type: 'Central Govt', icon: '🇮🇳', desc: 'India\'s largest food grain procurement agency. Buys wheat, rice, and coarse grains at MSP.', benefits: ['100% MSP guaranteed', 'Direct bank payment', 'No middlemen', 'Procurement at doorstep in some states'], link: 'https://fci.gov.in', tag: 'MSP Guaranteed', states: ['All'] },
  { name: 'NAFED — National Agricultural Cooperative', type: 'Central Govt', icon: '🤝', desc: 'Procures oilseeds, pulses, and other crops under Price Support Scheme (PSS).', benefits: ['PSS price support', 'Cooperative model', 'Covers 25+ crops', 'State-level centers'], link: 'https://www.nafed-india.com', tag: 'Cooperative', states: ['All'] },
  { name: 'e-NAM — National Agriculture Market', type: 'Central Govt', icon: '💻', desc: 'Online trading platform connecting APMC mandis across India. Sell to buyers in any state.', benefits: ['Pan-India market access', 'Transparent bidding', 'Better price discovery', 'Reduced middlemen'], link: 'https://enam.gov.in', tag: 'Online Platform', states: ['All'] },
  { name: 'Tribal Cooperative (TRIFED)', type: 'Central Govt', icon: '🌿', desc: 'Procures minor forest produce, organic products, and tribal agricultural produce.', benefits: ['Fair trade prices', 'Organic premium', 'Van Dhan Kendras', 'Direct tribal support'], link: 'https://trifed.tribal.gov.in', tag: 'Tribal Farmers', states: ['All'] },
  { name: 'Karnataka State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Yeshwanthpur, Hubli, Mysuru, Raichur. Known for Ragi, Tur, Cotton, Spices.', benefits: ['Regulated weighing', 'Fair auction', 'Dispute resolution'], link: 'https://krishimarata.karnataka.gov.in/', tag: 'Karnataka', states: ['Karnataka'] },
  { name: 'Maharashtra State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Vashi, Pune, Nashik, Nagpur. Known for Onion, Grapes, Sugarcane.', benefits: ['Export facilitation', 'Pledge loan scheme', 'Direct marketing licenses'], link: 'https://www.msamb.com/', tag: 'Maharashtra', states: ['Maharashtra'] },
  { name: 'Madhya Pradesh Mandi Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Indore, Bhopal, Ujjain. Known for Soybean, Wheat, Gram, Garlic.', benefits: ['E-Uparjan portal', 'Bonus on MSP', 'Efficient procurement'], link: 'https://mpmandiboard.co.in/', tag: 'Madhya Pradesh', states: ['Madhya Pradesh'] },
  { name: 'UP State Agricultural Produce Market Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Lucknow, Kanpur, Agra. Known for Sugarcane, Wheat, Rice, Potato.', benefits: ['Extensive mandi network', 'Storage support', 'Kisan Bazar'], link: 'http://upmandiparishad.upsdc.gov.in/', tag: 'Uttar Pradesh', states: ['Uttar Pradesh'] },
  { name: 'Rajasthan State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Jaipur, Kota, Jodhpur. Known for Mustard, Bajra, Guar, Spices.', benefits: ['Krishak Kalyan Fee', 'E-NAM integration', 'Mandi modernization'], link: 'https://agriculture.rajasthan.gov.in/', tag: 'Rajasthan', states: ['Rajasthan'] },
  { name: 'Tamil Nadu State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Chennai, Madurai, Coimbatore. Known for Rice, Turmeric, Banana, Coconut.', benefits: ['Uzhavar Sandhai', 'Cold chain', 'Pledge loan'], link: 'https://tnsamb.gov.in/', tag: 'Tamil Nadu', states: ['Tamil Nadu'] },
  { name: 'Andhra Pradesh State Agricultural Marketing', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Vijayawada, Guntur. Known for Chillies, Rice, Cotton, Tobacco.', benefits: ['Rythu Bandhu Pathakam', 'E-NAM leading state', 'Cold storage'], link: 'http://market.ap.nic.in/', tag: 'Andhra Pradesh', states: ['Andhra Pradesh'] },
  { name: 'Gujarat State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Ahmedabad, Rajkot, Surat. Known for Cotton, Groundnut, Cumin.', benefits: ['Strong cooperative structure', 'Export links', 'Tech integration'], link: 'https://gsamb.gujarat.gov.in/', tag: 'Gujarat', states: ['Gujarat'] },
  { name: 'Punjab State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Ludhiana, Amritsar. Known for Wheat, Rice, Cotton.', benefits: ['Strong MSP procurement', 'Dense mandi network', 'Arhtiya system'], link: 'https://mandiboard.punjab.gov.in/', tag: 'Punjab', states: ['Punjab'] },
  { name: 'Haryana State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Karnal, Rohtak, Sirsa. Known for Basmati Rice, Wheat, Mustard.', benefits: ['Bhavantar Bharpayee Yojana', 'Direct payment', 'Agri-business info'], link: 'https://hsamb.org.in/', tag: 'Haryana', states: ['Haryana'] },
  { name: 'Telangana State Agricultural Marketing', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Hyderabad, Warangal. Known for Cotton, Paddy, Maize, Chillies.', benefits: ['Rythu Vedika', 'E-NAM active', 'Godown network'], link: 'http://tsmarketing.in/', tag: 'Telangana', states: ['Telangana'] },
  { name: 'West Bengal State Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Kolkata, Burdwan, Hooghly. Known for Rice, Jute, Tea, Potato.', benefits: ['Sufal Bangla', 'Krishak Bazar', 'Transport subsidy'], link: 'https://wbagrimarketingboard.gov.in/', tag: 'West Bengal', states: ['West Bengal'] },
  { name: 'Bihar Agricultural Markets', type: 'State Market', icon: '🏛️', desc: 'Major Markets: Gulabbagh, Patna. Known for Maize, Makhana, Litchi, Rice.', benefits: ['PACs procurement', 'Direct buying', 'No mandi tax'], link: 'http://krishi.bih.nic.in/', tag: 'Bihar', states: ['Bihar'] },
  { name: 'Odisha State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Major APMCs: Bhubaneswar, Cuttack. Known for Paddy, Pulses, Oilseeds.', benefits: ['e-Rakam', 'Mandi modernization', 'Storage access'], link: 'https://www.osamb.in/', tag: 'Odisha', states: ['Odisha'] },
  { name: 'Chhattisgarh State Mandi Board', type: 'State APMC', icon: '🏛️', desc: 'Known as the Rice Bowl. Major procurement of Paddy.', benefits: ['Rajiv Gandhi Kisan Nyay Yojana', 'Direct transfer', 'Efficient procurement'], link: 'https://agriportal.cg.nic.in/', tag: 'Chhattisgarh', states: ['Chhattisgarh'] },
  { name: 'Jharkhand State Agricultural Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Markets: Ranchi, Dhanbad. Procurement of Paddy, Maize, Vegetables.', benefits: ['e-NAM integration', 'Mandi development', 'Fair price'], link: 'http://jharkhandmandi.com/', tag: 'Jharkhand', states: ['Jharkhand'] },
  { name: 'Himachal Pradesh State Agricultural Marketing Board', type: 'State APMC', icon: '🍎', desc: 'Major hub for Apples, Stone fruits, and Vegetables.', benefits: ['Market fee exemption for some fruits', 'Cold storage network', 'Direct marketing'], link: 'https://hpsamb.nic.in/', tag: 'Himachal Pradesh', states: ['Himachal Pradesh'] },
  { name: 'Uttarakhand Agricultural Produce Marketing Board', type: 'State APMC', icon: '🏛️', desc: 'Markets: Haldwani, Dehradun. Hub for organic produce, fruits, and millets.', benefits: ['Organic farming promotion', 'E-NAM', 'Hill transport subsidy'], link: 'http://ukmandi.gov.in/', tag: 'Uttarakhand', states: ['Uttarakhand'] },
  { name: 'Assam State Agricultural Marketing Board', type: 'State APMC', icon: '🌿', desc: 'Procurement of Tea, Jute, Rice, and Spices. Markets in Guwahati, Jorhat.', benefits: ['Rural godowns', 'Farmer markets', 'Export promotion'], link: 'https://asamb.assam.gov.in/', tag: 'Assam', states: ['Assam'] },
  { name: 'Kerala VFPCK / State Agriculture Dept', type: 'State Agency', icon: '🌴', desc: 'Procures Spices, Rubber, Coconut, Fruits & Vegetables.', benefits: ['VFPCK markets', 'Price support scheme', 'Export assistance'], link: 'http://www.vficpc.com/', tag: 'Kerala', states: ['Kerala'] },
  { name: 'Jammu & Kashmir Horticulture Board', type: 'State Agency', icon: '🍎', desc: 'Major procurement and marketing of Apples, Walnuts, Saffron.', benefits: ['Market Intervention Scheme', 'Cold storage', 'Direct export links'], link: 'http://hortijmu.jk.gov.in/', tag: 'Jammu and Kashmir', states: ['Jammu and Kashmir', 'Ladakh'] },
];

const PRIVATE_BUYERS = [
  { name: 'ITC e-Choupal / ABD', type: 'Corporate', icon: '🏭', desc: 'ITC\'s direct farmer procurement for wheat, soy, coffee, spices, and more. Fair pricing, quality premium.', benefits: ['Quality-based premium', 'Direct procurement', 'Free soil testing', 'Real-time price info'], crops: 'Wheat, Soy, Coffee, Spices, Shrimp', tag: 'Premium Price', states: ['All'] },
  { name: 'Reliance Fresh / JioMart', type: 'Corporate', icon: '🛒', desc: 'Direct farm-to-retail procurement for fruits, vegetables, and fresh produce. Collection centers in major districts.', benefits: ['Daily procurement', 'Collection center pickup', 'Fast payment (24-48 hrs)', 'Grade-based pricing'], crops: 'Fruits, Vegetables, Fresh Produce', tag: 'Quick Payment', states: ['All'] },
  { name: 'BigBasket / Tata Group', type: 'Corporate', icon: '📦', desc: 'Large-scale procurement of fresh produce for online retail. Works with FPOs and individual farmers.', benefits: ['Consistent demand', 'FPO partnerships', 'Supply contracts', 'Technology support'], crops: 'Vegetables, Fruits, Dairy, Staples', tag: 'Steady Demand', states: ['All'] },
  { name: 'Adani Wilmar (Fortune)', type: 'Corporate', icon: '🛢️', desc: 'Major buyer of oilseeds, wheat, rice, and pulses for processing. Procurement through mandis and direct purchase.', benefits: ['Bulk purchase', 'Processing contracts', 'Transport support', 'Competitive pricing'], crops: 'Mustard, Soy, Groundnut, Wheat, Rice', tag: 'Bulk Buyer', states: ['Gujarat', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Uttar Pradesh', 'West Bengal', 'Bihar', 'Jharkhand'] },
  { name: 'Cargill India', type: 'MNC', icon: '🌍', desc: 'Global agri-commodity buyer. Procures grains, oilseeds, and cotton. Contract farming available.', benefits: ['Contract farming', 'Global market access', 'Price lock options', 'Input support'], crops: 'Wheat, Corn, Soy, Cotton, Barley', tag: 'Contract Farming', states: ['Karnataka', 'Maharashtra', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Gujarat', 'Andhra Pradesh', 'Telangana'] },
  { name: 'Ninjacart', type: 'AgriTech', icon: '🚀', desc: 'Tech-enabled fresh produce supply chain. Direct procurement from farms with app-based ordering.', benefits: ['App-based selling', 'Farm pickup', 'Same-day payment', 'No commission'], crops: 'Vegetables, Fruits, Leafy Greens', tag: 'Tech-Enabled', states: ['Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'Haryana', 'Delhi', 'Gujarat', 'Uttar Pradesh'] },
  { name: 'WayCool', type: 'AgriTech', icon: '🥬', desc: 'Food development & distribution company. Direct procurement from farmers and FPOs.', benefits: ['Regular demand', 'Transparent pricing', 'Agronomy support', 'Timely payment'], crops: 'Vegetables, Fruits, Staples', tag: 'Supply Chain', states: ['Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Kerala'] },
  { name: 'DeHaat', type: 'AgriTech', icon: '📱', desc: 'Full-stack agri platform connecting farmers to buyers. Input supply + output purchase.', benefits: ['End-to-end support', 'Input + Output market', 'Advisory services', 'Micro-enterprise'], crops: 'All Crops, Inputs', tag: 'Full Platform', states: ['Bihar', 'Uttar Pradesh', 'Odisha', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Jharkhand', 'Haryana', 'Chhattisgarh'] },
  { name: 'AgroStar', type: 'AgriTech', icon: '⭐', desc: 'Omnichannel farming platform. Procures produce and provides quality inputs and agronomy advice.', benefits: ['Omnichannel support', 'Quality inputs', 'Market linkages', 'Expert advice'], crops: 'Cotton, Vegetables, Fruits', tag: 'Agronomy + Output', states: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh'] },
  { name: 'Godrej Agrovet', type: 'Corporate', icon: '🌴', desc: 'Procures oil palm, milk, and poultry products. Promotes contract farming.', benefits: ['Contract farming', 'Assured buyback', 'Technical support', 'Fair pricing'], crops: 'Oil Palm, Dairy, Poultry', tag: 'Contract Farming', states: ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Odisha', 'Gujarat', 'Maharashtra', 'Chhattisgarh'] },
  { name: 'Patanjali Ayurved', type: 'Corporate', icon: '🌿', desc: 'Procures amla, aloe vera, herbs, wheat, and mustard for FMCG products.', benefits: ['Organic premium', 'Bulk procurement', 'Ayurvedic crops', 'Contract farming'], crops: 'Herbs, Amla, Wheat, Mustard', tag: 'FMCG Buyer', states: ['All'] },
  { name: 'Local Flour Mills & Dal Mills', type: 'Local', icon: '🏭', desc: 'Local processing units that buy wheat, rice, pulses directly from farmers.', benefits: ['No transport cost', 'Immediate payment', 'Relationship-based', 'Flexible quantities'], crops: 'Wheat, Rice, Pulses, Millets', tag: 'Nearby', states: ['All'] },
];

const EXPORT_BUYERS = [
  { name: 'APEDA — Agricultural Export Authority', type: 'Govt Agency', icon: '✈️', desc: 'Facilitates export of fresh fruits, vegetables, processed foods, meat, and organic products.', benefits: ['Export subsidies', 'Quality certification', 'International buyer connects', 'Training'], link: 'https://apeda.gov.in', tag: 'Fresh Produce Export', states: ['All'] },
  { name: 'MPEDA — Marine Products Export', type: 'Govt Agency', icon: '🐟', desc: 'For fishermen and aquaculture farmers. Facilitates export of shrimp, fish, and marine products.', benefits: ['Export infrastructure', 'Quality labs', 'Buyer-seller meets', 'Subsidy schemes'], link: 'https://mpeda.gov.in', tag: 'Seafood Export', states: ['Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Gujarat', 'Maharashtra', 'Odisha', 'West Bengal', 'Karnataka'] },
  { name: 'Spices Board India', type: 'Govt Agency', icon: '🌶️', desc: 'Promotes export of Indian spices. Quality certification, buyer connections, and e-auction platform.', benefits: ['Quality certification', 'E-auction platform', 'Brand building', 'Export promotion'], link: 'https://www.indianspices.com', tag: 'Spice Farmers', states: ['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Rajasthan', 'Gujarat'] },
  { name: 'Coffee Board of India', type: 'Govt Agency', icon: '☕', desc: 'Promotes export of Indian coffee. Provides market intelligence, certification, and buyer matching.', benefits: ['Export promotion', 'Quality testing', 'Subsidy for mechanization', 'Global branding'], link: 'https://www.indiacoffee.org', tag: 'Coffee Export', states: ['Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh'] },
  { name: 'Tea Board of India', type: 'Govt Agency', icon: '🍵', desc: 'Facilitates export of Darjeeling, Assam, and Nilgiri tea. Ensures quality standards and global marketing.', benefits: ['Global marketing', 'Subsidy for plantation', 'Quality assurance', 'E-auctions'], link: 'http://www.teaboard.gov.in', tag: 'Tea Export', states: ['Assam', 'West Bengal', 'Tamil Nadu', 'Kerala'] },
  { name: 'Rubber Board', type: 'Govt Agency', icon: '🌳', desc: 'Promotes natural rubber production and export. Provides technical support and market access.', benefits: ['Export incentives', 'Technical advice', 'Plantation subsidy', 'Market trends'], link: 'http://rubberboard.org.in', tag: 'Rubber Export', states: ['Kerala', 'Tamil Nadu', 'Karnataka', 'Tripura'] },
  { name: 'Coconut Development Board', type: 'Govt Agency', icon: '🥥', desc: 'Focuses on coconut products export (coir, oil, water, desiccated coconut).', benefits: ['Processing subsidies', 'Export facilitation', 'Technology transfer', 'Market promotion'], link: 'https://coconutboard.gov.in', tag: 'Coconut Export', states: ['Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Odisha'] },
  { name: 'STC / State Trading Corporation', type: 'Govt Agency', icon: '🚢', desc: 'Undertakes export and import of mass agricultural commodities like wheat, rice, sugar.', benefits: ['Bulk export', 'Govt-to-Govt trade', 'Price stability', 'Large volume handling'], link: 'http://www.stclimited.co.in', tag: 'Bulk Commodities', states: ['All'] },
  { name: 'Direct Merchant Exporters', type: 'Private Export', icon: '🌍', desc: 'Private trading houses that buy directly from farmers/mandis for international export.', benefits: ['Premium export price', 'Direct contract', 'Volume purchase', 'Faster processing'], link: '#', tag: 'Private Exporters', states: ['All'] },
  { name: 'Export Oriented Units (EOUs)', type: 'Private Export', icon: '🏭', desc: 'Agro-processing units set up specifically for export (e.g., mango pulp, frozen veg).', benefits: ['100% buyback', 'Contract farming', 'Technical input', 'Premium rates'], link: '#', tag: 'Agro-Processing', states: ['All'] },
];

function BuyerCard({ buyer, accent }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, border: '1px solid #e5e7eb',
      padding: '20px', transition: 'all 0.2s', cursor: 'default',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {buyer.icon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{buyer.name}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{buyer.type}</div>
          </div>
        </div>
        <span style={{ background: accent + '18', color: accent, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
          {buyer.tag}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7, marginBottom: 14 }}>{buyer.desc}</p>
      {buyer.crops && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🌾</span> <strong>Crops:</strong> {buyer.crops}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: buyer.link ? 14 : 0 }}>
        {buyer.benefits.map((b, i) => (
          <span key={i} style={{ background: '#f3f4f6', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
            ✅ {b}
          </span>
        ))}
      </div>
      {buyer.link && buyer.link !== '#' && (
        <a href={buyer.link} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: accent, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          🔗 Visit Official Website →
        </a>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CropBuyers() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [activeTab, setActiveTab] = useState('govt');
  const [selectedCrop, setSelectedCrop] = useState('');

  const districts = selectedState ? STATES_DATA[selectedState] || [] : [];

  const CROP_FILTER = ['All', 'Wheat', 'Rice', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Cotton', 'Spices', 'Sugarcane'];

  const filteredGovt = GOVT_BUYERS.filter(b => !selectedState || b.states.includes('All') || b.states.includes(selectedState));
  const basePrivate = PRIVATE_BUYERS.filter(b => !selectedState || b.states.includes('All') || b.states.includes(selectedState));
  const filteredPrivate = selectedCrop && selectedCrop !== 'All'
    ? basePrivate.filter(b => b.crops && b.crops.toLowerCase().includes(selectedCrop.toLowerCase()))
    : basePrivate;
  const filteredExport = EXPORT_BUYERS.filter(b => !selectedState || b.states.includes('All') || b.states.includes(selectedState));

  const tabs = [
    { id: 'govt', label: '🏛️ Government & APMC', count: filteredGovt.length },
    { id: 'private', label: '🏢 Private Companies', count: filteredPrivate.length },
    { id: 'export', label: '✈️ Export Channels', count: filteredExport.length },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
        borderRadius: 18, padding: '40px 28px', color: 'white', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: 99 }}>
              🤝 Direct Buyer Connect · No Middlemen
            </div>
            <div style={{ fontSize: 11, background: '#ea580c', padding: '4px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.3)' }}>
              🏛️ Govt + Private + Export
            </div>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>
            🏪 Crop Buyers & Tenders
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, maxWidth: 540, lineHeight: 1.7 }}>
            Find the best buyers for your crops — Government APMC mandis, FCI, private companies like ITC, Reliance, BigBasket, and export channels. Sell at the best price near your location.
          </p>
        </div>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 140, opacity: 0.06 }}>🏪</div>
      </div>

      {/* Location Selector */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e5e7eb',
        padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          📍 Select Your Location
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>State</label>
            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#1f2937', background: 'white', cursor: 'pointer' }}>
              <option value="">— Select State —</option>
              {Object.keys(STATES_DATA).sort().map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>District</label>
            <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} disabled={!selectedState}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: selectedState ? '#1f2937' : '#9ca3af', background: 'white', cursor: selectedState ? 'pointer' : 'not-allowed' }}>
              <option value="">— Select District —</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        {selectedState && selectedDistrict && (
          <div style={{ marginTop: 14, padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✅ Showing buyers available in <strong>{selectedDistrict}, {selectedState}</strong>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
              background: activeTab === tab.id ? '#1f2937' : 'white',
              color: activeTab === tab.id ? 'white' : '#374151',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
            }}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Crop filter for private */}
      {activeTab === 'private' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {CROP_FILTER.map(crop => (
            <button key={crop} onClick={() => setSelectedCrop(crop === 'All' ? '' : crop)}
              style={{
                padding: '6px 14px', borderRadius: 99, border: '1px solid #e5e7eb', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                background: (selectedCrop === crop || (!selectedCrop && crop === 'All')) ? '#ea580c' : 'white',
                color: (selectedCrop === crop || (!selectedCrop && crop === 'All')) ? 'white' : '#374151',
              }}>
              {crop}
            </button>
          ))}
        </div>
      )}

      {/* Buyer Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 32 }} className="buyers-grid">
        {activeTab === 'govt' && filteredGovt.map((b, i) => <BuyerCard key={i} buyer={b} accent="#1565c0" />)}
        {activeTab === 'private' && filteredPrivate.map((b, i) => <BuyerCard key={i} buyer={b} accent="#ea580c" />)}
        {activeTab === 'export' && filteredExport.map((b, i) => <BuyerCard key={i} buyer={b} accent="#7c3aed" />)}
      </div>

      {/* MSP Info Box */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16,
        padding: '24px 28px', marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e40af', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          💡 What is MSP? (Minimum Support Price)
        </h3>
        <p style={{ fontSize: 13, color: '#1e3a5f', lineHeight: 1.8, marginBottom: 12 }}>
          MSP is the price set by the Government of India at which it will buy crops from farmers. This protects farmers from price crashes. FCI and state agencies buy at MSP during procurement seasons.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { crop: '🌾 Wheat', price: '₹2,275/qtl' },
            { crop: '🍚 Rice (Paddy)', price: '₹2,300/qtl' },
            { crop: '🌻 Mustard', price: '₹5,650/qtl' },
            { crop: '🫘 Moong Dal', price: '₹8,558/qtl' },
            { crop: '🥜 Groundnut', price: '₹6,377/qtl' },
            { crop: '🌽 Maize', price: '₹2,090/qtl' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, padding: '10px 14px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{item.crop}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e40af' }}>{item.price}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#6b7280' }}>* MSP rates for Kharif/Rabi 2025-26 season. Actual rates may vary.</div>
      </div>

      {/* Tips */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>💡 Tips for Getting the Best Price</h3>
        <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#78350f', lineHeight: 2 }}>
          <li>Always check prices at 2-3 mandis before selling</li>
          <li>Register on e-NAM for access to buyers across India</li>
          <li>Join or form an FPO (Farmer Producer Organization) for better bargaining power</li>
          <li>Grade and sort your produce — quality produce gets 10-20% premium</li>
          <li>Know the MSP before selling — never sell below government support price</li>
          <li>Consider contract farming with companies like ITC/Cargill for price security</li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .buyers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
