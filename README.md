# bio.baikgroup.com

Link-in-bio page (`/`) and website cost calculator (`/pricing`) for Salah Al Baik.
React 19 + Vite + TypeScript, pre-rendered to static HTML, deployed to GitHub Pages.

Lighthouse mobile (local, production build): 100 performance, 100 accessibility, 100 best practices, 100 SEO on both pages.

## Quick start

Needs Node 22.18 or newer (`.nvmrc` pins 22).

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173 and http://localhost:5173/pricing/.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload. |
| `npm run build` | Images → typecheck → build → pre-render to `dist/`. |
| `npm run preview` | Serve `dist/` at http://localhost:4173. |
| `npm test` | Pricing unit tests (anchors plus all 360 combinations). |
| `npm run test:e2e` | Browser smoke test of the build, emulating the Instagram in-app browser. Run `npm run build` first; on a new machine run `npx playwright install chromium` once. |

## Where to change things

Everything you'd normally edit lives in three files.

| What | File |
|---|---|
| Name, role, tagline, links, email, meta titles and descriptions, calculator copy | `src/config/content.ts` |
| Prices, spread, rounding, options, defaults, tooltip text | `src/config/pricing.ts` |
| Colors, radii, shadows, font | `src/styles/tokens.css` |

### Content

Open `src/config/content.ts` and edit the values.
- **Socials:** each entry has `icon` (`website`, `instagram`, `x` or `linkedin`), `label` (read by screen readers) and `href`.
- **Link rows:** each has `icon` (`calendar`, `calculator` or `link`), `title` and `href`. Links starting with `http` open in a new tab with `rel="noopener noreferrer"` and get a ↗. On-site links get a →.
- **Tagline:** split into `text`, `emphasis` (the bold last word) and `end`.
- **Search and share text:** `meta.bio` and `meta.pricing` set each page's title and description for search results and link previews.

To add a new icon, import it from [Tabler Icons](https://tabler.io/icons) in `src/components/Icons.tsx` and add it to the matching map.

### Photo

1. Replace `public/portrait.jpg` with your photo. A JPEG straight from your phone is fine, and its rotation is handled.
2. If your face isn't centered, adjust `portrait.focus` in `src/config/content.ts`. It's an `x`/`y` percentage of the photo: `{ x: 50, y: 30 }` means horizontally centered, 30% from the top.
3. Run `npm run dev` or `npm run build`. Both regenerate the images automatically (or run `npm run images` yourself).

From that one file, `scripts/images.mjs` generates:
- `portrait-480/800/1200.webp`: the on-page photo. CSS crops it to a square with `object-fit: cover` and your focal point.
- `og.jpg`: the 1200×630 link-preview image, cropped around the same focal point.
- `apple-touch-icon.png`: the 180×180 home-screen icon.

Generated files go to `public/img/`, which is git-ignored. The full-size original is never published.

> The current `public/portrait.jpg` is a **neutral placeholder** (a silhouette on stone). Swap it before launch.

### Colors

Edit the custom properties at the top of `src/styles/tokens.css`.

| Token | Use |
|---|---|
| `--bg`, `--tint`, `--hairline` | Stone surfaces and lines. Never use these for text or icons. |
| `--ink`, `--muted` | Text. Both pass WCAG AA on white and on `--bg`. |
| `--accent`, `--accent-press`, `--accent-soft` | Interactive blue (links, chips, buttons). |
| `--border` | Unselected chip outline. |

If you change `--bg`, also change `themeColor` in `content.ts` (the color of the browser bar on phones). Check any new text color for at least 4.5:1 contrast, for example with [WebAIM's checker](https://webaim.org/resources/contrastchecker/).

### Prices

Every number lives in `src/config/pricing.ts`. Nothing is hardcoded in components.

```
low  = service base + pages + languages + build method + animation
high = low × spread (1.25)
both rounded to the nearest $50 (halves round up)
```

| Group | Options |
|---|---|
| Service (base) | Design & Development $1,300 · Design only $700 · Development only $900 |
| Pages | Landing +$0 · 2 +$200 · 3 +$400 · 5 +$700 · 5+ +$1,000 |
| Languages | 1 +$0 · 2 +$250 · 3 +$450 |
| Build method | Coded +$300 · No-code +$0 (ignored and disabled for Design only) |
| Animation | None +$0 · Light +$150 · Medium +$300 · Heavy +$400 |

**Other things you can change:**
- **Defaults:** `defaultOption` sets which option each group starts on. Currently D&D, Landing page, 1 language, Coded, Light = $1,750 – $2,200.
- **Spread and rounding:** `spread` and `round` (`to: 50`, `mode: 'nearest' | 'up' | 'down'`).
- **Not-applicable rule:** `notApplicableWhen` and `notApplicableNote`. Any group can be disabled based on another group's choice.
- **Anchors:** the reference points the tests check. Lowest $700 – $900, highest $3,450 – $4,300.

After editing, run `npm test`. If the tests fail because you changed prices on purpose, update `anchors` at the bottom of the file. The tests also check that every combination gives low < high, both multiples of $50.

## How it works

- **Two real pages, no client router.** Vite builds `index.html` and `pricing/index.html` as separate pages, so GitHub Pages serves each URL as a real file. Reloads and deep links never 404, and no redirect hack is needed. `/pricing` redirects to `/pricing/` (GitHub Pages does this itself). Unknown URLs get `404.html`.
- **Pre-rendered.** After the client build, `scripts/prerender.mjs` renders each page to HTML with React's `renderToString` and inlines the CSS (about 2.5 KB gzipped). Content and the portrait paint before any JavaScript runs, then React hydrates.
- **Head tags.** A small Vite plugin (`vite.config.ts` + `src/head.ts`) injects each page's title, description, canonical URL, Open Graph and Twitter tags, the font and portrait preloads, and JSON-LD `Person` data. All of it comes from `content.ts`.
- **Copy email.** `src/lib/clipboard.ts` tries the legacy `execCommand('copy')` first, synchronously inside the tap; iOS in-app browsers drop the tap's permission after an `await`. Next it tries `navigator.clipboard`. If both fail, it selects the address and shows "Press and hold to copy". The smoke test covers all three paths.
- **Chips.** These are native radio inputs inside a `fieldset`/`legend`, so you get radio-group semantics and arrow-key navigation for free. When "Design only" is selected, the Build method fieldset is disabled, shows "Not applicable to design-only", and is left out of the price. Switching back restores the previous choice.
- **Price animation.** [`@number-flow/react`](https://number-flow.barvian.me) rolls the digits. It pre-renders as plain text (verified: no hydration errors, no layout shift) and respects `prefers-reduced-motion`. A visually hidden live region announces "Estimated price: $X to $Y" to screen readers.
- **RTL-ready.** All CSS uses logical properties (`margin-inline`, `padding-block`, `inset-inline-start`…). Directional transforms read a `--dir` variable, and arrows mirror under `[dir='rtl']`. To add Arabic later, set `dir="rtl"` and `lang="ar"` on `<html>` and translate the config.

### Dependencies

Runtime:
- `react`, `react-dom`
- `@tabler/icons-react` (tree-shaken; only the 14 icons used ship)
- `@number-flow/react`
- `@fontsource-variable/geist` (only the Latin file, 29 KB, is used)

Dev only:
- `vite`, `typescript`, `vitest`
- `sharp` (images)
- `playwright` (smoke test)

## Deploy to GitHub Pages (bio.baikgroup.com)

### 1. Push the repo

Create an empty GitHub repository, for example `salah-bio`. Then, from the unzipped project folder:

```bash
git remote add origin https://github.com/<your-username>/salah-bio.git
```

```bash
git push -u origin main
```

```bash
git push -u origin feature/bio-pricing
```

Open a pull request from `feature/bio-pricing` into `main`, review it and merge it. The workflow in `.github/workflows/deploy.yml` runs on every push to `main`: it installs, tests, builds and deploys `dist/`.

### 2. Turn on Pages

In the repo, go to **Settings → Pages**:
1. Under **Build and deployment → Source**, choose **GitHub Actions**.
2. Under **Custom domain**, enter `bio.baikgroup.com` and click **Save**. With Actions deploys, GitHub uses this setting. The `public/CNAME` file is kept for branch-based deploys and as documentation.
3. Once the DNS check passes (step 3), tick **Enforce HTTPS**. The certificate can take up to an hour to issue.

### 3. Add the DNS record at your domain registrar

In the DNS settings for `baikgroup.com`, add one record:

| Type | Name / Host | Value / Target | TTL |
|---|---|---|---|
| `CNAME` | `bio` | `<your-username>.github.io` | Default (or 3600) |

- **Value:** just your GitHub username plus `.github.io`, without the repo name, `https://` or a trailing slash. Some registrars add a trailing dot (`<your-username>.github.io.`); that's fine.
- **Name:** use only `bio`, not `bio.baikgroup.com`. Most registrars append the domain automatically.
- **Cloudflare:** set the record to **DNS only** (grey cloud) until GitHub has issued the HTTPS certificate.
- **Conflicts:** remove any other record that already exists for `bio` (A, AAAA or CNAME).

Check it with:

```bash
dig bio.baikgroup.com +short
```

It should print `<your-username>.github.io.` followed by GitHub's IPs. DNS changes usually show up within minutes, but can take up to 24 hours.

**Recommended:** verify the domain so nobody else can point a GitHub Pages site at it. Go to your GitHub account (not the repo) **Settings → Pages → Add a domain**, enter `baikgroup.com`, and add the TXT record GitHub shows you.

## Known trade-offs

- **Image weight.** The portrait is cropped in CSS (`object-fit`), so a tall phone photo ships about 25% more pixels than the square that's shown. Lighthouse estimates about 22 KB of possible savings, and performance stays at 100. Pre-cropping in `scripts/images.mjs` would remove it.
- **React size.** React is about 68 KB gzipped, shared and cached across both pages. Lighthouse lists about 40 KB as "unused JavaScript", which is normal for React and doesn't affect the score.
- **Languages are a flat add-on.** A third language costs the same on a landing page as on a 5+ page site. This simplification was accepted for v1.
