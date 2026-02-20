
# 🗄️ Setting Up Your Database on Railway

Your **Railway** project needs a PostgreSQL database to store patients, doctors, and appointments.

### Step 1: Add PostgreSQL Service
1. Open your project in the **Railway Dashboard**.
2. Click **+ New** (top right) or **Create** -> **Database** -> **PostgreSQL**.
3. Wait for it to initialize (it might take 30-60 seconds).

### Step 2: Connect Node Server to Database
Railway usually automates this, but let's verify.
1. Click on your **Node.js Service** (the app).
2. Go to **Variables**.
3. Look for `DATABASE_URL`.
   - **If it's there:** Great! You're connected.
   - **If MISSING:** 
     1. Click **New Variable**.
     2. Name: `DATABASE_URL`
     3. Value: type `${{` and select **Postgres** from the list -> **DATABASE_URL**.

### Step 3: Initialize the Database (One-time Setup)
You need to create the tables (`patients`, `doctors`, etc.) inside the new empty database.

**Option A: Using Railway Query Interface (Easiest)**
1. Click on the **PostgreSQL** service in Railway.
2. Go to the **Data** tab.
3. You might see a "SQL Query" or "Data Explorer" option. If not, proceed to Option B.

**Option B: Using PGAdmin or Local Terminal (Recommended)**
1. Click on the **PostgreSQL** service -> **Connect**.
2. Copy the **Postgres Connection URL** (e.g., `postgresql://postgres:password@viaduct.proxy.rlwy.net:12345/railway`).
3. Open your local terminal (PowerShell/Command Prompt).
4. Run this command (if you have `psql` installed):
   ```powershell
   psql "YOUR_CONNECTION_URL" -f server/schema.sql
   psql "YOUR_CONNECTION_URL" -f server/migration_auth.sql
   ```
   *(Replace YOUR_CONNECTION_URL with the one you copied)*

**Option C: Using a Node Script (If you don't have psql)**
I have included a setup script `setup-db.js` in your project root.
1. In your local VS Code terminal, update your `.env` file with the Railway `DATABASE_URL`.
2. Run: `node setup-db.js`
   - *Note: I will create this script for you now.*
