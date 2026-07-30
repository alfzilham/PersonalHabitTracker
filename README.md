# Personal Habit Tracker

A personal, all-in-one dashboard by Alfiz Ilham for tracking learning progress, university coursework, daily expenses, and tasks — built with vanilla HTML/CSS/JS + Node.js/Express backend and NeonDB (PostgreSQL).

**Version 2.0 — 2026**

## What it does

A personal productivity hub with 8 tabs:

| Tab | Purpose |
| --- | ------- |
| **Courses** | Track online certifications — user-added courses, filterable by Role, Category, Company |
| **Analytics** | Charts and progress bars aggregating Courses, Study, To-do, and Finance data |
| **Certificate** | Gallery of earned certificate images |
| **Study** | Weekly university class schedule with a checklist that resets every week |
| **Journal** | Masonry-grid log of study notes/materials tied to each class, with optional image attachments |
| **To-do** | General task list with priority and category filters |
| **Finance** | Weekly expense tracker with per-transaction table, daily report, and charts |
| **Archived** | Courses removed from the active list but kept for reference |

## Quick Start

```bash
# Install dependencies
cd server && npm install

# Start server (from project root)
cd .. && node server/server.js

# Open http://localhost:3000/login.html
# Login with a developer key (e.g. "FHG DIA")
```

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Backend:** Node.js + Express
- **Database:** NeonDB (PostgreSQL, cloud)
- **Auth:** Developer key + Google OAuth
- **Font:** Anthropic Sans / Anthropic Serif / Anthropic Mono (CDN)
- **Icons:** Lucide Icons (CDN)
- **Charts:** Chart.js
- **PDF export:** jsPDF + jsPDF-AutoTable (Finance export)
- **Storage:** NeonDB (primary) + localStorage (cache) + IndexedDB (Journal images)
- **Theme:** Anthropic earthy — cream/beige background, sage green + dusty blue accents

## Multi-User

- **Login options:** Developer key (manual) or Google OAuth
- **Google login:** Auto-fills email, avatar, skips username/key for existing users
- **New Google users:** Complete 3-step onboarding (username → role → developer key)
- **Keys:** 10 developer keys — each can only be used by ONE user
- **Data isolation:** All data is per-user, stored in NeonDB cloud
- **Logout:** Data synced to cloud, local cache cleared

## Project Structure

```
Personal-Habit-Tracker/
├── index.html                  # Dashboard SPA
├── login.html                  # Login page (split layout)
├── onboarding.html             # 3-step onboarding (Google users)
├── package.json                # Railway deploy config
├── .gitignore
│
├── assets/
│   ├── css/                    # global.css + components.css (37 sections) + responsive.css
│   └── js/                     # 15 JS files (modular)
│       ├── dashboard-core.js   # Core: init, data access, tab switching
│       ├── courses.js          # Course table, filter, archive
│       ├── study.js            # Study + Journal
│       ├── todo.js             # To-do CRUD
│       ├── finance.js          # Finance tracker
│       ├── analytics.js        # Charts
│       ├── certificate.js      # Certificate gallery
│       ├── settings.js         # Profile, theme, export
│       ├── login.js            # Login page logic
│       ├── onboarding.js       # 3-step onboarding flow
│       ├── data.js             # COURSES = [] (user-generated)
│       ├── data-study.js       # STUDY_COURSES = [] (user-generated)
│       ├── study-db.js         # IndexedDB wrapper
│       └── dashboard-i18n.js   # EN/ID translator
│
├── pages/
│   └── course.html             # Course note editor (markdown + preview)
│
├── server/                     # Express + NeonDB backend
│   ├── server.js               # Entry point
│   ├── .env.local              # Developer keys + DATABASE_URL + Google OAuth
│   ├── package.json
│   ├── database/db.js          # NeonDB async queries
│   ├── middleware/auth.js       # Bearer token validation
│   └── routes/
│       ├── auth.js             # POST /api/login, /api/login/google, /api/logout, /api/account
│       ├── data.js             # GET/POST/DELETE /api/data/:feature
│       └── oauth.js            # GET /auth/google, /auth/google/callback
│
├── docs/                       # Documentation
└── logs/
```

## Data & Privacy

- All user data stored in NeonDB cloud (PostgreSQL)
- LocalStorage used as cache for fast reads
- Journal images stored in IndexedDB (browser)
- Nothing is shared with third parties
- Data can be exported via Settings → Export

---

Develop by Alfiz Ilham © 2026 **Alfiz Ilham**. All rights reserved.
