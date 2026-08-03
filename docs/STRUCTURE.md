# STRUCTURE.md

`D:\2026\Workspace\PersonalApps\AnthropicCourse`

```
├── index.html                  # Dashboard SPA — 9 tab panels + modals
├── login.html                  # Halaman login multi-user (split layout)
├── onboarding.html             # 3-step onboarding (Google users)
├── package.json                # Railway deploy config (root)
├── .gitignore
├── README.md
│
├── assets/
│   ├── css/
│   │   ├── global.css          # CSS variables, reset, typography, layout
│   │   ├── components.css      # 37 section — badges, cards, table, modal, editor, onboarding
│   │   └── responsive.css      # Mobile: bottom nav, full-screen modal
│   ├── favicon/
│   │   └── favicon.ico
│   ├── image/
│   │   └── emptyProfile.webp
│   └── js/
│       ├── dashboard-core.js   # Core: constants, utilities, init(), tab switching
│       ├── courses.js           # Courses table render, filter, archive
│       ├── study.js             # Study tab + Journal render, modal, lightbox
│       ├── todo.js              # To-do CRUD, filter, due-date chart
│       ├── notes.js             # Notes tab (Google Keep) + archive
│       ├── finance.js           # Finance tracker (Pemasukan/Pengeluaran), export CSV/PDF, chart
│       ├── analytics.js         # Chart analytics (courses, study, todo, finance)
│       ├── certificate.js       # Certificate gallery, CRUD, WebP upload
│       ├── settings.js          # Profile, theme, data export/import, FAQ
│       ├── login.js             # Login page logic + Google OAuth handler
│       ├── onboarding.js        # 3-step onboarding flow
│       ├── data.js              # COURSES = [] (user-generated)
│       ├── data-study.js        # STUDY_COURSES = [] (user-generated)
│       ├── study-db.js          # IndexedDB wrapper (Journal images)
│       └── dashboard-i18n.js    # EN/ID translator
│
├── pages/
│   └── course.html             # Course note editor (Rich Text/Markdown + preview + view-mode zoom)
│
├── server/                     # Backend — Express + NeonDB
│   ├── server.js               # Entry point, serve frontend + API (blokir file sensitif, clean-URL)
│   ├── .env.local              # 10 developer keys + DATABASE_URL + Google OAuth
│   ├── package.json
│   ├── database/
│   │   └── db.js               # NeonDB async (app_users, app_data, app_sessions)
│   ├── middleware/
│   │   └── auth.js             # Bearer token validation
│   └── routes/
│       ├── auth.js             # POST /api/login, /api/login/google, /api/logout, /api/account
│       ├── data.js             # GET/POST/DELETE /api/data/:feature
│       └── oauth.js            # GET /auth/google, /auth/google/callback
│
├── docs/
│   ├── ARCHITECTURE.md         # Architecture, data flow, API routes
│   ├── CONTEXT.md              # Project context, workflow rules
│   ├── DESIGN.md               # Design tokens, component map, CDN links
│   ├── STRUCTURE.md            # This file
│   └── notes/
│       ├── NEW.md                  # Fitur baru (log)
│       ├── REPORT.md               # Laporan
│       ├── SQL_RESET.md            # Reset database
│       └── TODO.md                 # Task tracker (arsip)
│
├── logs/
│   └── console.log             # Debug log
│
├── graphify-out/               # OpenCode knowledge graph artifacts
└── components/                 # Kosong
```

## Notes

- `data.js` and `data-study.js` are empty arrays — all course/subject data is user-generated.
- `server/` contains the Express + NeonDB backend.
- Google OAuth routes are in `server/routes/oauth.js`, mounted at root level.
- Onboarding page is only shown to first-time Google OAuth users.
- `notes.js` powers the **Notes** tab (Google Keep-style) dan bagian arsip Notes di tab **Archived**.
- Tab **Archived** kini punya sub-tab Courses / Study / Notes (`archived_study` key untuk subjek terarsip).
- Tab **Finance** punya mode Pemasukan/Pengeluaran (field `type: income|expense`), keduanya tidak saling sinkron.
- `course.html` mendukung tema multi-theme, view-mode persisten (preview scroll halaman, tanpa scrollbar dalam) + zoom in/out.
- `graphify-out/` and `ruvector.db` (OpenCode tooling artifacts) are excluded from app concerns.
