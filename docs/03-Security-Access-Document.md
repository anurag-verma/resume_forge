# 03 — Security & Access Document
## Portfolio Website / Resume Builder

**Version:** 1.0
**Date:** July 2026

---

## 1. Security Model Summary

This application has a deliberately minimal attack surface: **no backend, no accounts, no data transmission**. All personal data (names, contact info, work history) stays in the user's browser. Security work therefore focuses on client-side data safety, supply-chain hygiene, and safe rendering.

**Threat model in one line:** protect the user's personal data from XSS, malicious dependencies, and accidental leakage — there is no server to attack.

---

## 2. Access Control

| Area | Policy |
|------|--------|
| User authentication | **None by design.** No accounts, no login. Access = physical access to the browser profile. |
| Authorization | Not applicable — single-user, local-only data. |
| Admin access | Not applicable — no admin surface exists. |
| Repository access | GitHub repo: owner has admin; branch protection on `main`; all changes via PR. |
| Deployment access | Vercel/Netlify project linked to GitHub — deploys only from `main`. 2FA enabled on GitHub and hosting accounts. |

### Shared-computer consideration
Because data lives in localStorage, anyone using the same browser profile can view it. Mitigation:
- Display a subtle notice in Settings: "Your data is stored in this browser. On a shared computer, use the Export feature and clear data when done."
- Provide a one-click **"Delete all my data"** button (clears localStorage completely).

---

## 3. Data Privacy

### 3.1 What data exists
- Resume content: name, email, phone, location, employment history, education
- App settings: template/style preferences

### 3.2 Where it lives
- **Only** in browser localStorage on the user's device
- Optionally in a JSON file the user explicitly exports to their own disk

### 3.3 What is transmitted
- **Nothing.** No analytics, no telemetry, no error reporting services, no third-party scripts, no cookies in v1.
- The app makes zero network requests after initial page load (fonts and assets are self-hosted).

### 3.4 Compliance posture
- GDPR/CCPA: no personal data is collected or processed by the operator → minimal obligations; still publish a short plain-language privacy note ("Your data never leaves your device").
- No cookie banner needed (no cookies, no tracking).

---

## 4. Client-Side Security Requirements

### 4.1 XSS Prevention (highest priority)
Resume fields are user-controlled text rendered into templates and exported to PDF.
- **Never** use `dangerouslySetInnerHTML` with raw user input.
- Rich-text-lite (bold/italic/bullets): store as a constrained format (markdown-lite), render through a whitelist parser that only emits `<strong>`, `<em>`, `<ul>`, `<li>`, `<br>`. No links with `javascript:` URIs, no attributes.
- If any HTML rendering is unavoidable, sanitize with **DOMPurify** (free, OSS) using a strict allowlist.
- JSON import: validate against the schema (type-check every field, strip unknown keys) before loading into state. Treat imported files as untrusted input.

### 4.2 Content Security Policy
Serve with a strict CSP header (configured in `vercel.json` / `netlify.toml`):
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';   # Tailwind inline styles
  img-src 'self' data:;
  font-src 'self';
  connect-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'none';
```
Also set: `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

### 4.3 Supply-Chain Security
- Keep dependencies minimal (each dependency is attack surface)
- Commit `package-lock.json`; use exact versions
- Enable **GitHub Dependabot** alerts + `npm audit` in CI (both free)
- Review any new dependency: weekly downloads, maintenance status, license (MIT/Apache/BSD only)
- No CDN-loaded scripts — everything bundled and self-hosted

### 4.4 Safe File Handling
- JSON import: limit file size (e.g., 2 MB), parse inside try/catch, validate schema, never `eval`
- Exported filenames sanitized (strip path separators and control characters)

---

## 5. Data Integrity & Recovery

| Concern | Control |
|---------|---------|
| Corrupted localStorage | Wrap reads in try/catch; on parse failure, back up the raw string to a `-corrupt` key and start fresh rather than crashing |
| Schema changes across versions | `schemaVersion` + forward migrations; never destructive |
| Accidental deletion | Confirmation dialog on resume delete; "Delete all data" requires typed confirmation |
| Browser data loss | Encourage JSON backup export; show "last saved" timestamp |

---

## 6. Security Checklist (Definition of Done)

- [ ] No `dangerouslySetInnerHTML` with unsanitized input anywhere in the codebase
- [ ] Markdown-lite renderer emits only whitelisted tags
- [ ] JSON import fully schema-validated
- [ ] CSP + security headers configured and verified (securityheaders.com scan = A)
- [ ] `npm audit` clean (no high/critical) at release
- [ ] Dependabot enabled
- [ ] "Delete all my data" works and is verified to clear storage
- [ ] Privacy note page published
- [ ] 2FA on GitHub + hosting accounts
- [ ] No network requests after page load (verified in DevTools Network tab)
