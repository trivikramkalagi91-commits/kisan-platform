# 🚀 One-Click Deployment: Kisan Platform

I have prepared **Automated Blueprints** (`render.yaml` and `vercel.json`) to make your deployment as fast as possible.

---

## 1. Deploy Backends (Render)
I've added a `render.yaml` blueprint. This will set up **both** the Node.js backend and the Python AI API automatically.

1.  Go to the [Render Blueprint Dashboard](https://dashboard.render.com/blueprints).
2.  Click **New Blueprint Instance**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `render.yaml` and suggest:
    - `kisan-backend` (Node.js)
    - `kisan-ai-api` (Python AI)
5.  **Important**: When prompted for `GEMINI_API_KEY`, paste your Google Gemini key.
6.  Click **Deploy**.

---

## 2. Deploy Frontend (Vercel)
I've added a `vercel.json` in the `frontend` folder.

1.  Go to [Vercel Dashboard](https://vercel.com/new).
2.  Import your GitHub repository.
3.  When configuring the project:
    - **Root Directory**: Select `frontend`.
4.  Vercel will pick up the `vercel.json` settings automatically.
5.  **Click Deploy**.

---

## 🔗 Connecting Everything
Once your Render services are live, verify the URLs:
- Backend: `https://kisan-backend.onrender.com/api`
- AI API: `https://kisan-ai-api.onrender.com`

If Render gave you different names (e.g., `kisan-backend-xyz.onrender.com`), simply go to your **Vercel Project Settings -> Environment Variables** and update:
- `REACT_APP_API_URL`: `https://your-actual-name.onrender.com/api`
- `REACT_APP_CROP_HEALTH_API`: `https://your-actual-name.onrender.com`

---

## 💡 Troubleshooting
- **First Scan is Slow?** Render's free tier "sleeps" after 15 mins. The first scan might take a minute to wake up the server.
- **Crop Health Error?** Ensure your `GEMINI_API_KEY` is correct in the Render "Environment" settings for `kisan-ai-api`.
- **CORS Issues?** I have already added `*.vercel.app` to the allowed origins in both backends.

**Your platform is ready for the world! 🌍🚜**
