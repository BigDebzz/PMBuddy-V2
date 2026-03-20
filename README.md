# ◆ ValidatePro — Product Validation for Entrepreneurs

> Built for entrepreneurs, hackathon teams, and small businesses in Nigeria and emerging markets.

A free, immersive product validation and project management tool. Answer smart questions about your idea — get a real feasibility report, methodology recommendation, 90-day action plan, and go-to-market strategy tailored for your context.

---

## ✨ Features

| Feature | What it does |
|---|---|
| 🔍 Guided Discovery | 18 probing questions across 4 stages — feels like a conversation |
| ⚡ Feasibility Check | Scored assessment with African startup comparables (Paystack, Piggyvest, etc.) |
| 🧭 Methodology Guide | Recommends Agile, Scrum, Kanban, or Waterfall — applied to YOUR project |
| 🗺️ 90-Day Action Plan | MVP definition, milestones, key decisions, success metrics |
| 🚀 Go-to-Market | First customer strategy, channel analysis, revenue model assessment |
| 💾 Save & Iterate | Supabase-powered save/load (optional but recommended) |
| 🧰 Build Tools Guide | No-code/low-code directory tailored for Nigerian builders |

---

## 🚀 Deployment Guide (Step by Step)

### Prerequisites
- A computer with internet access
- About 30–45 minutes for full setup

---

### PART 1: Run Locally

**Step 1 — Install Node.js**
1. Go to https://nodejs.org
2. Download **LTS version** and install it
3. Open Terminal (Mac) or Command Prompt (Windows)
4. Type `node --version` — you should see `v18` or higher

**Step 2 — Set up the project**
```bash
cd Desktop
# Unzip the validate-pro folder here, then:
cd validate-pro
npm install
npm start
```
Your browser opens at http://localhost:3000 — the app is running!

---

### PART 2: Connect Supabase (for Save/Load feature)

**Step 3 — Create a Supabase account**
1. Go to https://supabase.com → Sign up for free
2. Create a new project (pick any name, e.g. `validate-pro`)
3. Wait ~2 minutes for setup

**Step 4 — Create the projects table**
1. In Supabase: click **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste this SQL and click **Run**:

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  answers JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON projects FOR ALL USING (true);
```

**Step 5 — Get your API keys**
1. In Supabase: click **Settings** (bottom left) → **API**
2. Copy **Project URL** and **anon public** key

**Step 6 — Add keys to your project**
1. In your `validate-pro` folder, create a file called `.env.local`
2. Add this content (replace with your real values):

```
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Stop your local server (Ctrl+C) and restart: `npm start`
4. The Save button should now work!

---

### PART 3: Deploy to GitHub

**Step 7 — Create a GitHub account**
1. Go to https://github.com → Sign up (free)
2. Verify your email

**Step 8 — Install Git**
1. Go to https://git-scm.com/downloads and install
2. Verify: `git --version`

**Step 9 — Create a GitHub repository**
1. Click **+** → **New repository** on GitHub
2. Name: `validate-pro`
3. Set to **Public**
4. Don't add README (we have one)
5. Click **Create repository**

**Step 10 — Push your code**
```bash
# In your validate-pro folder:
git init
git add .
git commit -m "Initial commit — ValidatePro"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/validate-pro.git
git push -u origin main
```

---

### PART 4: Deploy to Vercel

**Step 11 — Connect to Vercel**
1. Go to https://vercel.com → Sign up with GitHub
2. Click **Add New → Project**
3. Find `validate-pro` → click **Import**
4. Vercel auto-detects React settings — don't change anything

**Step 12 — Add environment variables to Vercel**
1. Before clicking Deploy, expand **Environment Variables**
2. Add:
   - `REACT_APP_SUPABASE_URL` = your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your Supabase anon key
3. Click **Deploy**
4. Wait ~2 minutes...

🎉 **Your app is live!** URL will be something like `validate-pro-username.vercel.app`

---

### Updating later
```bash
git add .
git commit -m "What I changed"
git push
```
Vercel auto-deploys in ~30 seconds.

---

## 📁 File Structure

```
validate-pro/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── LandingScreen.js      # Animated home page
│   │   ├── DiscoveryWizard.js    # 18-question guided flow
│   │   ├── ResultsDashboard.js   # Full results (5 tabs)
│   │   ├── SavedProjects.js      # Load saved projects
│   │   └── StarField.js          # Background animation
│   ├── data/
│   │   ├── questions.js          # All 18 questions + stages
│   │   ├── analysis.js           # Scoring + generation engine
│   │   └── tools.js              # No-code tool directory
│   ├── lib/
│   │   └── supabase.js           # Save/load functions
│   ├── App.js                    # Main app + navigation
│   ├── index.js                  # Entry point
│   └── index.css                 # Design system
├── .env.example                  # Template for env variables
├── vercel.json                   # Vercel config
└── package.json
```

---

## 🎨 Customising

| What to change | Where |
|---|---|
| Questions | `src/data/questions.js` |
| Scoring logic | `src/data/analysis.js` — `scoreFeasibility()` |
| Methodology details | `src/data/analysis.js` — `methodologyData` object |
| No-code tools | `src/data/tools.js` |
| Colors / design | `src/index.css` — CSS variables at top |
| Landing page copy | `src/components/LandingScreen.js` |

---

## 💰 Cost

- Vercel hosting: **Free**
- Supabase: **Free** (up to 500MB and 50,000 rows)
- GitHub: **Free**
- **Total: $0/month**

---

Built with React · Designed for builders in Africa 🌍
