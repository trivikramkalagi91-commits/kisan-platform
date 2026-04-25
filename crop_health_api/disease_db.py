# ─── Disease Knowledge Base ──────────────────────────────────────────────────
# Maps PlantVillage class labels to actionable farmer guidance (India-focused).
# Class names follow the standard PlantVillage dataset naming convention.

DISEASE_INFO = {
    # ── Apple ────────────────────────────────────────────────────────────────
    "Apple___Apple_scab": {
        "crop": "Apple", "disease": "Apple Scab",
        "fertilizers": ["Balanced NPK (10-10-10)", "Calcium nitrate foliar spray"],
        "pesticides": ["Mancozeb 75 WP (2g/L water)", "Captan 50 WP (2g/L water)", "Carbendazim 50 WP (1g/L)"],
        "treatment": [
            "Remove and burn all infected leaves and fruit.",
            "Spray Mancozeb 75 WP at 2g per litre during pink-bud stage.",
            "Repeat spray every 10–14 days until infection stops.",
            "Improve air circulation by pruning dense branches.",
        ],
        "prevention": [
            "Choose scab-resistant apple varieties.",
            "Rake and destroy fallen leaves after harvest.",
            "Apply lime-sulphur during dormant season.",
        ],
    },
    "Apple___Black_rot": {
        "crop": "Apple", "disease": "Black Rot",
        "fertilizers": ["Balanced NPK", "Potassium sulphate (SOP)"],
        "pesticides": ["Captan 50 WP (2g/L)", "Thiophanate-methyl 70 WP (1g/L)"],
        "treatment": [
            "Prune out dead or cankered wood immediately.",
            "Remove mummified fruit from tree and ground.",
            "Apply Captan 50 WP every 14 days from petal fall.",
        ],
        "prevention": [
            "Maintain good orchard sanitation.",
            "Avoid wounding trees during pruning.",
        ],
    },
    "Apple___Cedar_apple_rust": {
        "crop": "Apple", "disease": "Cedar Apple Rust",
        "fertilizers": ["Ammonium sulphate (21-0-0)", "Potassium nitrate foliar"],
        "pesticides": ["Myclobutanil 10 WP (1g/L)", "Propiconazole 25 EC (1mL/L)"],
        "treatment": [
            "Remove nearby juniper/cedar trees if possible.",
            "Apply Myclobutanil from green-tip stage every 7–10 days.",
            "Continue sprays until leaves are fully expanded.",
        ],
        "prevention": ["Plant rust-resistant apple varieties.", "Avoid planting apples near junipers."],
    },
    "Apple___healthy": {
        "crop": "Apple", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Maintain balanced nutrition and regular irrigation."],
    },

    # ── Blueberry ────────────────────────────────────────────────────────────
    "Blueberry___healthy": {
        "crop": "Blueberry", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Maintain soil pH 4.5–5.5 for optimal health."],
    },

    # ── Cherry ───────────────────────────────────────────────────────────────
    "Cherry_(including_sour)___Powdery_mildew": {
        "crop": "Cherry", "disease": "Powdery Mildew",
        "fertilizers": ["Low-nitrogen fertiliser", "Potassium sulphate"],
        "pesticides": ["Sulphur 80 WP (3g/L)", "Hexaconazole 5 SC (2mL/L)", "Triadimefon 25 WP (1g/L)"],
        "treatment": [
            "Apply Sulphur 80 WP spray at first sign of white powder on leaves.",
            "Repeat every 10 days in humid weather.",
            "Remove heavily infected shoots immediately.",
        ],
        "prevention": ["Avoid overhead irrigation.", "Ensure wide plant spacing for airflow."],
    },
    "Cherry_(including_sour)___healthy": {
        "crop": "Cherry", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Balanced NPK + micronutrient program."],
    },

    # ── Corn / Maize ─────────────────────────────────────────────────────────
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "crop": "Maize", "disease": "Gray Leaf Spot (Cercospora)",
        "fertilizers": ["Urea top-dress 65 kg/ha", "DAP 100 kg/ha basal"],
        "pesticides": ["Propiconazole 25 EC (1mL/L)", "Azoxystrobin 23 SC (1mL/L)"],
        "treatment": [
            "Apply Propiconazole 25 EC at tasselling stage.",
            "Repeat after 14 days if infection persists.",
            "Remove lower infected leaves to improve air circulation.",
        ],
        "prevention": ["Plant resistant hybrids.", "Rotate with non-host crops like soybean or wheat."],
    },
    "Corn_(maize)___Common_rust_": {
        "crop": "Maize", "disease": "Common Rust",
        "fertilizers": ["Potassium chloride (MOP) 60 kg/ha", "NPK 12-32-16"],
        "pesticides": ["Mancozeb 75 WP (2.5g/L)", "Chlorothalonil 75 WP (2g/L)"],
        "treatment": [
            "Spray Mancozeb 75 WP at first rust pustule appearance.",
            "Repeat every 10–12 days during wet season.",
        ],
        "prevention": ["Use rust-tolerant varieties.", "Avoid late sowing — plant before monsoon peak."],
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "crop": "Maize", "disease": "Northern Leaf Blight",
        "fertilizers": ["Split urea application", "Potassium fertiliser 80 kg/ha"],
        "pesticides": ["Propiconazole 25 EC (1mL/L)", "Tebuconazole 250 EW (1mL/L)"],
        "treatment": [
            "Apply fungicide at 40–50 days after sowing.",
            "Remove and destroy infected crop debris after harvest.",
        ],
        "prevention": ["Grow resistant hybrids (e.g. HQPM-1).", "Crop rotation with legumes."],
    },
    "Corn_(maize)___healthy": {
        "crop": "Maize", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Follow 120:60:40 NPK kg/ha recommendation for maize."],
    },

    # ── Grape ────────────────────────────────────────────────────────────────
    "Grape___Black_rot": {
        "crop": "Grape", "disease": "Black Rot",
        "fertilizers": ["Balanced NPK 13-5-26", "Boron foliar 0.2%"],
        "pesticides": ["Mancozeb 75 WP (2g/L)", "Captan 50 WP (2g/L)"],
        "treatment": [
            "Remove mummified berries and infected shoots.",
            "Spray Mancozeb at bud burst, 10 days later, and at bunch closure.",
        ],
        "prevention": ["Trellising to improve airflow.", "Avoid wetting foliage during irrigation."],
    },
    "Grape___Esca_(Black_Measles)": {
        "crop": "Grape", "disease": "Esca (Black Measles)",
        "fertilizers": ["Potassium silicate foliar", "Calcium chelate"],
        "pesticides": ["No effective chemical cure — focus on management"],
        "treatment": [
            "Prune and remove infected wood during dry weather.",
            "Seal pruning wounds with wound paste or Trichoderma-based product.",
            "Do not stress vines with excess irrigation or heavy crop load.",
        ],
        "prevention": ["Use certified disease-free planting material.", "Disinfect pruning tools between cuts."],
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "crop": "Grape", "disease": "Leaf Blight",
        "fertilizers": ["Potassium nitrate foliar", "Zinc sulphate 0.5% spray"],
        "pesticides": ["Copper oxychloride 50 WP (3g/L)", "Zineb 75 WP (2.5g/L)"],
        "treatment": [
            "Apply Copper oxychloride at first symptom.",
            "Repeat every 10 days during high humidity.",
        ],
        "prevention": ["Maintain vine canopy — avoid excessive shading.", "Remove fallen leaves."],
    },
    "Grape___healthy": {
        "crop": "Grape", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Balanced fertigation and trained trellis system."],
    },

    # ── Orange ───────────────────────────────────────────────────────────────
    "Orange___Haunglongbing_(Citrus_greening)": {
        "crop": "Orange / Citrus", "disease": "Citrus Greening (HLB)",
        "fertilizers": ["Zinc sulphate 0.5%", "Manganese sulphate 0.3%", "Borax 0.1% foliar"],
        "pesticides": ["Imidacloprid 17.8 SL (0.5mL/L) — controls psyllid vector", "Dimethoate 30 EC (2mL/L)"],
        "treatment": [
            "Remove and destroy severely infected trees to stop spread.",
            "Control the Asian citrus psyllid using systemic insecticide.",
            "Apply micronutrient foliar sprays to manage symptoms.",
            "There is no cure — focus on prevention and vector control.",
        ],
        "prevention": ["Use certified HLB-free nursery plants.", "Control psyllid population year-round."],
    },

    # ── Peach ────────────────────────────────────────────────────────────────
    "Peach___Bacterial_spot": {
        "crop": "Peach", "disease": "Bacterial Spot",
        "fertilizers": ["Balanced NPK with calcium nitrate", "Potassium sulphate"],
        "pesticides": ["Copper hydroxide 77 WP (3g/L)", "Oxytetracycline 200 ppm foliar"],
        "treatment": [
            "Apply copper-based spray at shuck-split stage.",
            "Repeat every 7–10 days in wet weather.",
            "Avoid overhead irrigation.",
        ],
        "prevention": ["Plant resistant peach varieties.", "Ensure good drainage."],
    },
    "Peach___healthy": {
        "crop": "Peach", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Annual pruning and balanced NPK program."],
    },

    # ── Pepper ───────────────────────────────────────────────────────────────
    "Pepper,_bell___Bacterial_spot": {
        "crop": "Bell Pepper", "disease": "Bacterial Spot",
        "fertilizers": ["Calcium nitrate 1%", "Potassium sulphate 1%"],
        "pesticides": ["Copper oxychloride 50 WP (3g/L)", "Streptomycin sulphate 500 ppm"],
        "treatment": [
            "Apply Copper oxychloride at first appearance of lesions.",
            "Spray Streptomycin 500 ppm every 7 days during infection.",
            "Remove severely infected plants.",
        ],
        "prevention": ["Use certified disease-free seeds.", "Avoid working in field when plants are wet."],
    },
    "Pepper,_bell___healthy": {
        "crop": "Bell Pepper", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Maintain soil moisture and avoid waterlogging."],
    },

    # ── Potato ───────────────────────────────────────────────────────────────
    "Potato___Early_blight": {
        "crop": "Potato", "disease": "Early Blight",
        "fertilizers": ["Urea 65 kg/ha top-dress", "Potassium chloride (MOP) 50 kg/ha", "Zinc sulphate 25 kg/ha"],
        "pesticides": [
            "Mancozeb 75 WP — 2.5g per litre water (spray every 10 days)",
            "Chlorothalonil 75 WP — 2g per litre water",
            "Copper oxychloride 50 WP — 3g per litre water",
        ],
        "treatment": [
            "Remove infected lower leaves and burn them — do NOT compost.",
            "Spray Mancozeb 75 WP at first sign of brown spots.",
            "Repeat every 10 days until 3 weeks before harvest.",
            "Avoid overhead irrigation in evening — water in morning.",
            "Ensure proper plant spacing (45×20 cm) for air circulation.",
        ],
        "prevention": [
            "Use certified seed potato — avoid saved seed from infected crop.",
            "Apply potash fertiliser to improve plant immunity.",
            "Practice 3-year crop rotation (avoid tomato/brinjal in same plot).",
            "Apply Trichoderma viride 5g/kg seed before planting.",
        ],
    },
    "Potato___Late_blight": {
        "crop": "Potato", "disease": "Late Blight",
        "fertilizers": ["Potassium sulphate (SOP) 60 kg/ha", "Calcium nitrate foliar 1%"],
        "pesticides": [
            "Metalaxyl + Mancozeb 72 WP — 2.5g per litre (systemic, best choice)",
            "Dimethomorph 50 WP — 1g per litre",
            "Cymoxanil + Mancozeb — 3g per litre",
        ],
        "treatment": [
            "Act FAST — Late Blight spreads within 24–48 hours in cool, wet weather.",
            "Spray Metalaxyl + Mancozeb at first water-soaked spots on leaves.",
            "Remove and destroy all infected plant material immediately.",
            "Do NOT irrigate during active infection — reduce humidity.",
            "Re-spray after every rain event or every 7 days.",
            "If infestation is severe, cut haulm (tops) 2–3 weeks before harvest.",
        ],
        "prevention": [
            "Plant resistant varieties (Kufri Giriraj, Kufri Jyoti).",
            "Avoid planting in areas with poor drainage.",
            "Apply Bordeaux mixture (1%) as protective spray before monsoon.",
            "Do not store infected tubers — sort carefully at harvest.",
        ],
    },
    "Potato___healthy": {
        "crop": "Potato", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Use certified seed potato and balanced NPK 120:60:80 kg/ha."],
    },

    # ── Raspberry ────────────────────────────────────────────────────────────
    "Raspberry___healthy": {
        "crop": "Raspberry", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Annual mulching and balanced fertiliser."],
    },

    # ── Soybean ──────────────────────────────────────────────────────────────
    "Soybean___healthy": {
        "crop": "Soybean", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Rhizobium inoculation at sowing for nitrogen fixation."],
    },

    # ── Squash ───────────────────────────────────────────────────────────────
    "Squash___Powdery_mildew": {
        "crop": "Squash / Pumpkin", "disease": "Powdery Mildew",
        "fertilizers": ["Low nitrogen — excess N worsens mildew", "Potassium sulphate"],
        "pesticides": ["Sulphur 80 WP (3g/L)", "Hexaconazole 5 SC (2mL/L)", "Neem oil 5mL/L"],
        "treatment": [
            "Spray Sulphur 80 WP at first white powdery spots.",
            "Repeat every 7–10 days.",
            "Remove heavily infected leaves.",
        ],
        "prevention": ["Maintain plant spacing.", "Water at base — avoid wetting leaves."],
    },

    # ── Strawberry ───────────────────────────────────────────────────────────
    "Strawberry___Leaf_scorch": {
        "crop": "Strawberry", "disease": "Leaf Scorch",
        "fertilizers": ["Potassium nitrate foliar 1%", "Calcium nitrate 0.5%"],
        "pesticides": ["Copper hydroxide 77 WP (2g/L)", "Myclobutanil 10 WP (1g/L)"],
        "treatment": [
            "Remove infected leaves and dispose of them.",
            "Apply Copper hydroxide spray at 2g/L every 10 days.",
        ],
        "prevention": ["Use raised beds for drainage.", "Plant certified disease-free runners."],
    },
    "Strawberry___healthy": {
        "crop": "Strawberry", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Mulching with straw reduces splash-spread of pathogens."],
    },

    # ── Tomato ───────────────────────────────────────────────────────────────
    "Tomato___Bacterial_spot": {
        "crop": "Tomato", "disease": "Bacterial Spot",
        "fertilizers": ["Calcium nitrate foliar 1%", "Potassium sulphate 60 kg/ha"],
        "pesticides": ["Copper oxychloride 50 WP (3g/L)", "Streptomycin 500 ppm + Copper"],
        "treatment": [
            "Remove and destroy infected leaves immediately.",
            "Spray Copper oxychloride 50 WP every 7–10 days.",
            "Avoid working in field when plants are wet.",
        ],
        "prevention": ["Use certified disease-free seeds.", "Practice seed treatment with hot water (52°C/25 min)."],
    },
    "Tomato___Early_blight": {
        "crop": "Tomato", "disease": "Early Blight",
        "fertilizers": ["Urea 60 kg/ha", "MOP 40 kg/ha", "Zinc sulphate 10 kg/ha"],
        "pesticides": ["Mancozeb 75 WP (2.5g/L)", "Chlorothalonil 75 WP (2g/L)", "Azoxystrobin 23 SC (1mL/L)"],
        "treatment": [
            "Remove lower infected leaves and burn.",
            "Spray Mancozeb 75 WP at first appearance of brown concentric spots.",
            "Repeat every 10 days.",
            "Stake plants to improve air circulation.",
        ],
        "prevention": ["3-year crop rotation.", "Avoid overhead irrigation.", "Mulch to reduce soil splash."],
    },
    "Tomato___Late_blight": {
        "crop": "Tomato", "disease": "Late Blight",
        "fertilizers": ["Potassium sulphate 80 kg/ha", "Calcium nitrate foliar 1%"],
        "pesticides": ["Metalaxyl + Mancozeb 72 WP (2.5g/L)", "Cymoxanil + Mancozeb 72 WP (3g/L)"],
        "treatment": [
            "Act immediately — Late Blight spreads very fast in cool humid weather.",
            "Spray Metalaxyl + Mancozeb at first water-soaked lesions.",
            "Remove and destroy all infected material.",
            "Re-spray every 7 days or after rain.",
        ],
        "prevention": ["Plant resistant varieties.", "Provide good drainage.", "Avoid dense planting."],
    },
    "Tomato___Leaf_Mold": {
        "crop": "Tomato", "disease": "Leaf Mold",
        "fertilizers": ["Potassium sulphate foliar 1%"],
        "pesticides": ["Chlorothalonil 75 WP (2g/L)", "Mancozeb 75 WP (2.5g/L)", "Copper fungicide"],
        "treatment": [
            "Reduce humidity in greenhouse/polyhouse — ventilate well.",
            "Spray Chlorothalonil every 7 days.",
            "Remove heavily infected leaves.",
        ],
        "prevention": ["Avoid overhead irrigation.", "Increase plant spacing."],
    },
    "Tomato___Septoria_leaf_spot": {
        "crop": "Tomato", "disease": "Septoria Leaf Spot",
        "fertilizers": ["Balanced NPK", "Calcium nitrate foliar"],
        "pesticides": ["Mancozeb 75 WP (2.5g/L)", "Chlorothalonil 75 WP (2g/L)"],
        "treatment": [
            "Remove and destroy infected lower leaves.",
            "Spray Mancozeb at first tiny white spots with dark borders.",
            "Repeat every 10 days in wet weather.",
        ],
        "prevention": ["Rotate crops — avoid tomato/potato in same plot.", "Stake plants for airflow."],
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "crop": "Tomato", "disease": "Spider Mite Infestation",
        "fertilizers": ["Potassium nitrate 1% foliar to strengthen plants"],
        "pesticides": ["Abamectin 1.8 EC (0.5mL/L)", "Spiromesifen 22.9 SC (1mL/L)", "Neem oil 5mL/L"],
        "treatment": [
            "Spray the underside of leaves where mites live.",
            "Apply Abamectin 1.8 EC every 7 days for 3 sprays.",
            "Wash plants with strong water jet to dislodge mites.",
        ],
        "prevention": ["Maintain soil moisture — mites thrive in dry conditions.", "Avoid excess nitrogen fertiliser."],
    },
    "Tomato___Target_Spot": {
        "crop": "Tomato", "disease": "Target Spot",
        "fertilizers": ["Balanced NPK", "Zinc sulphate 0.5% foliar"],
        "pesticides": ["Chlorothalonil 75 WP (2g/L)", "Azoxystrobin 23 SC (1mL/L)"],
        "treatment": [
            "Remove infected leaves and bury or burn.",
            "Spray Chlorothalonil every 10 days during humid periods.",
        ],
        "prevention": ["Crop rotation.", "Good canopy management."],
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "crop": "Tomato", "disease": "Yellow Leaf Curl Virus (TYLCV)",
        "fertilizers": ["Balanced NPK 120:60:60 kg/ha", "Boron 10 g/L foliar"],
        "pesticides": ["Imidacloprid 17.8 SL (0.3mL/L) — kills whitefly vector", "Thiamethoxam 25 WG (0.3g/L)"],
        "treatment": [
            "Remove and destroy infected plants to stop spread.",
            "Control whitefly (Bemisia tabaci) — the virus carrier.",
            "Spray Imidacloprid at planting and repeat every 15 days.",
            "Install yellow sticky traps to monitor whitefly population.",
            "There is NO cure once infected — focus on prevention.",
        ],
        "prevention": [
            "Plant virus-resistant varieties (Arka Rakshak, Syngenta H-86).",
            "Install insect-proof net (40 mesh) in nursery.",
            "Remove weed hosts around field borders.",
        ],
    },
    "Tomato___Tomato_mosaic_virus": {
        "crop": "Tomato", "disease": "Tomato Mosaic Virus (ToMV)",
        "fertilizers": ["Potassium sulphate 1% foliar for plant strength"],
        "pesticides": ["No direct pesticide — control aphid vector: Imidacloprid 0.3mL/L"],
        "treatment": [
            "Remove and destroy infected plants immediately.",
            "Wash hands and tools with soap after handling infected plants.",
            "Control aphids which spread the virus.",
        ],
        "prevention": [
            "Use certified virus-free seed.",
            "Avoid tobacco use near plants (TMV can be spread by smokers).",
            "Disinfect tools with 10% bleach solution.",
        ],
    },
    "Tomato___healthy": {
        "crop": "Tomato", "disease": None,
        "fertilizers": [], "pesticides": [],
        "treatment": [], "prevention": ["Regular fertigation and integrated pest management (IPM)."],
    },
}

# PlantVillage class index → key mapping (38 classes, standard order)
CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]
