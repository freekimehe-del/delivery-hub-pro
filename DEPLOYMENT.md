# Deployment Guide

## 1. Frontend (Vercel)

1.  Push your code to GitHub.
2.  Login to **Vercel** and "Add New Project".
3.  Select your repository.
4.  **Framework Preset**: Vite
5.  **Build Command**: `npm run build`
6.  **Output Directory**: `dist`
7.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your backend (e.g., `https://your-backend.onrender.com`)

## 2. Backend (Render / Railway)

1.  Login to **Render** or **Railway**.
2.  Create a "Web Service".
3.  Connect your repository.
4.  **Root Directory**: `server` (Important!).
5.  **Build Command**: `npm install`
6.  **Start Command**: `node index.js`
7.  **Environment Variables**:
    *   `PORT`: `10000` (or whatever the platform assigns)
    *   `FRONTEND_URL`: `https://your-frontend.vercel.app`
    *   `SUPABASE_URL`: (Optional) Your Supabase URL
    *   `SUPABASE_ANON_KEY`: (Optional) Your Supabase Key

## 3. Verification

Once deployed:
1.  Open the Vercel URL.
2.  Check the "Network" tab to ensure requests are hitting the Backend URL, not `localhost`.
