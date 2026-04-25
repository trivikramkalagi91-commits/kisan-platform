#!/usr/bin/env python3
"""
Quick-start script for the Crop Health AI backend.
Run: python start.py
"""
import subprocess, sys, os

def install_requirements():
    print("[INSTALL] Installing Python dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    try:
        import flask
        import flask_cors
        import PIL
        import numpy
        import cv2
        from google import genai
    except ImportError:

        install_requirements()

    port = os.getenv("PORT", "5001")
    print(f"\n[START] Starting Crop Health AI API on http://localhost:{port}")
    print("   Press Ctrl+C to stop.\n")
    os.environ.setdefault("FLASK_ENV", "development")
    subprocess.run([sys.executable, "app.py"])

if __name__ == "__main__":
    main()
