# Jeeva Raksha (ಜೀವರಕ್ಷ) — Unified Hospital Information System

**Jeeva Raksha** is a next-generation, trust-driven, and AI-powered digital backbone for modern hospitals. Designed with a "clinical-first" philosophy, it combines deep medical intelligence with a healing-centric aesthetic to empower healthcare professionals and enhance patient outcomes.

---

## 🏥 Key Modules & Features

### 🩺 Clinical Intelligence
- **Doctor's Pad (Ward Rounds)**: A tablet-optimized interface for digital rounds with stylus support, real-time vital tracking, and AI-assisted clinical notes.
- **OPD & IPD Management**: Efficient handling of outpatient check-ins and inpatient admissions/discharges.
- **EMR/EHR**: Longitudinal patient records with versioning and secure audit trails.

### ⚡ Critical Care & Operations
- **Emergency Management**: Real-time triage, ambulance tracking, and emergency override protocols.
- **OT Management**: Operation Theatre scheduling, surgical checklists, and recovery tracking.
- **Bed Management**: Visual "Bed Hub" for live occupancy tracking, cleaning status, and ward allocation.

### 🧪 Diagnostics & Ancillary
- **AI Lab Analytics**: Interpretation of lab results with clinical risk scoring.
- **Radiology**: Integrated viewer for imaging reports and AI-driven scan summaries.
- **Pharmacy & Inventory**: Real-time stock alerts, automated reordering, and integrated prescription fulfillment.

### 🏢 Administration & Engagement
- **Enterprise Dashboard**: KPI tracking (Revenue, Census, Wait Times) with AI-driven operational insights.
- **Audit & Compliance**: Automated NABH/HIPAA readiness scoring and historical audit trails.
- **Patient Portal**: Secure access for patients to view reports, book appointments, and pay bills.
- **Multi-language Support**: Full support for English, Kannada, and Hindi.

---

## 🎨 Design Philosophy
- **Aesthetic**: Premium, minimal, and calming. Uses a "Healthcare Blue" palette and "Inter" typography for maximum legibility.
- **Responsiveness**: Mobile-first design for nurses and tablet-optimized for doctors during rounds.
- **Role-Awareness**: The interface dynamically adapts based on the logged-in user (Doctor, Admin, Nurse, etc.).
- **Typography**: Optimized Inter (Main UI) and Noto Sans Kannada (Regional) font pairing.

---

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons, Recharts.
- **Backend**: Node.js (Express), JSON Web Tokens (JWT), PostgreSQL.
- **AI Integrated**: Clinical LLM Integration for diagnostics, lab analysis, and radiology interpretation.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Setup Database
1. Create a database named `jeeva_raksha`.
2. Run the preliminary schema migrations:
   ```bash
   psql -d jeeva_raksha -f server/schema.sql
   psql -d jeeva_raksha -f server/migration_auth.sql
   ```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL=postgres://user:pass@localhost:5432/jeeva_raksha
JWT_SECRET=your_super_secret_key
VITE_API_URL=http://localhost:5000/api
```

### 3. Install & Run
```bash
# Install dependencies
npm install

# Run frontend (Vite) on port 3000
npm run dev

# Run backend (Express) on port 5000
npm run server
```

---

## 🌐 Deployment Guidelines
This project is architected for a decoupled deployment strategy:

### ⚡ Backend (Node.js/Express)
- Deploy to **Render**, **Railway**, or **Heroku**.
- Ensure the `DATABASE_URL` and `JWT_SECRET` are set in the environment variables.
- The server is configured to serve the frontend bundle from `dist/` if present.

### 🎨 Frontend (React/SPA)
- Build using `npm run build`.
- Deploy the `dist` folder to **Netlify** or **Vercel**.
- **Critical**: Set `VITE_API_URL` in your deployment settings to point to your backend API URL (e.g., `https://api.yourhospital.com/api`).

---

## 📜 Credits & Licensing
© 2026 Jeeva Raksha. "Universal Health Hub".
Dedicated to providing high-trust clinical software for universal health coverage.

*“ಸಂಪೂರ್ಣ ಅನುಸರಣೆ — ಸುರಕ್ಷಿತ ಚಿಕಿತ್ಸೆ” (Complete Compliance — Safe Treatment)*
