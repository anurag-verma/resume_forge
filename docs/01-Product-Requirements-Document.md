# 01 — Product Requirements Document (PRD)
## Portfolio Website / Resume Builder

**Version:** 1.0
**Date:** July 2026
**Status:** Draft — Ready for Development

---

## 1. Product Overview

### 1.1 Product Name
**ResumeForge** (working title — free, client-side resume & portfolio builder)

### 1.2 Problem Statement
Job seekers and professionals need polished resumes and portfolio pages, but existing tools either charge subscription fees, lock exports behind paywalls, require account creation, or harvest personal data. There is no truly free, private, no-signup tool that produces professional output.

### 1.3 Solution
A 100% free, client-side web application where users build resumes through a live editor, choose from multiple templates, customize styling, and export to PDF — with all data stored locally in the browser. No accounts, no backend, no costs, no data leaves the device.

### 1.4 Target Users
- **Primary:** Students and early-career job seekers who need a first professional resume
- **Secondary:** Professionals updating resumes for a job switch
- **Tertiary:** Freelancers building a simple portfolio/personal page

---

## 2. Goals & Non-Goals

### 2.1 Goals
1. Let a user go from blank page to exported PDF resume in under 15 minutes
2. Zero cost to build, host, and operate (static hosting only)
3. Full privacy — no data ever sent to a server
4. Professional, ATS-friendly output
5. Work fully offline after first load (stretch goal: PWA)

### 2.2 Non-Goals (v1)
- No user accounts or authentication
- No cloud sync or collaboration
- No AI-powered content generation
- No payment features of any kind
- No mobile native app (responsive web only)
- No multi-language UI (English only in v1)

---

## 3. Core Features (v1)

### F1 — Resume Editor
- Form-based editing panel with collapsible sections
- Sections: Personal Info, Summary, Work Experience, Education, Skills, Projects, Certifications, Languages, Custom Section
- Add / remove / reorder sections (drag-and-drop)
- Add / remove / reorder entries within a section
- Rich-text-lite support in descriptions: bold, italic, bullet lists

### F2 — Live Preview
- Real-time preview pane that updates as the user types
- Accurate A4 page rendering with page-break indication
- Zoom controls (fit width / 100% / 75%)
- Mobile: toggle between Edit and Preview tabs

### F3 — Templates
- Minimum 3 templates at launch:
  1. **Classic** — single column, serif, traditional (most ATS-safe)
  2. **Modern** — two column, sans-serif, sidebar for skills/contact
  3. **Minimal** — single column, generous whitespace, thin rules
- Switching templates preserves all content

### F4 — Customization
- Accent color picker (curated palette + custom hex)
- Font pairing options (3–4 curated pairs)
- Font size scale (Small / Medium / Large)
- Line spacing control
- Section spacing control

### F5 — PDF Export
- One-click "Download PDF" producing an A4 PDF
- Text must be selectable (real text, not an image render)
- Filename auto-generated: `FirstName-LastName-Resume.pdf`

### F6 — Local Persistence
- Auto-save to browser localStorage on every change (debounced)
- "Your work is saved automatically" indicator
- Multiple resume support: create, duplicate, rename, delete resumes
- Import / Export resume data as JSON file (backup & transfer)

### F7 — Sample Data / Onboarding
- "Load example resume" button so new users see a filled template instantly
- Empty states with helpful hints in every section

---

## 4. Future Features (v2+, out of scope for initial build)
- Portfolio page mode (public single-page site generator)
- PWA / offline install
- Print stylesheet fine-tuning
- Cover letter builder
- More templates (target 8+)
- Dark mode for the editor UI

---

## 5. User Stories

| ID | As a… | I want to… | So that… | Priority |
|----|-------|-----------|----------|----------|
| US-01 | job seeker | fill in my details in a simple form | I don't fight with Word formatting | P0 |
| US-02 | job seeker | see my resume update live as I type | I know exactly what I'll get | P0 |
| US-03 | job seeker | download my resume as a PDF | I can submit it to job portals | P0 |
| US-04 | returning user | have my data still there when I come back | I don't lose my work | P0 |
| US-05 | job seeker | switch templates without losing content | I can try different looks | P0 |
| US-06 | job seeker | reorder my sections | I can highlight what matters most | P1 |
| US-07 | job seeker | change accent color and fonts | my resume feels personal | P1 |
| US-08 | user with two roles | keep multiple resume versions | I can target different jobs | P1 |
| US-09 | privacy-conscious user | export my data as a file | I control my own backup | P1 |
| US-10 | new user | load an example resume | I understand the tool in seconds | P2 |

---

## 6. Success Metrics
Since there is no backend/analytics in v1, success is defined qualitatively:
- A first-time user can produce a complete PDF in ≤ 15 minutes
- PDF output passes a standard ATS text-extraction check (text selectable, logical reading order)
- Lighthouse scores: Performance ≥ 90, Accessibility ≥ 95
- Total bundle size ≤ 500 KB gzipped (excluding fonts)
- Works in latest Chrome, Firefox, Safari, Edge

---

## 7. Constraints & Assumptions
- **Budget:** ₹0 / $0 — free tooling, libraries, and hosting only (MIT/Apache/OSS licenses)
- **Hosting:** Static hosting (Vercel / Netlify / GitHub Pages free tier)
- **No backend, no database, no APIs** — everything runs in the browser
- **Data limit:** localStorage ~5 MB is sufficient for text-based resume data
- Users are on modern evergreen browsers; no IE support

---

## 8. Release Plan
- **Milestone 1 (MVP):** F1 + F2 + F5 + F6 with one template — usable end-to-end
- **Milestone 2:** F3 (all 3 templates) + F4 customization
- **Milestone 3:** F7 onboarding, polish, accessibility pass, deploy publicly
