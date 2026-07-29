# CONTEXT.md — Personal Habit Tracker

## Who is Alfiz?

- Computer Engineering (Teknik Komputer) student at Universitas Syiah Kuala (USK), Aceh Besar
- Co-founder of althentic.dev, positioning as Software & AI Engineer
- Frontend-first, vanilla HTML/CSS/JS specialist — no frameworks, ever
- Prefers clean, readable, well-commented code and concise, copy-paste-ready output

---

## Project Goal

A single personal dashboard as a productivity hub with 8 tabs:

1. **Courses** — Certification course tracking (user-added)
2. **Analytics** — Charts and progress (Courses, Study, To-do, Finance)
3. **Certificate** — Gallery of earned certificates
4. **Study** — Weekly university class schedule (user-added)
5. **Journal** — Masonry-grid log of study notes
6. **To-do** — Task list with priority and due-date
7. **Finance** — Weekly expense tracker
8. **Archived** — Archived courses

---

## Key Architecture Decisions

| Decision                | Reason                                |
| ----------------------- | ------------------------------------- |
| **Vanilla JS**          | No frameworks, ever                   |
| **NeonDB (PostgreSQL)** | True multi-user, cloud persistence    |
| **Express backend**     | Same JS ecosystem, simple REST API    |
| **Developer key login** | Offline-first auth, no email/password |
| **localStorage cache**  | Offline fallback + fast reads         |
| **Sync on tab switch**  | Periodic save without blocking UX     |

---

## Workflow Rules

### When Alfiz says "fix bug":

1. Analysis first, fix second
2. Don't break existing features
3. Update relevant docs

### When Alfiz says "new feature":

1. Plan first (read docs, understand scope)
2. Implement
3. Update docs if API/architecture changes

---

## What Claude Must Never Do

- Use any CSS framework (no Tailwind, Bootstrap)
- Use any JS framework (no React, Vue, Alpine)
- Use inline styles (put everything in CSS files)
- Break the file naming convention
- Forget font + icon CDN links

---

## Course Data — Current State

**Courses are user-generated.** No default courses. Reference data (80 courses) is backed up at `docs/news/COURSES_REFERENCE.md` for manual re-entry.

**Study subjects are user-generated.** Reference 11 MK backed up at `docs/news/STUDY_REFERENCE.md`.

---

## Developer Keys

10 keys defined in `server/.env.local`. Each key:

- Format: `XXX XXX` (3 uppercase + space + 3 uppercase)
- Can only be used by ONE user (key uniqueness enforced)
- Example: `FHG DIA`, `QWE RTY`, `LKJ HGF`
