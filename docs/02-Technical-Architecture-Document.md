# 02 — Technical Architecture Document
## Portfolio Website / Resume Builder

**Version:** 1.0
**Date:** July 2026

---

## 1. Architecture Overview

**Pattern:** 100% client-side Single Page Application (SPA). No backend, no database, no server-side code. The entire application is static files served from a CDN.

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  Editor    │→│  App State │→│ Live Preview │  │
│  │  (Forms)   │  │  (Zustand) │  │ (Template)  │  │
│  └───────────┘  └─────┬─────┘  └──────┬──────┘  │
│                       │                │         │
│                 ┌─────▼─────┐   ┌─────▼──────┐  │
│                 │localStorage│   │ PDF Export │  │
│                 │ (persist)  │   │ (client)   │  │
│                 └───────────┘   └────────────┘  │
└─────────────────────────────────────────────────┘
                        ▲
              Static hosting (Vercel/Netlify/GH Pages)
```

---

## 2. Technology Stack (all free & open source)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **React 18 + Vite** | Fast dev server, tiny builds, huge ecosystem, free |
| Language | **TypeScript** | Type safety for the resume data model; catches bugs early |
| Styling | **Tailwind CSS** | Rapid UI development, small purged output |
| State management | **Zustand** (+ `persist` middleware) | Minimal boilerplate, built-in localStorage persistence |
| Drag & drop | **@dnd-kit/core + @dnd-kit/sortable** | Modern, accessible, actively maintained (react-beautiful-dnd is deprecated) |
| PDF export | **Browser print-to-PDF via `window.print()` + print CSS** (primary) with **react-to-print** helper | Produces real selectable text, perfect fonts, zero cost; avoids blurry canvas renders |
| Rich-text-lite | **Custom contentEditable wrapper** or plain textarea + markdown-lite (bold/italic/bullets) | Keep bundle small; avoid heavy editors |
| Icons | **lucide-react** | Free, tree-shakeable |
| ID generation | **nanoid** | Tiny, collision-safe IDs for sections/entries |
| Testing | **Vitest + React Testing Library** | Free, fast, Vite-native |
| Linting | **ESLint + Prettier** | Code quality |
| Hosting | **Vercel / Netlify / GitHub Pages** | Free static hosting with CI |

> **PDF decision note:** `html2canvas + jsPDF` renders the resume as an image → text is NOT selectable → fails ATS parsing. Use print CSS (`@media print`, `@page { size: A4; margin: 0 }`) so "Download PDF" opens the browser print dialog with a pixel-perfect, text-based PDF. This is the approach used by several successful open-source resume builders.

---

## 3. Project Structure

```
resume-builder/
├── public/
│   └── fonts/                  # self-hosted fonts (offline-friendly)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   └── resume.ts           # Resume data model (single source of truth)
│   ├── store/
│   │   ├── useResumeStore.ts   # resume content state + persistence
│   │   └── useSettingsStore.ts # template, colors, fonts, spacing
│   ├── components/
│   │   ├── editor/             # left panel — all form components
│   │   │   ├── EditorPanel.tsx
│   │   │   ├── SectionList.tsx        # drag-and-drop section order
│   │   │   ├── sections/
│   │   │   │   ├── PersonalInfoForm.tsx
│   │   │   │   ├── SummaryForm.tsx
│   │   │   │   ├── ExperienceForm.tsx
│   │   │   │   ├── EducationForm.tsx
│   │   │   │   ├── SkillsForm.tsx
│   │   │   │   ├── ProjectsForm.tsx
│   │   │   │   ├── CertificationsForm.tsx
│   │   │   │   ├── LanguagesForm.tsx
│   │   │   │   └── CustomSectionForm.tsx
│   │   │   └── shared/         # EntryCard, AddButton, DateRangeInput…
│   │   ├── preview/
│   │   │   ├── PreviewPane.tsx # zoom, page frame
│   │   │   └── ResumeDocument.tsx  # renders active template
│   │   ├── templates/
│   │   │   ├── index.ts        # template registry
│   │   │   ├── ClassicTemplate.tsx
│   │   │   ├── ModernTemplate.tsx
│   │   │   └── MinimalTemplate.tsx
│   │   ├── toolbar/
│   │   │   ├── Toolbar.tsx     # template picker, customize, export
│   │   │   ├── CustomizePanel.tsx
│   │   │   └── ResumeManager.tsx  # multiple resumes CRUD
│   │   └── ui/                 # Button, Input, Modal, ColorPicker…
│   ├── lib/
│   │   ├── pdf.ts              # print/export logic
│   │   ├── storage.ts          # import/export JSON, versioned schema
│   │   └── sampleData.ts       # example resume
│   └── styles/
│       ├── index.css
│       └── print.css           # @page rules, print-only styles
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Data Model

```typescript
// types/resume.ts

export interface Resume {
  id: string;
  name: string;              // "Software Engineer Resume"
  updatedAt: string;         // ISO date
  personalInfo: PersonalInfo;
  sections: Section[];       // ordered array = section order
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export type SectionType =
  | 'summary' | 'experience' | 'education' | 'skills'
  | 'projects' | 'certifications' | 'languages' | 'custom';

export interface Section {
  id: string;
  type: SectionType;
  title: string;             // user-editable heading
  visible: boolean;
  entries: Entry[];
}

// Entry is a discriminated union per section type, e.g.:
export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;         // "2023-04"
  endDate: string | null;    // null = Present
  description: string;       // markdown-lite
}

export interface Settings {
  templateId: 'classic' | 'modern' | 'minimal';
  accentColor: string;       // hex
  fontPairId: string;
  fontScale: 'sm' | 'md' | 'lg';
  lineSpacing: number;       // 1.0–1.6
  sectionSpacing: number;
}

export interface AppData {
  schemaVersion: number;     // for future migrations
  resumes: Resume[];
  activeResumeId: string;
  settings: Record<string, Settings>;  // per-resume settings
}
```

---

## 5. Key Technical Decisions

### 5.1 State & Persistence
- Zustand store with `persist` middleware → localStorage key `resume-builder-data`
- Writes debounced at ~500 ms to avoid excessive serialization
- `schemaVersion` field + migration function so future updates never corrupt old data
- Storage quota guard: catch `QuotaExceededError`, show a friendly warning

### 5.2 Template System
- Each template is a pure React component receiving `{ resume, settings }`
- Templates share a registry (`templates/index.ts`) with metadata (name, thumbnail)
- All templates consume the SAME data model → switching is lossless
- Templates use CSS variables (`--accent`, `--font-body`, `--font-heading`, `--line-height`) driven by Settings

### 5.3 PDF Export Flow
1. User clicks "Download PDF"
2. App applies `print.css`: hides editor UI, sets `@page { size: A4; margin: 0 }`
3. `window.print()` opens native dialog → user saves as PDF
4. Result: vector text, correct fonts, selectable, ATS-parsable
5. Show a one-time tooltip: "Choose 'Save as PDF' as the destination"

### 5.4 Performance Budget
- Code-split templates (React.lazy) — only active template loads
- Self-host 2–3 font families as WOFF2, `font-display: swap`
- Target: First load ≤ 500 KB gzipped, TTI < 2 s on mid-range mobile

### 5.5 Browser Support
Evergreen Chrome, Edge, Firefox, Safari (last 2 versions). No polyfills for legacy browsers.

---

## 6. Build & Deployment Pipeline (free)

```
git push → GitHub (free)
        → Vercel/Netlify auto-build (free tier)
        → `vite build` → static /dist
        → Deploy to global CDN
        → Optional: GitHub Actions runs lint + tests on PR (free for public repos)
```

- No environment variables or secrets needed (no APIs)
- Custom domain optional; free `*.vercel.app` / `*.netlify.app` subdomain works

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| localStorage cleared by user/browser | Data loss | Prominent JSON export/backup feature; auto-save indicator |
| Print dialog UX confuses users | Failed exports | One-time guided tooltip; docs link |
| Multi-page resumes break layout | Bad PDFs | Page-break CSS (`break-inside: avoid` on entries); page indicator in preview |
| localStorage 5 MB limit | Save failure | Text-only data (~50 KB typical); quota error handling |
| Template CSS conflicts | Visual bugs | Scope each template under a root class; CSS variables only |
