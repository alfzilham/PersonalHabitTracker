# Security Audit Report

## 1. Executive Summary

Audit ini dilakukan terhadap \`D:\\\\2026\\\\Workspace\\\\PersonalApps\\\\PersonalHabitTracker\` menggunakan review source-code dan konfigurasi lokal secara read-only. Tidak ada source, konfigurasi, database, dependency, atau data aplikasi yang diubah.

Postur keamanan keseluruhan: **perlu perbaikan sebelum dianggap production-ready**. Batas isolasi data server terlihat baik: seluruh operasi data memakai \`req.user.id\`, dan query database menggunakan parameterisasi. Namun, terdapat risiko tinggi pada rendering konten user-controlled dan alur OAuth/session.

Prioritas utama:

- **HIGH / Confirmed:** stored XSS melalui Markdown/rich-text yang dapat membaca \`localStorage\`, termasuk bearer session token.
- **HIGH / Confirmed + Potential:** token OAuth dikirim melalui query string; OAuth tidak memakai \`state\`, sehingga token leakage dan login-CSRF/account-linking risk perlu ditangani.
- **MEDIUM / Confirmed:** developer key disimpan plaintext, tidak ada rate limiting, dan respons memungkinkan enumerasi tertentu.
- **MEDIUM / Confirmed:** session tidak memiliki expiry/idle timeout yang terlihat di source.
- **MEDIUM / Potential:** endpoint sinkronisasi menerima feature/key/data arbitrer tanpa schema allowlist atau batas struktur per payload.

Tidak ditemukan bukti source-level SQL injection atau cross-user IDOR pada route data yang diaudit.

## 2. Project Overview

Implementasi aktual terdiri dari:

- Frontend SPA vanilla HTML/CSS/JavaScript dengan entry point \`index.html\`, \`login.html\`, \`onboarding.html\`, dan \`pages/course.html\`.
- Backend Node.js/Express pada \`server/server.js\`.
- NeonDB/PostgreSQL melalui \`@neondatabase/serverless\` pada \`server/database/db.js\`.
- Auth developer key dan Google OAuth.
- Bearer session token yang disimpan di browser \`localStorage\`.
- Data fitur disimpan sebagai JSON di \`app_data\`, dengan cache lokal di \`localStorage\`.
- Journal image memakai IndexedDB; certificate image memakai data URL/localStorage lalu dikirim sebagai JSON.

Dokumentasi umumnya cocok dengan source, tetapi ada perbedaan: \`docs/STRUCTURE.md\` menyebut path project lama, README menyebut jumlah tab yang berbeda dari dokumentasi terbaru, dan working tree berisi \`server/data.db-shm\`/\`server/data.db-wal\` walaupun source database yang digunakan adalah NeonDB. File database lokal tersebut tidak dipakai oleh source yang diaudit, tetapi keberadaannya perlu ditinjau dalam hygiene repository/deployment.

## 3. Audit Scope

Diaudit: filesystem tree, dokumentasi, frontend modules, Express middleware/routes, OAuth flow, database layer, storage/synchronization, Markdown/rich-text, image handling, import/export, static serving, CORS, headers, logging, dependency manifests, environment references, dan business logic multi-user.

## 4. Methodology

Metode yang digunakan:

1. Reconnaissance tree aktual dan perbandingan dokumentasi terhadap source.
2. Pemetaan request lifecycle: route → middleware → authenticated user → database query → response.
3. Pemetaan client lifecycle: login/OAuth → token storage → API sync → render → logout.
4. Review semua route dan sink keamanan (\`innerHTML\`, Markdown, FileReader, fetch, redirects, localStorage, SQL, Authorization).
5. Dependency/configuration review berdasarkan \`package.json\` dan \`package-lock.json\` lokal.
6. Tidak dilakukan runtime testing karena server startup memanggil schema initialization/database eksternal, sementara instruksi audit melarang modifikasi database dan dependency. Tidak dilakukan destructive testing.

## 5. Attack Surface

| Area | Permukaan serangan |
|---|---|
| Frontend | User input, imported JSON, \`innerHTML\`, Markdown/Quill, image/data URLs, localStorage/IndexedDB |
| Authentication | \`POST /api/login\`, developer keys, username handling |
| OAuth | \`/auth/google\`, \`/auth/google/callback\`, \`POST /api/login/google\` |
| Session | UUID bearer token, Authorization header, \`localStorage\`, \`/login?token=\` |
| API | \`/api/data\`, \`/api/data/:feature\`, \`/api/data/:feature/:key\`, \`/api/account\`, \`/api/logout\` |
| Database | app_users, app_data, app_sessions, tagged Neon SQL queries |
| Static server | \`express.static\`, clean URL fallback, blocked sensitive paths/dotfiles |
| Upload/storage | Certificate FileReader/canvas/data URL; Journal FileReader/canvas/IndexedDB; avatar handling |
| Dependencies | Express, CORS, dotenv, UUID, Neon serverless, CDN scripts |

## 6. Security Strengths

- **Server-side user binding:** \`requireAuth\` obtains identity from the session token; data queries use \`req.user.id\` rather than a client-supplied user ID.
- **Parameterized database operations:** Neon tagged-template queries parameterize values in \`server/database/db.js\`; no dynamic SQL identifier construction was found.
- **Cryptographically suitable token generation:** sessions use \`uuid.v4()\` from the \`uuid\` package, not \`Math.random()\`.
- **Basic auth boundary coverage:** data routes and account deletion use \`requireAuth\`; logout invalidates the presented token.
- **Sensitive path blocking:** blocking middleware is placed before static serving and checks dotfile path segments.
- **Partial output escaping:** \`escapeHtml\` is used in several course, todo, certificate metadata, and note-title contexts.
- **Client image rasterization attempt:** certificate and journal upload flows decode through \`Image\`/canvas and output WebP, reducing direct SVG payload persistence in the normal upload path.

## 7. Security Findings

### HIGH

#### WEB-001 — Stored XSS in Markdown/rich-text rendering exposes localStorage session token

**Severity:** HIGH  
**Confidence:** High  
**Status:** Confirmed  
**Category:** Client-side injection / stored XSS  
**Affected File:** \`assets/js/notes.js\`, \`assets/js/study.js\`, \`assets/js/dashboard-core.js\`  
**Affected Class/Function/Method:** \`renderNoteMarkdown\`, \`journalRingkasanToHtml\`, \`openJournalDetailLightbox\`, \`switchJournalToRich\`, \`renderMarkdown\`

**Evidence:** Notes call \`marked.parse(...)\` and assign the result to \`innerHTML\`. Journal Markdown similarly assigns \`marked.parse(...)\` to \`journal-detail-ringkasan.innerHTML\`. Rich journal content is inserted using Quill \`dangerouslyPasteHTML\` and later rendered into \`innerHTML\`. No sanitizer configuration was found.

**Root Cause:** user-controlled Markdown/rich HTML reaches HTML sinks without an explicit allowlist sanitizer. The app treats rendered content as trusted while allowing imported data to populate the same local state.

**Attack Scenario:** An authenticated user saves a note or journal containing an HTML element with an event handler or other active markup. When the content is rendered, the browser executes it. The script can read \`localStorage.session_token\` and send it to an attacker-controlled endpoint, after which the attacker can access that user’s API data.

**Impact:** Stored JavaScript execution, account/session theft, unauthorized read/write access to the victim’s data, and possible cross-user compromise through stolen bearer tokens.

**Recommended Remediation:** Sanitize Markdown output with a maintained sanitizer configured for a strict HTML allowlist, or render Markdown as text-only where formatting is unnecessary. Sanitize Quill output on input and output, validate links to allow only safe schemes (\`https\`/\`http\` as appropriate), and add a restrictive CSP as defense in depth. Treat imported content as untrusted.

**Regression Risk:** Medium. Existing formatting, links, and rich-text behavior may change; define and test an explicit supported markup policy before rollout.

**Verification Method:** Store harmless marker payloads in Notes, Journal Markdown, rich-text, and imported JSON; verify markup is rendered only as text or sanitized HTML. Confirm no script/event handler executes and verify the session token remains inaccessible to content under the deployed CSP.

#### WEB-002 — OAuth lacks state protection and delivers authentication token through URL

**Severity:** HIGH  
**Confidence:** High  
**Status:** Confirmed for token URL exposure; Potential for login-CSRF/account-linking impact  
**Category:** OAuth/session management  
**Affected File:** \`server/routes/oauth.js\`, \`assets/js/login.js\`, \`assets/js/onboarding.js\`  
**Affected Class/Function/Method:** \`GET /auth/google\`, \`GET /auth/google/callback\`, login \`tokenParam\` handling

**Evidence:** \`/auth/google\` creates an authorization request without a \`state\` parameter. The callback redirects existing users to \`/login?token=\` with a newly-created session token. \`login.js\` accepts any \`token\` query parameter, stores it in \`localStorage\`, and redirects to the dashboard. New-user \`googleId\`, email, and avatar are also transported through query parameters and accepted by \`POST /api/login/google\` without a server-side OAuth transaction binding.

**Root Cause:** OAuth transaction state is not bound to the initiating browser session, and the bearer credential is transported in a URL rather than exchanged server-side or stored in a protected cookie.

**Attack Scenario:** A token may leak through browser history, screenshots, referrer/logging infrastructure, or copied URLs. A URL containing a valid token can authenticate whoever receives it. Separately, absence of state allows unsolicited OAuth responses/login CSRF. The onboarding endpoint trusts identity fields supplied by the browser rather than a short-lived server-side OAuth transaction.

**Impact:** Session theft if the callback URL leaks; user confusion/login CSRF; potentially unsafe account linking depending on deployment and Google account identifiers.

**Recommended Remediation:** Generate and validate a cryptographically random, short-lived, single-use \`state\` tied to the initiating browser/session. Keep OAuth identity server-side after callback. Do not place bearer session tokens in query strings; use a secure one-time exchange or Secure/HttpOnly/SameSite cookie. Validate Google ID token/access-token issuer, audience, and verified email where relevant. Do not trust \`googleId\`, email, or avatar as standalone client assertions.

**Regression Risk:** High. Login and onboarding redirects change and require coordinated frontend/backend testing, including existing users, new users, retry, cancellation, and multi-tab OAuth flows.

**Verification Method:** Replay callback without state, reuse a state, reuse a one-time exchange, inspect history/referrer/log output, and verify no bearer token appears in URL. Test unsolicited OAuth responses and ensure the authenticated Google subject is derived only from Google’s validated response.

### MEDIUM

#### WEB-003 — Developer keys are plaintext bearer credentials with no rate limiting

**Severity:** MEDIUM  
**Confidence:** High  
**Status:** Confirmed  
**Category:** Authentication / abuse prevention  
**Affected File:** \`server/routes/auth.js\`, \`server/database/db.js\`, \`server/server.js\`  
**Affected Class/Function/Method:** \`POST /api/login\`, \`POST /api/login/google\`, \`findUserByKey\`, \`app_users.developer_key\`

**Evidence:** Developer keys are loaded from \`.env.local\`, compared directly, logged only as a count, and stored directly in \`app_users.developer_key\`. No rate limiter, lockout, or attempt throttling is configured. Responses distinguish invalid key, key already used, unknown username, and username/key mismatch.

**Root Cause:** A shared static secret functions as the primary credential without hashing, rotation/expiry, or abuse controls.

**Attack Scenario:** An attacker can make repeated login attempts against the finite key space or use leaked keys. Differential responses can help identify usernames/key usage. A database or environment disclosure would expose reusable credentials directly.

**Impact:** Account creation/login abuse and account compromise for users whose developer key is obtained; increased enumeration capability.

**Recommended Remediation:** Hash stored keys using a password/secret KDF, add rate limiting and monitoring, reduce response distinctions, support rotation/revocation, and treat keys as one-time enrollment secrets where that is the intended model. Avoid exposing key values in logs or diagnostics.

**Regression Risk:** Medium to high because existing enrollment and key reuse behavior must be migrated carefully.

**Verification Method:** Test repeated invalid attempts, response uniformity, key rotation/revocation, database compromise assumptions, and concurrent first-use attempts.

#### WEB-004 — Sessions have no visible expiration or idle timeout

**Severity:** MEDIUM  
**Confidence:** High  
**Status:** Confirmed  
**Category:** Session management  
**Affected File:** \`server/database/db.js\`, \`server/middleware/auth.js\`, \`assets/js/dashboard-core.js\`  
**Affected Class/Function/Method:** \`app_sessions\`, \`createSession\`, \`findSessionByToken\`, \`requireAuth\`, \`apiFetch\`

**Evidence:** \`app_sessions\` stores \`created_at\` but \`findSessionByToken\` checks only token equality and user join. No expiry comparison, cleanup, rotation, or idle timeout appears. The client stores the token persistently in \`localStorage\`.

**Root Cause:** Session validity is indefinite until explicit logout or account deletion, while the browser storage is persistent and script-readable.

**Attack Scenario:** A copied token remains usable for an unlimited period unless manually revoked. A stolen token from XSS, browser profile compromise, or URL leakage therefore has a long exploitation window.

**Impact:** Extended unauthorized access and accumulation of stale active sessions.

**Recommended Remediation:** Add absolute and idle expiry enforced server-side, revoke/rotate sessions, periodically clean expired records, and prefer a Secure/HttpOnly/SameSite cookie or short-lived access token with a safer refresh design. Maintain explicit logout and account-delete revocation.

**Regression Risk:** Medium. Offline fallback and persistent-login expectations will change; provide clear reauthentication behavior.

**Verification Method:** Test expired, idle, revoked, rotated, and concurrent session tokens against every authenticated route.

#### WEB-005 — Generic data API accepts arbitrary feature/key structures without schema enforcement

**Severity:** MEDIUM  
**Confidence:** High  
**Status:** Confirmed for arbitrary per-user storage; Potential for resource/data-integrity abuse  
**Category:** API input validation / business logic  
**Affected File:** \`server/routes/data.js\`, \`server/server.js\`  
**Affected Class/Function/Method:** \`POST /api/data\`, \`POST /api/data/:feature\`, \`DELETE /api/data/:feature/:key\`

**Evidence:** The handlers iterate \`Object.keys(req.body)\` and persist arbitrary feature/key/value combinations. \`:feature\` and \`:key\` are not allowlisted or type/length validated. The JSON parser accepts up to \`50mb\`; no per-user quota, record count limit, or rate limit is configured.

**Root Cause:** The backend relies on the frontend’s expected bucket shape and does not enforce a server-side schema.

**Attack Scenario:** An authenticated user submits oversized, deeply nested, unexpected, or unbounded data and repeatedly overwrites arbitrary keys within their own namespace. This can pollute synchronization state, consume database/storage resources, or create malformed records that later fail during \`JSON.parse\`.

**Impact:** Data corruption, storage abuse, synchronization inconsistency, and possible availability impact for the affected account/service.

**Recommended Remediation:** Allowlist features and keys, validate schemas and primitive limits, reject unknown properties, enforce per-user quotas and request limits, use transactions for full sync, and handle malformed stored JSON safely. Preserve user isolation in every query.

**Regression Risk:** Medium. Existing imported backups and future feature additions may rely on flexible keys; version schemas and migrate intentionally.

**Verification Method:** Submit unknown buckets, wrong types, oversized/deep JSON, duplicate keys, malformed stored records, and concurrent full-sync requests; verify rejection and atomic behavior.

#### WEB-006 — File handling relies on client-side decoding without explicit size/type limits

**Severity:** MEDIUM  
**Confidence:** Medium  
**Status:** Potential  
**Category:** File upload / resource handling  
**Affected File:** \`assets/js/certificate.js\`, \`assets/js/study.js\`, \`assets/js/settings.js\`  
**Affected Class/Function/Method:** \`handleCertImageUpload\`, \`handleStudyImageUpload\`, avatar upload handler

**Evidence:** Upload flows use \`FileReader\` and \`Image\`/canvas conversion, but source review did not find a consistent MIME, magic-byte, pixel-dimension, or input file-size limit. Certificate data URLs are stored in localStorage and synced as JSON. Journal images are placed in IndexedDB.

**Root Cause:** Validation is performed primarily by browser APIs and output conversion rather than a defined, enforced resource policy.

**Attack Scenario:** A user supplies very large, highly-dimensioned, malformed, or unsupported image input, causing expensive browser decoding/canvas allocation or local storage exhaustion. Normal rasterization reduces SVG script persistence, but the upload path is not a complete content validation boundary.

**Impact:** Client-side resource exhaustion, failed synchronization, data loss, or oversized API requests.

**Recommended Remediation:** Enforce input byte and pixel limits before decode, validate actual decoded image properties, reject unsupported MIME/content, cap stored data URL size, and enforce server-side request/storage quotas. Prefer object storage or bounded binary storage over large JSON data URLs.

**Regression Risk:** Medium; existing large certificates/images may no longer import.

**Verification Method:** Test boundary sizes, malformed image files, mismatched MIME/extensions, huge dimensions, SVG, and repeated uploads without allowing destructive persistence.

### LOW

#### WEB-007 — Permissive CORS and missing browser security headers

**Severity:** LOW  
**Confidence:** Medium  
**Status:** Confirmed for configuration; exploitability Needs Verification by deployment  
**Category:** HTTP security configuration  
**Affected File:** \`server/server.js\`  
**Affected Class/Function/Method:** \`app.use(cors())\`, server middleware setup

**Evidence:** CORS is enabled with default permissive origin behavior. No CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors, or explicit authenticated-response cache policy was found in Express configuration.

**Root Cause:** Browser security policy is delegated to deployment defaults that are not present in the project source.

**Attack Scenario:** If the API is deployed on a different origin and an authenticated client permits cross-origin requests, permissive CORS may widen the set of origins able to read responses. Missing CSP increases the impact of future injection defects; missing Referrer-Policy increases URL token leakage risk.

**Impact:** Defense-in-depth reduction and possible cross-origin data exposure depending on deployment origin/credentials behavior.

**Recommended Remediation:** Set an explicit production allowlist for CORS, add a CSP compatible with required CDNs, set security headers, and use an appropriate Referrer-Policy. Confirm HTTPS termination and HSTS at the deployment layer.

**Regression Risk:** Low to medium; CDN scripts and OAuth redirects must be included in the policy.

**Verification Method:** Test same-origin and approved/disallowed origins, browser preflight behavior, header presence, framing, referrer behavior, and CSP violations.

### INFORMATIONAL

#### WEB-008 — Documentation and repository hygiene discrepancies

**Severity:** INFORMATIONAL  
**Confidence:** High  
**Status:** Informational  
**Category:** Configuration/documentation  
**Affected File:** \`docs/STRUCTURE.md\`, \`README.md\`, repository tree
**Affected Class/Function/Method:** Documentation project-path references, repository artifact inventory, \`.gitignore\`

**Evidence:** \`STRUCTURE.md\` contains a stale project path. Documentation has inconsistent tab/database descriptions. The working tree contains local \`server/data.db-shm\` and \`server/data.db-wal\` artifacts, while source uses NeonDB. \`.env.local\` exists locally and is ignored by \`.gitignore\`; its values were not reproduced.

**Impact:** Engineers may audit, deploy, or protect the wrong paths; local database artifacts could contain sensitive data if accidentally distributed outside the intended environment.

**Recommended Remediation:** Reconcile documentation with source, confirm artifact ignore rules and repository history, and document the authoritative deployment/database model.

**Regression Risk:** Low.

**Verification Method:** Review tracked files, release artifacts, deployment bundle, and Git history using the organization’s approved secret-scanning process.

## 8. Risk Summary

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 1 |
| Informational | 1 |

The most material chain is **stored XSS → localStorage token theft → authenticated API access**. Server-side data isolation itself was not found to be broken in the reviewed routes.

## 9. Recommended Remediation

1. Remove unsanitized Markdown/rich HTML sinks and deploy a strict content policy/CSP.
2. Replace OAuth query-token delivery with a short-lived, single-use server-side exchange; add OAuth state and validate Google identity claims.
3. Add server-enforced session expiry, revocation, rotation, and safer browser storage.
4. Protect developer-key auth with hashing, throttling, generic errors, rotation, and monitoring.
5. Add schema allowlists, quotas, limits, and transactional handling to generic data APIs.
6. Add upload byte/pixel/content limits and bounded storage.
7. Add explicit CORS and HTTP security headers; reconcile documentation and release artifacts.

## 10. Verification Plan

After remediation, run positive and negative tests for every auth route, OAuth state/one-time exchange, expired/revoked sessions, cross-user data access, malformed/unknown data buckets, XSS payloads in every rendering mode, imported backups, file boundaries, CORS origins, and static-file traversal variants. Include regression tests for offline cache, logout/account switching, multi-tab OAuth, sync failures, and account deletion. Verify that logs, referrers, browser history, and response bodies do not expose tokens or secrets.

## 11. Audit Limitations

- No production host, reverse proxy, TLS termination, CDN policy, or deployment environment was available.
- No runtime requests were sent because starting the server initializes the configured database and the audit was constrained to read-only/no database modification.
- Google Cloud OAuth client configuration and actual redirect URI registration were unavailable.
- Database contents, secret values, and Git history were not reproduced in this report.
- Dependency vulnerability status was not asserted from memory or unverified external data; local manifests were reviewed, but no CVEs are claimed.
- Browser behavior of the deployed CDN versions, CSP, and actual response headers needs runtime verification.

## 12. Final Security Assessment

The project has a sound basic server-side ownership pattern and parameterized database access, so the reviewed data API does not show an obvious cross-user IDOR or SQL injection path. The application is nevertheless not ready for a strong multi-user production threat model until stored content is sanitized and OAuth/session handling is redesigned. The combination of active HTML rendering, persistent localStorage bearer tokens, indefinite sessions, and URL-delivered OAuth tokens creates a credible account-compromise path. Remediation should begin with WEB-001 and WEB-002, followed by session lifecycle and authentication-abuse controls.

## Remediation Update

The following source-level remediation changes were applied after the audit: sanitized Markdown/rich text and safer dynamic attributes/URLs; OAuth state cookie plus one-time server-side handoff; server-side seven-day session expiry and cleanup; scrypt hashing with legacy-key migration; in-memory login throttling; API feature/key allowlisting and value limits; security response headers; removal of permissive CORS; and safer client-side image URL handling. Runtime OAuth, database migration, deployment headers, and production secret rotation still require environment-specific verification.

Demo Mode was subsequently added with the public manual-login key `TRY DEM`. It uses a one-time handoff without creating an application user/session, keeps structured data in memory, bypasses cloud sync, and keeps journal images in memory. Reloading or closing the tab discards demo state.
