# STRUCTURE.md

`D:\2026\Workspace\PersonalApps\AnthropicCourse`

```
├── index.html                  # Dashboard SPA — 8 tab panels + modals
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
│       ├── finance.js           # Finance tracker, export CSV/PDF, chart
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
│   └── course.html             # Course note editor (markdown + preview)
│
├── server/                     # Backend — Express + NeonDB
│   ├── server.js               # Entry point, serve frontend + API
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
│   ├── TODO_ARCHIVED.md        # Task tracker (completed)
│   └── news/
│       ├── COURSES_REFERENCE.md    # Backup 80 course
│       ├── STUDY_REFERENCE.md      # Backup mata kuliah
│       ├── KULIAH_PENDING.md       # Legacy historical record
│       ├── NEW.md                  # Google OAuth spec
│       └── REPORT.md
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
- `TODO.md` was archived to `TODO_ARCHIVED.md` after all tasks were completed.
- `graphify-out/` and `ruvector.db` (OpenCode tooling artifacts) are excluded from app concerns.
