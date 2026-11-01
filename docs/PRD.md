# PRD: Link-in-bio and project cost calculator

Owner: Salah Al Baik · Status: approved 2026-11-01 (with edits, folded in below)

## Problem

Most visitors arrive from Instagram and need one fast page: who Salah is, how to reach him, and roughly what a website costs. The reference (reem.dev/bio and /pricing, built in Framer) has the right structure and simplicity but carries typos and a broken email link. Salah needs his own coded version with the same simplicity and more care.

## Success criteria

- `/` (bio) and `/pricing` (calculator) load on GitHub Pages at `bio.baikgroup.com` with no 404s on reload or deep link.
- Lighthouse mobile ≥ 95 for performance and accessibility on both pages.
- Copying the email works in the Instagram in-app browser, with a manual fallback when every clipboard path fails.
- The pricing function hits both anchors exactly; all combinations give low < high, both multiples of $50 (Vitest).
- Every price, the spread and the rounding rule live in `src/config/pricing.ts`. Content in `src/config/content.ts`, colors in `src/styles/tokens.css`.
- Fully keyboard and screen-reader operable: radio-group chips, visible focus, live "Copied" and price announcements.

## Scope

**In:** bio page (two cards, social icons, copy-email row, two link rows, domain pill); calculator (five chip groups, build-method info toggletip, result box, closing line with a pre-filled mailto); per-page title, description, Open Graph and Twitter tags; OG image cropped from the portrait; WebP portrait sizes; GitHub Pages workflow and CNAME; README; unit tests; Playwright smoke test that simulates a failing clipboard.

**Out (v1):** EN/AR toggle and RTL (layout uses CSS logical properties so it can be added later), dark mode, analytics, CMS, contact form, URL-synced estimates, the deploy itself.

## Constraints

- React + Vite + TypeScript, static output, minimal runtime dependencies.
- Beige for surfaces only; all text AA.
- Motion is subtle, CSS-first, disabled under `prefers-reduced-motion`. No entrance animations (they delay LCP).
- Feature branch only. Never push or merge to `main`.

## Plan

| Need | Choice | Why |
|---|---|---|
| Routing | No router: Vite multi-page build (`index.html`, `pricing/index.html`) | Each route is a real file, so GitHub Pages needs no 404 redirect hack; each page gets its own meta tags and less JS. |
| Pre-rendering | Vite's SSR pre-render pattern, small script | Markup is in the HTML, so the portrait paints before JS. Avoids pulling in react-router via `vite-react-ssg`. |
| Icons | `@tabler/icons-react` | Maintained, tree-shaken, outlined brand icons in the same stroke style. |
| Price animation | `@number-flow/react` | Maintained, `Intl` formatting, respects reduced motion. Verified against pre-rendering (hydration, layout shift); plain text if it fails. |
| Chips | Native `<input type="radio">` | Arrow keys, labels and form semantics for free. |
| Clipboard | Custom (~30 lines) | `copy-to-clipboard` is unmaintained. Ours adds the async API, a manual-select fallback and feedback state. |
| Tooltip | Custom toggletip | Hover tooltips don't exist on phones. |
| Images | `sharp` (dev only) | WebP sizes and the 1200×630 OG crop from `public/portrait.jpg`. |
| Styling | Plain CSS with custom properties and logical properties | No runtime, one tokens file, RTL-ready. |
| Tests | Vitest (pricing), Playwright (smoke), Lighthouse (preview build) | |

## Design direction

- **Type:** Geist Variable, self-hosted Latin subset, preloaded. Name at 650 weight, −0.035em tracking. Tabular numerals for prices.
- **Color:** `--bg #EFEAE2`, `--card #FFF`, `--tint #F6F3EE`, `--hairline #E6E0D6`, `--ink #1C1A17`, `--muted #5F5B55` (6.7:1 on white), `--accent #1F4FD1` (cobalt, 6.8:1 with white), `--accent-press #1A42B0`.
- **Shape:** 28px cards; portrait inset 8px with 20px radius (concentric); 12px chips; two-layer warm shadow.
- **Motion (150–300ms):** price digits roll, chip fill transitions, ↗ nudges on hover/press, copy icon morphs to a check with "Copied" for 2 seconds.
- **Details:** `theme-color` for the in-app browser bar, safe-area padding, mailto pre-filled with the selection and estimate, a small "← Salah Al Baik" back link on `/pricing`.
- **Cut:** red required asterisks (every group always has a selection) and the language toggle button.
- **Tooltip copy:** "Coded sites are built from scratch in code and can be fully customized. No-code sites are built in a visual builder like Framer, so you can edit text and images yourself."

## Pricing model (approved)

Low = service base + page tier + languages + build method + animation. High = low × 1.25. Both rounded to the nearest $50, halves up.

| Group | Option | Adds |
|---|---|---|
| Service (base) | Design only | $700 |
| | Development only | $900 |
| | Design & Development | $1,300 |
| Pages | Landing page / 2 / 3 / 5 / 5+ | +$0 / +$200 / +$400 / +$700 / +$1,000 |
| Languages | 1 / 2 / 3 | +$0 / +$250 / +$450 |
| Build | No-code / Coded | +$0 / +$300 |
| Animation | None / Light / Medium / Heavy | +$0 / +$150 / +$300 / +$400 |

- Lowest: Design only + Landing + 1 + No-code + None = $700 – $900.
- Highest: D&D + 5+ + 3 + Coded + Heavy = $3,450 – $4,300.
- Defaults: D&D, Landing page, 1 language, Coded, Light = $1,750 – $2,200.
- **Design only:** the Build method group is visibly disabled with the note "Not applicable to design-only" and is ignored in pricing.
- Known simplification (accepted): languages are a flat add-on regardless of page count.

## Decisions on open questions

1. EN/AR toggle: no for v1.
2. Target: `bio.baikgroup.com` on GitHub Pages, CNAME file, no Render config. README explains the DNS record.
3. Pricing table: approved, plus the design-only rule above.
4. Git: feature branch `feature/bio-pricing`. No repo was attached to the session, so the project is delivered as a zip with its git history.
