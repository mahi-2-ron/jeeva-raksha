
# 🚀 FINAL STEP: Connect Frontend (Netlify) to Backend (Railway)

Your backend is running on Railway! Now you need to tell your Netlify frontend where to find it.

### Step 1: Copy Backend URL from Railway
1. Go to your **Railway Dashboard**.
2. Click on your project.
3. Click on the **Service** (the Node.js app).
4. Go to **Settings** -> **Networking** -> **Public Networking**.
5. Copy the **Domain** (it looks like `https://web-production-xxxx.up.railway.app`).

### Step 2: Set Environment Variable in Netlify
1. Go to your **Netlify Dashboard**.
2. Click on your site (`jeevaraksha`).
3. Go to **Site configuration** -> **Environment variables**.
4. Click **Add a variable**.
   - **Key:** `VITE_API_URL`
   - **Value:** `https://web-production-xxxx.up.railway.app/api`  <-- IMPORTANT: Add `/api` at the end!
5. Click **Create variable**.

### Step 3: Trigger a Redeploy
Netlify only applies variables during the build process. You must rebuild the site.
1. In Netlify, go to the **Deploys** tab.
2. Click **Trigger deploy** -> **Clear cache and deploy site**.

### Step 4: Verify
Once the deploy is finished:
1. Open your Netlify site.
2. Open Developer Tools (F12) -> Console.
3. Look for the message: `[API CONFIG] Using backend: https://web-production-xxxx.up.railway.app/api`.
   - If you see `Relative (/api)`, the variable didn't take effect (redo Step 2 & 3).

### Troubleshooting
- If login still fails, check the **Network** tab in Developer Tools.
- Ensure the backend URL is correct and includes `/api`.
- Ensure the backend on Railway is running and healthy (check logs for green "Active").
