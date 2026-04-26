# 🚜 Kisan Platform: Final Deployment Guide

Follow these exact steps to get your website live. I have already pre-configured the code, so you just need to select these options.

---

## 🏗️ Part 1: Deploying the Backends (Render)
Render will host your **Node.js server** and your **Python AI API**.

1.  **Open Render**: Go to [dashboard.render.com](https://dashboard.render.com/).
2.  **Go to Blueprints**: Click on **"Blueprints"** in the top navigation bar.
3.  **New Blueprint**: Click the **"New Blueprint Instance"** button.
4.  **Connect Repo**: Select your `kisan-platform` repository.
5.  **Blueprint Configuration**:
    - **Service Group Name**: You can leave this as `kisan-platform`.
    - **Branch**: `main`.
6.  **Confirm Services**: You will see two services automatically detected:
    - `kisan-backend` (Web Service)
    - `kisan-ai-api` (Web Service)
7.  **Click Apply**: Scroll to the bottom and click **"Apply"**.
8.  **Wait for Build**: It will take about 2-3 minutes for the servers to start. Once they say **"Live"**, you are done with this part!

> [!TIP]
> Your Gemini API Key is already embedded in the `render.yaml` I created, so you don't need to manually add it.

---

## 🎨 Part 2: Deploying the Frontend (Vercel)
Vercel will host your **React Website**.

1.  **Open Vercel**: Go to [vercel.com/new](https://vercel.com/new).
2.  **Import Repo**: Find your `kisan-platform` repo and click **"Import"**.
3.  **Configure Project**:
    - **Project Name**: `kisan-platform`
    - **Framework Preset**: Select **"Create React App"**.
    - **Root Directory**: Click "Edit" and select the **`frontend`** folder. (This is the most important step!)
4.  **Environment Variables**:
    - I've already set these up in `vercel.json`, but for safety, you can add them manually if the build fails:
    - `REACT_APP_API_URL` = `https://kisan-backend.onrender.com/api`
    - `REACT_APP_CROP_HEALTH_API` = `https://kisan-ai-api.onrender.com`
5.  **Click Deploy**: Click the **"Deploy"** button.

---

## ✅ How to check if it's working
1.  **Open your Vercel URL** (e.g., `https://kisan-platform.vercel.app`).
2.  **Go to "Govt Schemes"**: Search for "PM-KISAN" and check eligibility. If it loads, the **Node Backend** is working.
3.  **Go to "Crop Health AI"**: Upload a leaf photo. If the AI analyzes it, the **Python AI API** is working.

---

## ⚠️ Important Note on "Spin-up" Time
Because we are using the **Free Tier** of Render:
- If you haven't used the site for 15 minutes, the servers will "go to sleep."
- The **first time** you visit the site or use the AI, it might take 40-60 seconds to respond while Render wakes the servers up.
- After they are awake, everything will be fast!

**Congratulations! Your Kisan Platform is now officially production-ready!** 🚀
