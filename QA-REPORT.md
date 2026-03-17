# QA Overnight Audit Report — key.card

**Date:** 2026-03-17 03:30 EDT  
**Target:** https://keycard-preview.surge.sh  
**Agent:** Centauri QA (Playwright + visual analysis)  
**Tests Run:** 12 (8 initial + 4 deep)

---

## Summary

| Category | Status |
|----------|--------|
| Landing page renders | ✅ Pass |
| Card page renders | ⚠️ Works but 404 HTTP status (SPA routing issue) |
| QR overlay | ✅ Pass |
| Auth modal | ✅ Pass |
| Mobile layout | ✅ Pass (no horizontal overflow) |
| JS errors | ✅ None |
| Network failures | ✅ None (except expected 404 on card route) |
| Broken images | ✅ None |
| Console errors | ⚠️ 1 (404 resource on card page) |

---

## What Works ✅

1. **Landing page** — Renders fully with hero, "How it works", features grid, comparison table, final CTA, footer. All sections appear after scroll triggers IntersectionObserver animations.
2. **Card page** — Derek Ross profile loads correctly from Nostr relays. Shows avatar, banner, name, NIP-05, about, social links, zap button.
3. **QR Code overlay** — Opens properly via Dialog (desktop) / Sheet (mobile). Shows styled QR code with Classic/Nostr/Branded tabs, download, copy link, wallet pass options.
4. **Auth modal** — "Create your card" opens identity creation flow. Shows key explanation, "Generate My Identity" button.
5. **Mobile viewport (375×812)** — No horizontal overflow. Layout responsive. Card stacks below hero text on mobile.
6. **Zero JS errors** — No `pageerror` events on any page.
7. **Zero broken images** — All images load properly.
8. **IntersectionObserver animations** — FadeInSection components work correctly to reveal content on scroll.

---

## What's Broken / Fixed ❌→✅

### Fixed in this commit:

1. **❌→✅ Duplicate `useState` import** in `src/pages/Index.tsx` (lines 12-13)
   - Had `import { useEffect, useRef, useState } from 'react';` AND `import { useState } from 'react';`
   - Build succeeded due to tree-shaking but it's a code quality issue
   - **Fixed:** Removed duplicate import

2. **❌→✅ "Sign In" hidden on mobile** — Header used `hidden sm:inline-flex` class on Sign In button
   - Mobile users had no way to sign in (only "Create your card" visible)
   - **Fixed:** Removed `hidden sm:inline-flex`, Sign In now visible on all viewports

3. **❌→✅ Surge SPA routing returns 404** — Card page URLs like `/npub1...` returned HTTP 404
   - Surge serves `404.html` with 404 status code. React Router handled it client-side but HTTP status was wrong.
   - Surge uses `200.html` for proper SPA fallback (serves with 200 status on any route).
   - **Fixed:** Build script now generates `200.html` alongside `404.html`

---

## Known Issues (Not Fixed — Need Design/Architecture Discussion)

### Priority 1 (High)

4. **⚠️ Landing page sections invisible until scrolled** — The FadeInSection components start at `opacity-0 translate-y-8` and only become visible when IntersectionObserver triggers. This means:
   - Full-page screenshots show massive empty space
   - Users on very tall viewports may not realize there's more content
   - **Recommendation:** Consider adding a scroll hint or reducing the opacity-0 initial state for above-the-fold sections

5. **⚠️ Console error on card page** — `Failed to load resource: the server responded with a status of 404 (Not Found)` — likely the wallet API endpoints (`/api/wallet/apple`, `/api/wallet/google`) returning 404 on static hosting
   - **Recommendation:** Add graceful error handling or conditionally hide wallet buttons when API is unavailable

### Priority 2 (Medium)

6. **Auth modal back arrow on first step** — The "Create New Identity" modal shows a `←` back arrow even when it's the first step. Confusing UX — back to where?

7. **Demo card vs live card data mismatch** — Hero demo card shows `derek@nostrplebs.com` but the actual profile shows `derekross@grownostr.org`. Should pull live data or explicitly label as "example".

8. **Low contrast text** — Several subtitle/description elements use `text-slate-400` and `text-slate-500` on dark backgrounds. May not meet WCAG AA 4.5:1 contrast ratio.

9. **No navigation on card page** — Profile pages have no header/nav. Only way to reach home is the tiny "Powered by key.card" footer link.

### Priority 3 (Low)

10. **Footer text very small** — `text-xs text-slate-500` in footer is barely readable.

11. **Card preview emoji icons** — The demo card uses emoji (📞💬✉️💜) for action icons which may render inconsistently across platforms. SVG icons would be more reliable.

12. **Comparison table on mobile** — Table is cramped on 375px viewport. Could benefit from a mobile-friendly layout (stacked cards instead of table).

---

## Screenshots

All saved to `/tmp/screenshots/`:

| File | Description |
|------|-------------|
| `01-landing-page.png` | Desktop landing page (1280×720) — full page |
| `03-qr-overlay.png` | QR code overlay on card page |
| `04-auth-modal.png` | Auth/identity creation modal |
| `05-mobile-landing.png` | Mobile landing page (375×812) |
| `06-mobile-card.png` | Mobile card page (375×812) |
| `07-landing-after-scroll.png` | Landing page after scroll reveals all sections |
| `08-card-page-content.png` | Card page full content |
| `09-qr-overlay-detail.png` | QR overlay with dialog content |
| `10-auth-modal-detail.png` | Auth modal with button details |

---

## Test Results Summary

```
Initial suite (qa-audit.spec.ts):
  ✓ Landing page renders correctly
  ✗ Card page renders fully (404 status — FIXED with 200.html)
  ✓ QR button opens overlay
  ✓ Create your card button opens auth modal
  ✓ Mobile layout - landing page
  ✓ Mobile layout - card page
  ✓ Comprehensive error check - landing
  ✓ Comprehensive error check - card page

Deep suite (qa-deep.spec.ts):
  ✓ Landing page - scroll to reveal all sections
  ✓ Card page - handle 404 and check SPA routing
  ✓ QR overlay content check
  ✓ Auth modal content check
```

---

## Changes Made

1. `src/pages/Index.tsx` — Removed duplicate `useState` import, removed `hidden sm:inline-flex` from Sign In button
2. `package.json` — Added `cp dist/index.html dist/200.html` to build and test scripts for Surge SPA routing
3. `playwright.config.ts` — Added Playwright config (new file)
4. `tests/qa-audit.spec.ts` — QA test suite (new file)
5. `tests/qa-deep.spec.ts` — Deep QA test suite (new file)
6. `QA-REPORT.md` — This report (new file)
