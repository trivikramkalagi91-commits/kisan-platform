import os
import io
import time
import logging
import json
from google import genai
from google.genai import types
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ─── Configuration ────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini
if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    log.warning("GEMINI_API_KEY not found in .env! Please set it for AI features to work.")
    client = None
else:
    client = genai.Client(api_key=GEMINI_API_KEY)


app = Flask(__name__)
# Allow CORS for local development and potential production domains
# Allow CORS for local development and production domains
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://kisan-wheat.vercel.app", "https://kisan-platform.vercel.app"]}})


MAX_BYTES = 8 * 1024 * 1024  # 8 MB limit

def analyze_image_with_gemini(image_bytes, language="en"):
    """
    Sends the crop image to Gemini Vision API and parses the structured response.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError("Gemini API Key is missing. Please check your .env file.")

    prompt = f"""
    You are a professional agronomist specializing in crop pathology.
    
    CRITICAL FIRST STEP: Before doing ANY analysis, carefully examine the image and determine
    whether it contains a plant, crop, leaf, or any vegetation. 
    
    If the image does NOT contain a plant, crop, leaf, or vegetation (e.g., it shows a human,
    animal, vehicle, building, food item, random object, selfie, or anything that is NOT a plant),
    you MUST return this exact JSON:
    {{
      "crop": "Not a crop",
      "disease": "None",
      "isHealthy": false,
      "confidence": "0%",
      "isCropDetected": false,
      "fertilizers": [],
      "pesticides": [],
      "treatment": [],
      "prevention": []
    }}
    
    ONLY if the image clearly contains a plant/crop/leaf/vegetation, proceed with full analysis:
    
    IMPORTANT INSTRUCTION: Provide all text content strictly in the ISO-639-1 language code '{language}'.
    For example, if the code is 'hi', output in Hindi; if 'kn', output in Kannada; if 'en', output in English.
    
    Tasks:
    1. Identify the crop name.
    2. Detect any diseases or health issues.
    3. If healthy, state "None" for disease.
    4. Provide actionable advice for farmers.
    
    Output MUST be a valid JSON object exactly as follows:
    {{
      "crop": "Common name of the crop (in {language})",
      "disease": "Specific disease name or 'None' if healthy (in {language})",
      "isHealthy": true/false,
      "confidence": "Estimated accuracy (e.g., 98%)",
      "isCropDetected": true,
      "fertilizers": ["List 2-3 specific fertilizers (in {language})"],
      "pesticides": ["List 2-3 specific pesticides if applicable, else empty (in {language})"],
      "treatment": ["Step-by-step treatment guide (in {language})"],
      "prevention": ["Prevention tips for the future (in {language})"]
    }}
    
    Strictly return ONLY the JSON object. No preamble, no markdown formatting (no ```json).
    """

    # Prepare image for Gemini
    img = Image.open(io.BytesIO(image_bytes))
    
    # Generate content using the new SDK
    # Generate content using the new SDK
    # We use gemini-flash-latest, but add a retry loop for 503 errors
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=[prompt, img]
            )
            break # Success!
        except Exception as e:
            if attempt < max_retries - 1 and ("503" in str(e) or "UNAVAILABLE" in str(e)):
                log.warning(f"Gemini API busy (503). Retrying in 2s... (Attempt {attempt+1})")
                time.sleep(2)
                continue
            
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                raise ValueError("Gemini API quota exceeded. Please wait a moment or check your API key limits.")
            if "503" in str(e) or "UNAVAILABLE" in str(e):
                raise ValueError("Gemini API is currently overloaded. Please try again in 10-20 seconds.")
            raise e


    
    # Extract and parse JSON
    try:
        text = response.text.strip()

        # Clean up markdown if Gemini adds it despite instructions
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
        
        return json.loads(text)
    except Exception as e:
        log.error(f"AI Parse Error: {e}")
        log.error(f"Raw Response: {response.text}")
        raise ValueError("The AI model returned an invalid response format. Please try again.")

# ─── Main analysis route ──────────────────────────────────────────────────────
@app.route("/analyze-crop", methods=["POST"])
def analyze_crop():
    t0 = time.time()

    # 1. Validate upload
    if "image" not in request.files:
        return jsonify({"error": "No image provided. Please upload an image using the 'image' field."}), 400

    file = request.files["image"]
    image_bytes = file.read()

    if len(image_bytes) == 0:
        return jsonify({"error": "Empty image file."}), 400

    if len(image_bytes) > MAX_BYTES:
        return jsonify({"error": "Image size exceeds 8MB limit."}), 413

    # 2. Inference via Gemini
    try:
        language = request.form.get("language", "en")
        analysis_result = analyze_image_with_gemini(image_bytes, language)
        
        # 3. Finalize response
        analysis_result["processingMs"] = round((time.time() - t0) * 1000)
        analysis_result["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        log.info(f"Analysis completed in {analysis_result['processingMs']}ms for {analysis_result['crop']}")
        return jsonify(analysis_result), 200

    except Exception as e:
        log.error(f"Analysis failed: {str(e)}")
        return jsonify({
            "error": "Analysis failed",
            "details": str(e)
        }), 500

# ─── Health check ─────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "engine": "Google Gemini Vision (1.5 Flash)",
        "config": {
            "api_key_set": bool(GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here"),
            "max_upload_mb": MAX_BYTES // (1024 * 1024)
        }
    })

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    # In production/hackathon, set debug=False
    app.run(host="0.0.0.0", port=port, debug=False)
