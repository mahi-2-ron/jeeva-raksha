
# ⚡️ Deployment Troubleshooting Guide

## Problem: Login Failed / 404 Not Found on Deployment
The error `POST https://jeevaraksha.netlify.app/api/auth/login net::ERR_ABORTED 404 (Not Found)` means that your frontend (deployed on Netlify) is trying to access the backend API on the *same domain* (`jeevaraksha.netlify.app`), but the backend is not running there.

Netlify is primarily for static sites (frontend). It does not host Node.js servers (unless using Netlify Functions, which requires code structure changes).

## Solution

You need to deploy the `server/` folder to a Node.js hosting platform and point the frontend to it.

### Step 1: Deploy Backend
Deploy your `server` directory to a service like **Render**, **Railway**, or **Heroku**.
1. Create a new Web Service on Render/Railway.
2. Connect your repository.
3. Set the build command: `npm install`
4. Set the start command: `node server/index.js`
5. Add Environment Variables:
   - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT` (Your database credentials)
   - `JWT_SECRET` (A strong random string)
   - `CORS_ORIGIN` (Your Netlify frontend URL: `https://jeevaraksha.netlify.app`)

### Step 2: Configure Frontend
Once your backend is deployed, you will get a URL (e.g., `https://jeeva-raksha-api.onrender.com`).

1. Go to your Netlify Dashboard > Site settings > **Environment variables**.
2. Add a new variable:
   - Key: `VITE_API_URL`
   - Value: `https://jeeva-raksha-api.onrender.com/api` (Replace with your actual backend URL)
3. **Re-deploy** your frontend on Netlify.

### Why this happens
- When running locally (`npm run dev`), Vite proxies `/api` requests to `localhost:5000`.
- In production, this proxy doesn't exist. The frontend code uses `import.meta.env.VITE_API_URL` to know where the API is. If not set, it defaults to `/api` (relative path), which fails on Netlify.

### Verification
After redeploying, open the browser developer tools (F12) -> Network tab.
- Try logging in.
- The request should now go to `https://jeeva-raksha-api.onrender.com/api/auth/login` instead of `https://jeevaraksha.netlify.app/api/auth/login`.

