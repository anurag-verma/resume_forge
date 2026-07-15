# 04 — Frontend Specification Document
## Portfolio Website / Resume Builder

**Version:** 1.0
**Date:** July 2026

---

## 1. Design Direction

The editor UI should feel like a **calm, precise drafting desk** — the resume is the star; the tool recedes. Think quiet stationery-shop craft, not flashy SaaS dashboard.

### 1.1 Design Tokens

**Editor UI palette** (distinct from resume templates, which have their own):
| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#1C2430` | Primary text, deep blue-black |
| `--paper` | `#FAFAF7` | App background, warm off-white |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--line` | `#E4E2DC` | Borders, dividers |
| `--muted` | `#6B7280` | Secondary text, hints |
| `--action` | `#2456A6` | Primary buttons, focus rings, links (ink-blue, like a fountain pen) |
| `--success` | `#2F7D4F` | Save indicator |
| `--danger` | `#B4402F` | Delete actions |

**Typography (editor UI):**
- Headings/UI: **Inter** (self-hosted WOFF2)
- Monospace accents (e.g., "saved 12:03"): **JetBrains Mono**
- Base size 14px in editor panel, 16px elsewhere; scale: 12/14/16/20/24

**Spacing:** 4px base grid. Panel padding 16–24px. Radius: 8px cards, 6px inputs. Shadows: subtle single-layer only (`0 1px 3px rgb(0 0 0 / 0.08)`).

**Signature element:** the live preview sits on a soft "desk" background with the A4 page casting a gentle paper shadow — reinforcing "you are crafting a real document."

---

## 2. Layout

### 2.1 Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────┐
│ TOOLBAR: Logo | Resume switcher ▾ | Template | Customize │
│                              | Import/Export | ⬇ PDF     │
├───────────────────────┬──────────────────────────────────┤
│  EDITOR PANEL (40%)   │   PREVIEW PANE (60%)             │
│  scrollable           │   ┌────────────────────┐         │
│  ┌─ Personal info ─┐  │   │                    │         │
│  ├─ ⠿ Summary ─────┤  │   │   A4 page render   │         │
│  ├─ ⠿ Experience ──┤  │   │   (live)           │         │
│  ├─ ⠿ Education ───┤  │   │                    │         │
│  ├─ ⠿ Skills ──────┤  │   └────────────────────┘         │
│  └─ + Add section ─┘  │   zoom: [fit] [75%] [100%]       │
└───────────────────────┴──────────────────────────────────┘
```

- Editor panel: min 380px, max 560px, resizable divider (nice-to-have)
- Preview pane: neutral "desk" background `#EDECE7`, page centered

### 2.2 Tablet (768–1023px)
Same two-pane layout; editor collapses to 45%; zoom defaults to fit-width.

### 2.3 Mobile (< 768px)
- Bottom tab bar: **✏️ Edit | 👁 Preview**
- Edit tab: full-width stacked forms
- Preview tab: pinch-zoomable page, floating "Download PDF" button
- Toolbar collapses into a hamburger sheet

---

## 3. Component Specifications

### 3.1 Toolbar
- Left: app name (text logo), resume switcher dropdown (list resumes, "+ New resume", rename, duplicate, delete)
- Right: Template picker (opens template gallery modal with thumbnails), Customize (opens side sheet), Import/Export menu, primary **Download PDF** button
- Save status chip: "Saved ✓" / "Saving…" with timestamp, using `--success`

### 3.2 Editor Panel
- Accordion of section cards; one open at a time (optional multi-open)
- Each section card header: drag handle (⠿), section title (inline-editable), visibility toggle (eye icon), collapse chevron
- **Personal Info** is pinned first, not draggable
- "+ Add section" button at bottom → menu of available section types (custom section can be added multiple times)

### 3.3 Section Entry Cards (Experience, Education, Projects…)
- Each entry is a mini-card: summary row (role @ company, dates) that expands to the full form
- Entry actions: drag to reorder, duplicate, delete (with confirm)
- Fields per Experience entry: Role, Company, Location, Start date (month/year picker), End date or "Currently working here" checkbox, Description (markdown-lite textarea with B / I / • toolbar)
- Date inputs: two selects (Month, Year) — avoids locale/format bugs

### 3.4 Skills Section
- Tag-style input: type + Enter to add, click × to remove, drag to reorder
- Optional grouping: "Group skills" toggle → named groups (e.g., Languages / Tools)

### 3.5 Customize Side Sheet
- Accent color: 8 curated swatches + custom hex input with contrast warning if accent-on-white < 3:1
- Font pair: radio cards showing live sample ("Aa — Heading / body")
- Font size: segmented control S / M / L
- Line spacing & section spacing: sliders with live preview
- "Reset to template defaults" link

### 3.6 Preview Pane
- Renders `ResumeDocument` inside an A4-ratio page frame (210:297)
- Multi-page: stacked pages with page numbers; dashed line indicator where page breaks fall
- Zoom controls bottom-right; Ctrl/Cmd+scroll zoom support

### 3.7 Template Gallery Modal
- Grid of template cards: live-rendered thumbnail (scaled-down actual component, not a static image), name, "ATS-friendly" badge on Classic
- Selecting applies instantly; content is never lost

### 3.8 Modals & Confirmations
- Delete resume / delete section / delete all data: confirmation dialogs; destructive button uses `--danger`
- "Delete all my data" requires typing DELETE

### 3.9 Empty States
- New resume: friendly illustration-free prompt: "Start with your name above, or **Load an example** to see how it works."
- Empty section: one-line hint specific to the section ("Add your most recent role first — recruiters read top-down.")

---

## 4. Resume Template Specs (the output document)

Shared rules for all templates:
- A4 (210 × 297 mm), safe margins ≥ 12 mm
- Real text only (no rasterization); heading hierarchy h1 (name) → h2 (sections) → h3 (entries)
- `break-inside: avoid` on entries; section headings never orphaned at page bottom
- All colors/fonts driven by CSS variables from Settings

| | Classic | Modern | Minimal |
|--|---------|--------|---------|
| Layout | Single column | Two column (68/32, sidebar right) | Single column, wide margins |
| Fonts | Source Serif 4 / Source Sans 3 | Inter throughout | Spectral headings / Inter body |
| Accent use | Name + thin rules | Sidebar background tint + heading color | Accent only on name underline |
| Vibe | Traditional, ATS-safest | Contemporary tech | Elegant whitespace |

---

## 5. Interaction & Motion
- Live preview updates: debounced ~300 ms; content changes fade nothing — instant text update, no flicker
- Accordion expand/collapse: 150 ms ease-out height transition
- Drag-and-drop: lifted card gets shadow + 2° tilt; drop animates into place (dnd-kit defaults)
- Respect `prefers-reduced-motion`: disable all non-essential transitions
- No confetti, no gratuitous animation — the tool stays calm

---

## 6. Accessibility (WCAG 2.1 AA)
- Full keyboard operability: accordion, drag-reorder (dnd-kit keyboard sensor: space to lift, arrows to move), modals with focus trap + Esc
- Visible focus rings (`--action`, 2px) on all interactive elements
- Labels tied to every input; error text via `aria-describedby`
- Color contrast ≥ 4.5:1 for editor text; contrast checker warning for user-chosen accent colors
- Live region announces "Saved" politely
- Preview pane has an accessible text alternative note ("Preview of your resume; content matches the editor")

---

## 7. States & Edge Cases
- **First visit:** empty resume auto-created; sample-data offer shown once
- **Storage quota exceeded:** toast with "Export a backup" action
- **Corrupt saved data:** recover silently to fresh state, keep corrupt backup, show non-blocking notice
- **Very long content:** preview grows to page 2/3 gracefully; no hard limits
- **Print dialog cancelled:** no error, no state change
- **Offline:** app continues to work fully after first load (all assets self-hosted)
