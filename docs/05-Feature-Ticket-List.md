# 05 — Feature Ticket List
## Portfolio Website / Resume Builder

**Version:** 1.0 · Tickets are ordered for sequential implementation. Each ticket is sized to be one focused Claude Code session or less.

**Legend:** P0 = must-have MVP · P1 = launch · P2 = polish
**Estimates:** S ≤ 1h · M = 1–3h · L = 3–6h

---

## Epic 0 — Project Setup

### RB-001 · Scaffold project ⚙️ P0 · S
Vite + React 18 + TypeScript + Tailwind CSS. ESLint + Prettier. Folder structure per Architecture doc §3. Vitest configured with one passing smoke test.
**AC:** `npm run dev` serves app; `npm run build` succeeds; `npm test` passes.

### RB-002 · Data model & types ⚙️ P0 · S
Implement all interfaces from Architecture doc §4 in `types/resume.ts` (Resume, PersonalInfo, Section union, entry types, Settings, AppData with schemaVersion).
**AC:** Types compile; sample object of each type type-checks; nanoid helper for IDs.

### RB-003 · Zustand stores with persistence ⚙️ P0 · M
`useResumeStore` (resumes CRUD, active resume, section/entry actions) + `useSettingsStore`. Persist middleware → localStorage, debounced 500 ms. schemaVersion migration scaffold. Corrupt-data recovery (try/catch, backup corrupt string).
**AC:** State survives refresh; corrupting stored JSON manually doesn't crash app; unit tests for reducers.

---

## Epic 1 — Editor

### RB-010 · App shell & layout 🖼 P0 · M
Toolbar + two-pane desktop layout (editor 40% / preview 60%), responsive breakpoints, mobile Edit/Preview tab bar. Design tokens from Frontend spec §1 as CSS variables + Tailwind config.
**AC:** Layout matches spec §2 at desktop/tablet/mobile widths.

### RB-011 · Personal Info form ✏️ P0 · S
Pinned first card: name, job title, email, phone, location, website, LinkedIn, GitHub. Controlled inputs wired to store.
**AC:** Typing updates store; fields validate email format (soft warning only).

### RB-012 · Section accordion framework ✏️ P0 · M
Section cards with header (title inline-edit, visibility toggle, collapse). "+ Add section" menu (each type addable once; custom section multiple). Remove section with confirm.
**AC:** Add/rename/hide/remove sections; state persists.

### RB-013 · Experience section form ✏️ P0 · M
Entry cards (collapsed summary row ↔ expanded form). Fields per Frontend spec §3.3 incl. month/year selects and "Currently working here". Add/duplicate/delete entries.
**AC:** Full CRUD on entries; dates render as "Apr 2023 – Present".

### RB-014 · Education, Projects, Certifications, Languages forms ✏️ P0 · M
Reuse entry-card pattern with per-type fields. Summary section = single textarea.
**AC:** All section types editable end-to-end.

### RB-015 · Skills tag input ✏️ P0 · S
Enter-to-add tags, × to remove, drag to reorder. Optional grouping toggle (P1 sub-task).
**AC:** Skills persist and render in preview.

### RB-016 · Markdown-lite descriptions ✏️ P1 · M
Textarea toolbar (B / I / bullet). Store constrained markdown; whitelist renderer emitting only `<strong> <em> <ul> <li> <br>`. Security per Security doc §4.1 — no raw HTML path.
**AC:** XSS attempt strings (`<script>`, `javascript:` links, `onerror=`) render inert as plain text; unit tests prove it.

### RB-017 · Drag-and-drop reordering ✏️ P1 · M
dnd-kit: reorder sections in editor and entries within sections. Keyboard sensor enabled.
**AC:** Mouse + keyboard reordering both work; order persists; preview reflects order.

---

## Epic 2 — Preview & Templates

### RB-020 · Preview pane with A4 page frame 🖼 P0 · M
Desk background, A4-ratio page, zoom controls (fit/75/100), multi-page stacking with break indicators.
**AC:** Long content flows to page 2 with visible boundary; zoom works.

### RB-021 · Classic template 🎨 P0 · M
Single-column template per Frontend spec §4. CSS variables for accent/fonts/spacing. `break-inside: avoid` on entries.
**AC:** Renders full sample resume correctly; headings never orphan at page bottom.

### RB-022 · Modern template 🎨 P1 · M
Two-column with sidebar (skills/contact/languages in sidebar).
**AC:** Same data renders correctly; lossless switching from Classic.

### RB-023 · Minimal template 🎨 P1 · M
Whitespace-forward single column per spec.
**AC:** Same as above.

### RB-024 · Template gallery & registry 🎨 P1 · S
Registry in `templates/index.ts`; gallery modal with live scaled thumbnails; ATS badge on Classic. React.lazy code-splitting per template.
**AC:** Switching templates keeps all content; only active template chunk loads.

### RB-025 · Customize panel 🎨 P1 · M
Side sheet: accent swatches + hex with contrast warning, font pairs, size S/M/L, line & section spacing sliders, reset link. Wire to Settings store → CSS variables.
**AC:** Every control visibly changes preview live; settings persist per resume.

---

## Epic 3 — Export & Data

### RB-030 · PDF export via print CSS 📄 P0 · L
`print.css` with `@page { size: A4; margin: 0 }`, hide app chrome, `window.print()` trigger. First-use tooltip ("choose Save as PDF"). Auto filename guidance.
**AC:** Exported PDF has selectable text; copy-paste from PDF preserves reading order; renders correctly from Chrome, Firefox, Edge, Safari.

### RB-031 · JSON export/backup 💾 P0 · S
Download AppData (or single resume) as `.json` with schemaVersion.
**AC:** File downloads; re-importable.

### RB-032 · JSON import with validation 💾 P0 · M
File picker → size limit 2 MB → schema validation (strip unknown keys, type-check all fields) → confirm merge/replace. Security doc §4.4 rules.
**AC:** Valid file imports; malformed/hostile files rejected with clear error; tests cover bad inputs.

### RB-033 · Multiple resumes manager 💾 P1 · M
Toolbar switcher: create, rename, duplicate, delete (confirm), per-resume settings.
**AC:** Two resumes with different templates coexist; switching is instant.

### RB-034 · Delete all data 💾 P1 · S
Settings action, typed-DELETE confirmation, clears localStorage, reloads to fresh state.
**AC:** Verified empty storage after action.

---

## Epic 4 — Onboarding & Polish

### RB-040 · Sample resume & empty states ✨ P2 · S
`sampleData.ts` realistic example; "Load example" on first visit; per-section hint copy from Frontend spec §3.9.
**AC:** One click fills a complete believable resume.

### RB-041 · Save status indicator ✨ P2 · S
"Saving… / Saved ✓ 12:04" chip; aria-live polite announcement.
**AC:** Chip reflects debounced persistence accurately.

### RB-042 · Accessibility pass ♿ P1 · M
Keyboard audit (modals focus-trap + Esc, accordion, dnd keyboard), focus rings, labels, contrast check incl. accent warning, reduced-motion support.
**AC:** Lighthouse a11y ≥ 95; full keyboard walkthrough documented.

### RB-043 · Performance pass ⚡ P2 · M
Self-host fonts WOFF2, code-split templates, bundle analysis, memoize preview rendering.
**AC:** ≤ 500 KB gzipped initial; Lighthouse performance ≥ 90.

### RB-044 · Security hardening & headers 🔒 P1 · S
CSP + security headers in hosting config per Security doc §4.2; `npm audit` clean; Dependabot on; verify zero network requests post-load.
**AC:** securityheaders.com grade A; Security doc §6 checklist fully ticked.

### RB-045 · Deploy 🚀 P0 · S
GitHub repo, Vercel/Netlify hookup, deploy from `main`, README with screenshots and privacy note.
**AC:** Public URL live; PRD success metrics spot-checked.

---

## Suggested Build Order (milestones)

| Milestone | Tickets | Outcome |
|-----------|---------|---------|
| **M1 — Usable MVP** | 001–003, 010–015, 020–021, 030–032, 045 | Type a resume → download a real PDF |
| **M2 — Full features** | 016–017, 022–025, 033–034 | Templates, customization, multi-resume |
| **M3 — Launch quality** | 040–044 | Onboarding, a11y, perf, security |

**Total: 24 tickets** · ~45–60 hours solo, dramatically less with Claude Code.
