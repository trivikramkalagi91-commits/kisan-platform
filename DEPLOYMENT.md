# 🚀 Deployment Guide: Kisan Platform

Follow these steps to deploy your full stack application to **Vercel** (Frontend) and **Render** (Backends).

---

## 1. Prerequisites
- A GitHub repository containing the project.
- A [Vercel](https://vercel.com/) account.
- A [Render](https://render.com/) account.
- A **Google Gemini API Key**.

---

## 2. Deploy Core Backend (Render)
This is the Node.js server located in `kisan-platform/backend`.

1. **Create New Service**: Go to Render Dashboard -> **New** -> **Web Service**.
2. **Connect Repo**: Select your GitHub repo.
3. **Configure**:
   - **Name**: `kisan-backend`
   - **Root Directory**: `kisan-platform/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables**: Add these in the "Env Vars" tab:
   - `PORT`: `5000` (or leave default)
   - `NODE_ENV`: `production`
   - *Any other variables from your `.env` file.*
5. **Copy the URL**: Once deployed, copy the Render URL (e.g., `https://kisan-backend.onrender.com`).

---

## 3. Deploy Crop Health AI API (Render)
This is the Python Flask server located in `kisan-platform/crop_health_api`.

1. **Create New Service**: Go to Render Dashboard -> **New** -> **Web Service**.
2. **Connect Repo**: Select your GitHub repo.
3. **Configure**:
   - **Name**: `kisan-ai-api`
   - **Root Directory**: `kisan-platform/crop_health_api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. **Environment Variables**:
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*
   - `PYTHON_VERSION`: `3.10.0` (or higher)
5. **Copy the URL**: Once deployed, copy the Render URL (e.g., `https://kisan-ai-api.onrender.com`).

---

## 4. Deploy Frontend (Vercel)
This is the React application located in `kisan-platform/frontend`.

1. **Create Project**: Go to Vercel Dashboard -> **Add New** -> **Project**.
2. **Connect Repo**: Select your GitHub repo.
3. **Configure**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `kisan-platform/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. **Environment Variables**: Add these before clicking Deploy:
   - `REACT_APP_API_URL`: `https://your-kisan-backend.onrender.com/api` (Use the URL from Step 2)
   - `REACT_APP_CROP_HEALTH_API`: `https://your-kisan-ai-api.onrender.com` (Use the URL from Step 3)
5. **Deploy**: Click **Deploy**.

---

## 💡 Important Notes

- **CORS Support**: Both backends are already configured to allow requests from `*.vercel.app`.
- **Sleeping Services**: If you are using Render's **Free Tier**, the services will "spin down" after inactivity. The first request after a break might take 30-60 seconds to respond while the server wakes up.
- **AI Performance**: The Crop Health AI uses Gemini 1.5 Flash, which is fast and efficient for production use.
- **Image Size**: The frontend automatically compresses images before sending to the AI API to save bandwidth and ensure it works on rural networks.

---

**Happy Farming!**
