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
cd server
npm start
# Open http://localhost:3000/login.html
# Login with a developer key (e.g. "FHG DIA")
```

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Backend:** Node.js + Express
- **Database:** NeonDB (PostgreSQL, cloud)
- **Font:** Anthropic Sans / Anthropic Serif / Anthropic Mono (CDN)
- **Icons:** Lucide Icons (CDN)
- **Charts:** Chart.js
- **PDF export:** jsPDF + jsPDF-AutoTable (Finance export)
- **Storage:** NeonDB (primary) + localStorage (cache) + IndexedDB (Journal images)
- **Theme:** Anthropic earthy — cream/beige background, sage green + dusty blue accents

## Multi-User

- Each user has a unique developer key (10 available)
- Data is per-user, stored in NeonDB cloud
- Switching users clears local cache and loads fresh data from server
- Keys cannot be reused — if a key is taken, another user must pick a different one

## Project Structure

```
Personal-Habit-Tracker/
├── index.html                  # Dashboard SPA
├── login.html                  # Login page (split layout)
├── assets/
│   ├── css/                    # global.css + components.css + responsive.css
│   ├── js/                     # 12 modular JS files
├── pages/
│   └── course.html             # Course note editor
├── server/                     # Express + NeonDB backend
│   ├── server.js
│   ├── database/db.js
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js             # /api/login, /api/logout, /api/account
│       └── data.js             # /api/data CRUD
├── docs/                       # Documentation
```

## Data & Privacy

- All data stored in NeonDB cloud (PostgreSQL)
- LocalStorage used as cache for fast reads
- Nothing is shared with third parties
- Data can be exported via Settings → Export

---

Develop by Alfiz Ilham © 2026 **Alfiz Ilham**. All rights reserved.
