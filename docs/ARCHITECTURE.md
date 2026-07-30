# ARCHITECTURE.md — Personal Habit Tracker

## Overview

A multi-tab, single-page vanilla web app with a Node.js/Express backend and NeonDB (PostgreSQL). No build tools, no frameworks. Every file is plain HTML/CSS/JS. Persistence is server-side (NeonDB) with localStorage as sync cache.

---

## Folder Structure

```
Personal-Habit-Tracker/
│
├── index.html                  # SPA — sidebar + bottom nav + 8 tab panels + modals
├── login.html                  # Login page (split layout)
├── onboarding.html             # 3-step onboarding (Google users)
│
├── assets/
│   ├── css/
│   │   ├── global.css          # CSS variables (incl. dark mode), reset, base typography
│   │   ├── components.css      # 37 numbered sections — all UI components
│   │   └── responsive.css      # Mobile responsive overrides (bottom nav, modal fullscreen)
│   ├── favicon/
│   ├── image/
│   └── js/
│       ├── dashboard-core.js   # Core: constants, data access, init(), tab switching
│       ├── courses.js           # Course table render, filter, archive
│       ├── study.js             # Study tab + Journal render, CRUD, lightbox
│       ├── todo.js              # To-do CRUD, filter, due-date, charts
│       ├── finance.js           # Finance tracker, export CSV/PDF, charts
│       ├── analytics.js         # All chart analytics (courses, study, todo, finance)
│       ├── certificate.js       # Certificate gallery, CRUD, WebP upload
│       ├── settings.js          # Profile, theme, data export/import, FAQ
│       ├── login.js             # Login page logic
│       ├── onboarding.js        # 3-step onboarding flow (Google users)
│       ├── data.js              # COURSES = [] (user-generated)
│       ├── data-study.js        # STUDY_COURSES = [] (user-generated)
│       ├── study-db.js          # IndexedDB wrapper (Journal images)
│       └── dashboard-i18n.js    # EN/ID translator
│
├── pages/
│   └── course.html             # Course note editor (markdown + preview)
│
├── server/                     # Backend — Express + NeonDB
│   ├── server.js               # Entry point
│   ├── .env.local              # 10 developer keys + DATABASE_URL
│   ├── package.json
│   ├── database/
│   │   └── db.js               # NeonDB async queries
│   ├── middleware/
│   │   └── auth.js             # Bearer token validation
│   └── routes/
│       ├── auth.js             # POST /api/login, /api/login/google, /api/logout, DELETE /api/account
│       ├── data.js             # GET/POST/DELETE /api/data/:feature
│       └── oauth.js            # GET /auth/google, /auth/google/callback
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── CONTEXT.md
│   ├── DESIGN.md
│   └── STRUCTURE.md
│
├── logs/
├── components/                 # Kosong
└── graphify-out/               # OpenCode artifacts
```

---

## Data Flow

```
User opens login.html
    ↓
Enter username + developer key
    ↓
POST /api/login → validate key → return token
    ↓
sessionStorage.setItem('session_token', token)
    ↓
Redirect to index.html
    ↓
init() → cek session_token → loadFromServer()
    ↓
GET /api/data → fetch semua data user dari NeonDB
    ↓
Sync ke localStorage → render UI
    ↓
User berinteraksi → data di localStorage
    ↓
switchTab() → syncToServer() → POST /api/data (simpan ke NeonDB)
    ↓
Logout → syncToServer() → clear localStorage → redirect login
```

---

## API Routes

| Method | Route | Auth | Description |
| ------ | ----- | ---- | ----------- |
| POST | `/api/login` | ❌ | Login with username + developer key |
| POST | `/api/login/google` | ❌ | Complete Google onboarding with username + key |
| POST | `/api/logout` | ✅ | Invalidate session token |
| DELETE | `/api/account` | ✅ | Delete account + all data |
| GET | `/api/data` | ✅ | Get all user data |
| GET | `/api/data/:feature` | ✅ | Get one feature |
| POST | `/api/data` | ✅ | Save all data |
| POST | `/api/data/:feature` | ✅ | Save one feature |
| DELETE | `/api/data/:feature/:key` | ✅ | Delete one key |
| GET | `/auth/google` | ❌ | Start Google OAuth flow |
| GET | `/auth/google/callback` | ❌ | Google OAuth callback handler |

---

## database.js — NeonDB Schema

```sql
app_users (id SERIAL, username TEXT UNIQUE, developer_key TEXT, google_id TEXT UNIQUE, email TEXT, avatar_url TEXT, created_at TIMESTAMPTZ)
app_data (id SERIAL, user_id INTEGER, feature TEXT, data_key TEXT, data_value TEXT)
app_sessions (id SERIAL, user_id INTEGER, token TEXT UNIQUE, created_at TIMESTAMPTZ)
```

---

## dashboard-core.js — Section Map

| #   | Section          | Covers                                          |
| --- | ---------------- | ----------------------------------------------- |
| 1   | Constants        | All localStorage keys, state variables          |
| 2   | Data Access      | load/save for all features (localStorage)       |
| 3   | Course Helpers   | getCourseKey, getCoursesWithCompletion, filters |
| 4   | Study Helpers    | Week calculations, time slots                   |
| 5   | Navigation       | navigateToCourse (to course.html)               |
| 6   | Utilities        | escapeHtml, reinitLucide, renderMarkdown        |
| 6a  | Backend Sync     | apiFetch, syncToServer, loadFromServer          |
| 6b  | Custom Dropdown  | createViewDropdown, getViewDropdownValue        |
| 7   | Tab Switching    | switchTab, attachTabListeners, header counter   |
| 8   | Completion UI    | refreshCompletionUI, updateProgressBars         |
| 9   | Todo Helpers     | Due-date badge, banner                          |
| 10  | Settings Helpers | Theme, sidebar profile                          |
| 11  | Confirm Modal    | showConfirm, showAlert                          |
| 12  | Init             | Entry point, wires all event listeners          |

---

## Script Load Order

```
Chart.js → jsPDF → data.js → data-study.js → study-db.js →
dashboard-i18n.js →
dashboard-core.js →
courses.js → study.js → todo.js → finance.js → analytics.js → certificate.js → settings.js →
Lucide icons
```

---

## localStorage Key Reference

| Key                 | Feature      | Persistence       |
| ------------------- | ------------ | ----------------- |
| `course_completion` | Courses      | Server + fallback |
| `custom_courses`    | Courses      | Server + fallback |
| `study_completion`  | Study        | Server + fallback |
| `study_log`         | Journal      | Server + fallback |
| `todos`             | To-do        | Server + fallback |
| `finance_records`   | Finance      | Server + fallback |
| `certificates`      | Certificate  | Server + fallback |
| `settings_profile`  | Settings     | Server + fallback |
| `course_notes`      | Course notes | Server + fallback |
| `session_token`     | Auth         | Session only      |

---

## CSS Architecture

```
global.css (design tokens, reset, typography, layout)
    + components.css (37 sections — badges, cards, table, modal, editor, login split, onboarding, etc.)
    + responsive.css (mobile overrides, bottom nav, full-screen modal)
```

---

## Known Issues

- Progress-by-Role labels in Analytics tab use dynamic counts from user data (no longer hardcoded).
- Study weekly reset uses localStorage timestamp; Journal entries persist.
- Developer keys are defined in `.env.local` — update requires server restart.
