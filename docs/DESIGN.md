# DESIGN.md — Personal Habit Tracker

## Design Philosophy

Anthropic's earthy design language — warm, minimal, trustworthy. Clean layouts, generous whitespace, soft natural tones. No gradients, no heavy shadows. Supports light and dark mode via the `[data-theme="dark"]` attribute.

---

## Color Palette (light mode)

```css
/* Backgrounds */
--color-bg: #f5f0e8; /* warm cream — main background */
--color-bg-card: #ede8dc; /* slightly darker cream — cards */
--color-bg-sidebar: #e8e0d0; /* sidebar/panel background */

/* Text */
--color-text-primary: #1a1915; /* near-black — headings */
--color-text-secondary: #4a4740; /* dark brown-gray — body */
--color-text-muted: #8a8478; /* muted — captions */

/* Accents */
--color-sage: #6b7f5e; /* sage green — primary accent */
--color-sage-light: #8fa882; /* light sage — hover states */
--color-sage-bg: #dce8d4; /* sage tint — badges */

--color-blue: #5b7a9e; /* dusty blue — secondary accent */
--color-blue-light: #7a9abe; /* light blue — hover */
--color-blue-bg: #d4e0ec; /* blue tint — info badges */

/* Status */
--color-danger: #c85050; /* danger / delete actions */
```

---

## Typography

```css
--font-sans: "Anthropic Sans", sans-serif; /* body, UI */
--font-serif: "Anthropic Serif", serif; /* headings */
--font-mono: "Anthropic Mono", monospace; /* code */

--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
```

---

## Spacing Scale

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-10: 2.5rem;
--space-12: 3rem;
--space-16: 4rem;
```

---

## components.css — Section Map (37 sections)

| #     | Section             | Covers                              |
| ----- | ------------------- | ----------------------------------- |
| 1     | Badges              | Level, Required/Optional status     |
| 2     | Cards               | Base card, takeaway card, stat card |
| 3     | Buttons             | Primary, Secondary, Ghost, Back     |
| 4     | Sidebar Tabs        | Left panel navigation               |
| 5     | Table               | Dashboard table + striped rows      |
| 6     | Checkbox            | Custom sage-green checkbox          |
| 7     | Progress Bar        | Analytics + per-tab progress        |
| 8     | Chart Containers    | Chart.js canvas wrappers            |
| 9     | Course Notes        | Content styling in course.html      |
| 10    | Filter Bar          | Search + filter controls            |
| 11    | Custom Dropdown     | Replaces native `<select>`          |
| 12    | Skeleton Loader     | Table loading shimmer               |
| 13    | Divider / Tooltip   | Separators, CSS tooltip             |
| 14    | Certificate Gallery | Cert cards + dropdown               |
| 15    | Modal               | Base modal + file drop zone         |
| 16    | File Drop Zone      | Drag & drop image upload            |
| 17    | View Dropdown       | Custom view-mode selector           |
| 18–21 | Course table extras | Group headers, charts, dropdown     |
| 22    | Study Tab           | Sub-tabs, masonry grid              |
| 23–27 | To-do section       | Items, priorities, charts           |
| 28    | Sidebar Profile     | User info at sidebar bottom         |
| 29–30 | Settings            | Modal layout, avatar, FAQ           |
| 31    | Finance Inputs      | Currency select, spinner hide       |
| 32    | Login Page          | Login card, form, error             |
| 33    | Danger Card         | Settings danger zone                |
| 34    | Key Input           | Masked slot input (legacy)          |
| 35    | Course Editor       | Markdown editor styles              |
| 36    | Login Split         | Split page layout                   |
| 37    | Onboarding          | Dusty blue, 3-step flow             |

### Newer sections (beyond the 37 above)

- **Notes (Google Keep)** — `.notes-composer` (composer inline expand), `.note-card--{yellow,green,blue,pink,purple,gray}` kartu warna masonry, `.notes-color-swatch` palette, `.note-card--archived` muted, `.notes-empty`.
- **Archived sub-tabs** — segmented `.btn-group` (Courses / Study / Notes) dengan 3 kontainer.
- **Finance mode tabs** — `.btn-group` Pemasukan/Pengeluaran; record punya field `type`.
- **Course editor** — `.editor-mode-toggle`, `.editor-header__actions`, `#rich-editor-wrap`, `#md-editor` + `#md-preview`, view-bar (`#view-bar`) dengan tombol **zoom** (`--pb-zoom`) & Edit, `.md-preview`/`.lightbox__content.md-preview` (preview scroll halaman tanpa scrollbar dalam).
- **Journal editor** — Quill toolbar + toggle Rich Text/Markdown di modal, lightbox detail.

---

## CDN Links

> **Font Anthropic sekarang di-self-host lokal** (`assets/fonts/` + `assets/css/fonts.css`).
> Alasan: CSS CDN `cdn.jsdelivr.net/gh/devchauhann/fonts@v1.1.0/...` menulis URL font dengan cabang `@main` yang sudah 404 (repo pihak ketiga tidak lagi tersedia). File font di tag `@v1.1.0` masih valid dan telah diunduh ke repo. Lihat komentar di `assets/css/fonts.css`.

```html
<!-- Fonts (self-hosted lokal) -->
<link rel="stylesheet" href="assets/css/fonts.css" />

<!-- Lucide Icons -->
<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
```

---

## Dark Mode

Toggled via `[data-theme="dark"]`. Background/text/accent tokens are re-mapped in `global.css` override block.
