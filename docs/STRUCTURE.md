# STRUCTURE.md

`D:\2026\Workspace\PersonalApps\AnthropicCourse`

```
├── index.html                  # Dashboard SPA — 8 tab panels + modals
├── login.html                  # Halaman login multi-user
├── README.md
│
├── assets/
│   ├── css/
│   │   ├── global.css          # CSS variables, reset, typography, layout
│   │   └── components.css      # 35 section — badges, cards, table, modal, editor, dll
│   ├── favicon/
│   │   └── favicon.ico
│   ├── image/
│   │   └── emptyProfile.webp
│   └── js/
│       ├── dashboard-core.js   # Constants, utilities, data access, init(), tab switching
│       ├── courses.js           # Courses table render, filter, archive
│       ├── study.js             # Study tab + Journal render, modal, lightbox
│       ├── todo.js              # To-do CRUD, filter, due-date chart
│       ├── finance.js           # Finance tracker, export CSV/PDF, chart
│       ├── analytics.js         # Chart analytics (courses, study, todo, finance)
│       ├── certificate.js       # Certificate gallery, CRUD, WebP upload
│       ├── settings.js          # Profile, theme, data export/import, FAQ
│       ├── login.js             # Login page logic
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
│   ├── .env.local              # 10 developer keys + DATABASE_URL
│   ├── package.json
│   ├── database/
│   │   └── db.js               # NeonDB async queries (app_users, app_data, app_sessions)
│   ├── middleware/
│   │   └── auth.js             # Bearer token validation
│   └── routes/
│       ├── auth.js             # POST /api/login, /api/logout, DELETE /api/account
│       └── data.js             # GET/POST/DELETE /api/data/:feature
│
├── docs/
│   ├── ARCHITECTURE.md         # Architecture, data flow, localStorage keys
│   ├── CONTEXT.md              # Project context, workflow rules
│   ├── DESIGN.md               # Design tokens, component map, CDN links
│   ├── STRUCTURE.md            # This file
│   ├── TODO.md                 # Task tracker multi-user implementation
│   └── news/
│       ├── COURSES_REFERENCE.md    # Backup 80 course
│       ├── STUDY_REFERENCE.md      # Backup mata kuliah
│       ├── KULIAH_PENDING.md       # Legacy historical record
│       ├── NEW.md                  # Login architecture (implemented)
│       └── REPORT.md
│
├── logs/
│   └── console.log             # Debug log (kosong)
│
├── components/                 # Kosong
│
├── graphify-out/               # OpenCode knowledge graph artifacts
│
└── server/data.db              # SQLite lama (deleted after NeonDB migration)
```

## Notes

- `docs/news/KULIAH_PENDING.md` is a legacy filename kept as-is (historical record) — not part of the active codebase naming.
- `data.js` and `data-study.js` are now empty arrays — all course/subject data is user-generated.
- `server/` was added during the multi-user migration (Express + NeonDB).
- `graphify-out/` and `ruvector.db` (OpenCode tooling artifacts) are excluded from app concerns.
