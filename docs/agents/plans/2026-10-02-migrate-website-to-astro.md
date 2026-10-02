---
date: 2026-10-02T14:12:59.964704+00:00
git_commit: 8e4c0fe6f6e74642d12fb0cdf4267d06763db7d9
branch: main
topic: "Migrate the TV Graphs website from Kickstart to Astro"
tags: [plan, website, astro, cloudflare-pages, press-kit, kickstart]
status: implemented
---

# PLAN: Migrate the TV Graphs website from Kickstart to Astro

The site at `tvgraphs.peterkurzok.de` looks right, but the way it is produced does not: the
homepage and privacy page are exported by hand from the Kickstart Mac app, the press kit is
hand-written next to that export, and every re-export threatens the hand-made parts. This plan
rebuilds the same site as an Astro project inside this repository, so that the repository is the
single source and a `git push` is the whole workflow.

No ticket. Requested on 2026-10-02.

## Acceptance Criteria

- The site is built from an Astro project in `TV-Graphs-Web`; Kickstart is no longer needed for
  the website.
- Homepage, privacy policy and press kit look like they do today: colours, cards, screenshot
  carousel with lightbox, FAQ accordion, download band, automatic light and dark appearance.
- These URLs behave after the migration as they do today:
  - `/`, `/privacy/`, `/press/` return 200; `/privacy`, `/press`, `/index.html`,
    `/privacy/index.html`, `/press/index.html` return 308 to the trailing-slash form.
  - `/press/TV-Graphs-Framed-Screenshots-en-US.zip` and
    `/press/TV-Graphs-Raw-Screenshots-en-US.zip` deliver the ZIP (302 to the GitHub release).
  - `/feed.rss`, `/sitemap.xml`, `/robots.txt` return 200.
  - Every file that exists under `/images/…` today returns 200 with identical bytes.
- Unknown URLs return a 404 page with status 404.
- `/privacy.html` and `/press.html` redirect to `/privacy/` and `/press/`.
- A FAQ entry, a feature text or the launch date is changed by editing one file; switching from
  pre-order to released is one value.
- The built output contains neither "Kickstart" nor "Ignite".
- A push to `main` deploys the site; other branches get a preview URL.
- The README in this repository, `TVGraphs/docs/aso/README.md` and the Claude memories describe
  the Astro workflow.

## Technical Key Decisions and Tradeoffs

1. **Design basis:** plain Astro 7 without a theme; today's look is rebuilt 1:1.
   - Why: the complaint is the workflow, not the look. No maintained free theme ships a
     multi-device screenshot carousel or a press kit, so those are hand-built either way
     (AstroWind, Foxi, ScrewFast, Astroship, mobile-app-landing-template were evaluated).
   - Impact: own components, one stylesheet reduced from 2721 lines to the parts in use, no
     Bootstrap, native `<details>` for the FAQ and one native `<dialog>` for the lightbox.
2. **Content location:** short structured texts live in `src/data/site.ts`; the privacy policy
   and the press kit's prose are Markdown.
   - Why: text is separated from markup and every change has exactly one place.
   - Impact: `app.status` (`'preorder' | 'released'`) drives badges, the download text and the
     press facts.
3. **Deployment:** the existing Cloudflare Pages project builds the site itself.
   - Why: push stays deploy, preview URLs come for free, no secret is needed. Cloudflare Workers
     is not an option: it does not support custom domains outside Cloudflare zones, and
     `peterkurzok.de` is hosted at INWX.
   - Impact: Peter changes build command, output directory and Node version once in the
     dashboard (Phase 4). Whether an existing project can be switched in place is not stated in
     Cloudflare's docs; the dashboard has a build settings section, so it is expected to work.
4. **Downloads:** both press ZIPs are assets of the GitHub release `press-kit-en-US`;
   `_redirects` keeps both `/press/…zip` URLs alive.
   - Why: one mechanism for all downloads and no binary in the repository. Cloudflare Pages
     rejects any file above 25 MiB, so the 93 MB raw ZIP has to live elsewhere anyway.
   - Impact: the framed ZIP is uploaded to the release before it is removed from the repository.
     It is then served by GitHub via 302 instead of directly from the domain.
5. **Corrections beyond a 1:1 rebuild:** a "Press Kit" link in the footer, one shared layout for
   all three pages, a real 404 page, optimised display images.
   - Why: a pure copy would carry over today's defects (press kit unlinked, dead anchors in the
     privacy page's navigation, unknown paths answering 200, a 1.5 MB favicon).
   - Impact: on sub-pages the navigation links point at `/#features`, `/#faq`, `/#download`.
     The homepage screenshots get the descriptive alt texts the press page already has, instead
     of "Screenshot 1" to "Screenshot 8"; the lightbox shows the caption as its heading.
6. **Old helper assets:** `/css/`, `/js/`, `/fonts/` are dropped; icons become inline SVG.
   - Why: those files are Bootstrap, the icon font and Ignite scripts, loaded only by today's
     HTML. Nobody links to them from outside.
   - Impact: these URLs return 404 after the migration. `CNAME` is dropped too: it is a leftover
     of GitHub Pages, which is not enabled for this repository. `/.gitignore`, which today is
     served like any other file in the repository root, returns 404 as well.
7. **Documentation scope:** new README here, `docs/aso/README.md` and the memories are updated;
   the four historical plans in `TVGraphs/docs/agents/plans/` stay untouched.
   - Why: finished plans record what was done at the time.
   - Impact: Kickstart mentions that concern ASO scoring or Kickstart Exchange stay as they are;
     Kickstart remains in use for ASO.
8. **Sitemap and feed without extra packages:** `/sitemap.xml` and `/feed.rss` come from two
   small Astro endpoints.
   - Why: `@astrojs/sitemap` emits `sitemap-index.xml` and `sitemap-0.xml`, never
     `sitemap.xml`, so the published URL would change. The feed is an empty channel.
   - Impact: `astro` is the only runtime dependency.
9. **One copy of every image:** originals live in `src/assets/images/`; a static endpoint
   publishes them unchanged under `/images/…`, and `astro:assets` derives the small variants
   from the same files.
   - Why: `<Image>` only optimises files imported from `src/`, while the published `/images/…`
     URLs must stay stable. Keeping originals in `public/` as well would duplicate about 7 MB.
   - Impact: `src/pages/images/[...file].ts`; verified in a throwaway Astro 7.3.5 build that it
     emits `dist/images/screenshots/mac-03-popular.jpg` byte-identical to the source.
10. **Automated URL contract:** `npm run check` builds and verifies `dist/`;
    `npm run check:live -- <base-url>` verifies a deployed site.
    - Why: "every URL stays reachable" is the central requirement and must not depend on
      clicking through pages.
    - Impact: two dependency-free Node scripts in `scripts/`.
11. **Migration on a branch:** all work happens on branch `astro`; the site goes live with the
    merge after the preview deployment passed `check:live`.
    - Why: `main` is production.
    - Impact: the fastest rollback is Cloudflare's own: Pages, Deployments, "Rollback" on the
      last deployment before the cutover. The lasting one is reverting the merge and resetting
      the dashboard build settings. Today Cloudflare serves the repository root without a build,
      so anything pushed is published as-is: this plan file is committed on `astro` only, and
      `astro` is not pushed before the dashboard change in Phase 4.
12. **Buttons use the accent colour:** "Get the app" and the press download buttons become
    purple (`--primary-color`) with white text.
    - Why: today they render in Bootstrap's default blue `#0d6efd`, because Kickstart's
      stylesheet never themes `.btn-primary`. That is an artefact, not a design choice.
    - Impact: the only intended visual difference on the homepage.
13. **Release copy is prepared now:** `site.ts` holds both the pre-order and the released
    wording (see Desired End State). Launch is 11 October 2026.
    - Why: the switch on launch day should be one value, not a writing task.
    - Impact: Peter reviews the released wording in Phase 1.
14. **Spelling in the privacy policy:** "TVGraphs" becomes "TV Graphs" in the two places in the
    running text (first paragraph and "Children").
    - Why: `TVGraphs/docs/aso/README.md` lists it as a known defect; the closed-up spelling is
      reserved for identifiers.
    - Impact: no other wording changes; "Last updated: 25 August 2026" stays.
15. **`/privacy.html` and `/press.html` get redirects.**
    - Why: today both answer 200 with the *homepage*, because Cloudflare Pages treats a site
      without `404.html` as a single-page app. With a real 404 page they would turn into 404.
    - Impact: two more lines in `_redirects`.

## Current State

```
Kickstart app (Mac)                  TV-Graphs-Web (main)                 Cloudflare Pages
┌─────────────────────┐   manual    ┌──────────────────────────┐  push   ┌──────────────────────────┐
│ content in the      │──export───▶ │ index.html      (Ignite) │───────▶ │ tv-graphs-web.pages.dev  │
│ app's own store,    │ overwrites  │ privacy/index.html (Ign.)│  no     │ = tvgraphs.peterkurzok.de│
│ no file in the repo │ repo root   │ css/ js/ fonts/ images/  │  build  │ (CNAME at INWX)          │
└─────────────────────┘             │ feed.rss sitemap.xml     │         └──────────────────────────┘
                                    │ robots.txt CNAME         │
     maintained by hand ──────────▶ │ press/index.html + ZIP   │
                                    │ _redirects               │
                                    └──────────────────────────┘
```

- `index.html` (Ignite v0.6.0 output): sticky navbar (`:35-51`), centred hero with app icon and
  pre-order badge (`:55-66`), 3 highlight cards (`:67-88`), 6 feature cards with icon tiles
  (`:89-140`), carousel of 8 screenshots with one Bootstrap modal each (`:141-280`), FAQ
  accordion with 7 entries (`:281-347`), purple download band (`:348-358`), footer (`:361-381`).
  The badges at `:62` and `:354` were added by hand and are lost on re-export.
- `privacy/index.html`: the policy as HTML (`:59-113`); its navbar links to `#features`, `#faq`
  and `#download`, which do not exist on that page (`:43-47`).
- `press/index.html`: hand-written, own reduced header and footer, press styles inline
  (`:19-49`), download cards (`:69-95`), about, gallery, facts table, developer, contact, usage
  notes. Not linked from the homepage.
- `css/styles.css`: 2721 lines, most of them unused Kickstart sections (pricing, team, video,
  newsletter, changelog, blog, contact form, testimonials, stats). Light/dark is driven by
  `prefers-color-scheme` through `body[data-site-classes]` selectors (`:66-116`).
- `css/bootstrap.min.css` (5.3.5), `js/bootstrap.bundle.min.js`, `css/bootstrap-icons.min.css`,
  `fonts/`, `css/ignite-core.min.css`, `js/ignite-core.js`: framework files. `ignite-core.js`
  contains theme switching, e-mail obfuscation and table filtering, none of which the site uses.
- `_redirects`: sends the raw ZIP to the release `press-kit-en-US`.
- `sitemap.xml` lists `/` and `/privacy/` only. `feed.rss` is an empty channel.
- Images: `images/app-icon.png` and `images/favicon.png` are the same 2048×2048 PNG (1.5 MB);
  5 iPhone screenshots 1320×2868, Apple TV and Vision Pro 3840×2160, Mac 2880×1800; 12 badge
  SVGs, of which only the two App Store pre-order ones are used.
- Live behaviour, measured on 2026-10-02: the URL table in the Acceptance Criteria, plus
  unknown paths, `/privacy.html` and `/press.html` answering 200 with the homepage.
- Outside this repository: the app links `https://tvgraphs.peterkurzok.de/privacy/`
  (`TVGraphsSettingsConfiguration.swift:34`, asserted in a test) and App Store Connect uses the
  root as marketing and support URL (`TVGraphs/docs/aso/metadata/fields.json:18-20`).

## Desired End State

```
TV-Graphs-Web (main)                               Cloudflare Pages
┌────────────────────────────────────┐   push     ┌───────────────────────────────┐
│ src/data/site.ts      texts        │──────────▶ │ npm run build  ->  dist/      │
│ src/pages/privacy.md  policy       │            │ branch -> <branch>.tv-graphs- │
│ src/data/press/*.md   press prose  │            │           web.pages.dev       │
│ src/components/*      markup       │            │ main   -> tvgraphs.peter-     │
│ src/assets/images/*   originals    │            │           kurzok.de           │
│ public/_redirects robots.txt       │            └───────────────────────────────┘
└────────────────────────────────────┘
GitHub release press-kit-en-US:  framed ZIP + raw ZIP   <── 302 from /press/*.zip
```

Footer, current and proposed:

```
Current                                         Proposed
┌─────────────────────────────────────────┐    ┌─────────────────────────────────────────┐
│ Episode rating charts for …    (M) (GH) │    │ Episode rating charts for …    (M) (GH) │
│─────────────────────────────────────────│    │─────────────────────────────────────────│
│     Privacy Policy   Terms of Service   │    │ Privacy Policy  Terms of Service  Press Kit │
│          © 2026 Peter Kurzok            │    │          © 2026 Peter Kurzok            │
│          Built with Kickstart           │    │                                         │
└─────────────────────────────────────────┘    └─────────────────────────────────────────┘
```

Header on sub-pages, current and proposed:

```
Current /privacy/   TV Graphs      Features FAQ Download Imprint [Get the app]   (anchors dead)
Current /press/     TV Graphs                                    Back to site
Proposed (both)     TV Graphs      Features FAQ Download Imprint [Get the app]   (-> /#features …)
```

Wording per launch status (`app.status`):

| Place | `preorder` (today's text) | `released` (new) |
|---|---|---|
| Badge | `app-store-preorder-{black,white}.svg`, alt "Pre-order on the App Store" | `app-store-download-{black,white}.svg`, alt "Download on the App Store" |
| Download band | "Available for pre-order now on the App Store — it arrives automatically on October 11 for iPhone, iPad, Mac, Apple TV and Apple Vision Pro. Free, with nothing to buy and nothing to subscribe to." | "Available now on the App Store for iPhone, iPad, Mac, Apple TV and Apple Vision Pro. Free, with nothing to buy and nothing to subscribe to." |
| Press lead, last sentence | "Launching on the App Store on 11 October 2026." | "Available on the App Store since 11 October 2026." |
| Press facts, "Launch" | "11 October 2026 on the App Store (available for pre-order now)" | "11 October 2026 on the App Store" |
| Press contact, second line | "Review access before launch is available via TestFlight on request." | omitted |

## Abstractions and Code Reuse

Nothing is reused from Kickstart at runtime. The existing files are the specification: texts are
copied verbatim from `index.html`, `privacy/index.html` and `press/index.html`, and the rules in
use are carried over from `css/styles.css`. Bootstrap behaviour that the markup relied on is
replaced by small own rules (container, headings, buttons, navbar collapse, accordion, modal,
the three-column row of the press download cards).

- `package.json` - scripts `dev`, `build`, `preview`, `check`, `check:live`; dependency `astro`;
  dev dependencies `@astrojs/check`, `typescript`, `@types/node`
- `package-lock.json` - committed, so that `npm ci` works locally and on Cloudflare
- `astro.config.mjs` - `site: 'https://tvgraphs.peterkurzok.de'`;
  `markdown: { smartypants: false }` so that the Markdown texts keep their straight quotes;
  `build.format` and `trailingSlash` stay at their defaults (`directory`, `ignore`)
- `.nvmrc` - `22`
- `tsconfig.json` - extends `astro/tsconfigs/strict`
- `src/`
  - `data/`
    - `site.ts` - all structured texts
      - `app` - name, tagline, `appStoreUrl`, `appStoreId`, `status`, per-status wording
      - `nav`, `footerLinks`, `social` - header and footer entries
      - `hero`, `highlights`, `features`, `faq` - homepage sections
      - `screenshots` - `{ file, orientation, alt, caption }`, shared by carousel and press
        gallery
      - `press` - lead, download cards, facts rows, contact
      - `pages` - the three paths the sitemap lists
    - `press/about.md`, `press/developer.md`, `press/usage-notes.md` - press prose
  - `layouts/`
    - `Base.astro` - `<head>` (title, description, canonical, Open Graph, favicon,
      `apple-itunes-app`), header, footer, global stylesheet; props `title`, `description`,
      `path`, optional `noindex`
    - `Prose.astro` - wraps `Base` for Markdown pages (`.privacy-page` and `.privacy-content`
      containers, as today)
  - `components/`
    - `Header.astro` - brand, nav, mobile toggle; resolves anchors to `/#…` off the homepage
    - `Footer.astro` - tagline, social icons, links, copyright
    - `StoreBadge.astro` - light and dark badge for the current `app.status`
    - `Icon.astro` - inline SVG for the 6 feature icons, Mastodon, GitHub; prop `name`
    - `Hero.astro`, `Highlights.astro`, `Features.astro`, `Faq.astro`, `Download.astro`
    - `Screenshots.astro` - carousel with optimised thumbnails
    - `Lightbox.astro` - one `<dialog>` plus the script that fills it
  - `pages/`
    - `index.astro`, `press.astro`, `404.astro`, `privacy.md`
    - `feed.rss.ts`, `sitemap.xml.ts` - static endpoints
    - `images/[...file].ts` - publishes `src/assets/images/**` unchanged
  - `assets/images/` - today's `images/` tree, moved with `git mv`
  - `styles/site.css` - tokens, base, header, sections, prose, press, footer
- `public/`
  - `_redirects`, `robots.txt`
- `scripts/`
  - `check-dist.mjs` - verifies the build output
  - `check-live.mjs` - verifies a deployed site
- `README.md` - workflow documentation

Sketch of `src/data/site.ts`:

```ts
export type LaunchStatus = 'preorder' | 'released';

export const app = {
  name: 'TV Graphs',
  tagline: 'Episode rating charts for every TV series.',
  appStoreId: '6804961357',
  appStoreUrl: 'https://apps.apple.com/app/tv-graphs-season-ratings/id6804961357',
  status: 'preorder' as LaunchStatus,
  badge: {
    preorder: { file: 'app-store-preorder', alt: 'Pre-order on the App Store' },
    released: { file: 'app-store-download', alt: 'Download on the App Store' },
  },
  downloadText: { preorder: '…', released: '…' },
};

export const features = [
  { icon: 'graph-up', title: 'Episode rating charts', text: 'Swift Charts plots every …' },
  // …
];

export const faq = [{ question: 'Where does the data come from?', answer: '…' } /* … */];

export const screenshots = [
  { file: 'iphone-01-chart.jpg', orientation: 'portrait',
    alt: 'A season at a time: every episode plotted by its rating, on iPhone',
    caption: 'A season at a time: every episode plotted by its rating, on iPhone.' },
  // …
];
```

Sketch of `src/pages/images/[...file].ts`:

```ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { readdir, readFile } from 'node:fs/promises';

const root = 'src/assets/images';
const types: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.split('.').pop()! in types)
    .map((entry) => ({ params: { file: `${entry.parentPath}/${entry.name}`.slice(root.length + 1) } }));
};

export const GET: APIRoute = async ({ params }) =>
  new Response(await readFile(`${root}/${params.file}`), {
    headers: { 'Content-Type': types[params.file!.split('.').pop()!] },
  });
```

## Logging & Observability

The site has no runtime. The two check scripts are the observability; both print one line per
check and exit non-zero on the first failing group.

```
$ npm run check
✓ dist/index.html
✓ dist/privacy/index.html
✓ dist/images/screenshots/mac-03-popular.jpg (identical to source)
✓ _redirects: /press/TV-Graphs-Raw-Screenshots-en-US.zip -> releases/download/press-kit-en-US/… 302
✓ 41 internal links resolve
✓ no "Kickstart" or "Ignite" in 7 text files
✓ largest file 1.0 MiB (limit 25 MiB)
All checks passed.

$ npm run check:live -- https://astro.tv-graphs-web.pages.dev
✓ 200 /
✓ 308 /privacy -> /privacy/
✗ 404 /does-not-exist   expected 404, got 200
1 of 24 checks failed.
```

Deploy failures stay visible where they are today: the "Cloudflare Pages" check run on the
commit in GitHub and the deployment log in the Cloudflare dashboard.

## Implementation

All phases are committed on branch `astro`. `main` is not touched before Phase 4.

### Phase 1: Astro project and homepage

Dependencies: None

The homepage is served by Astro and looks like today's. Content comes from `site.ts`, images are
single-sourced, and the build is checked automatically.

**Tasks**:
- [x] Create branch `astro` from `main`; commit this plan file on it. Keep the branch local:
  it is pushed for the first time in Phase 4, after the Cloudflare build settings changed.
- [x] Add `package.json` (`"type": "module"`, `"private": true`) with scripts
  `dev: astro dev`, `build: astro check && astro build`, `preview: astro preview`,
  `check: npm run build && node scripts/check-dist.mjs`;
  install `astro@^7.3`, and as dev dependencies `@astrojs/check`, `typescript`, `@types/node`;
  commit `package-lock.json`.
- [x] Add `astro.config.mjs` with `site: 'https://tvgraphs.peterkurzok.de'` and
  `markdown: { smartypants: false }`, `.nvmrc` with `22`, `tsconfig.json` extending
  `astro/tsconfigs/strict`.
- [x] Add `.astro/` to `.gitignore` (`node_modules/` and `dist/` are already listed).
- [x] Move `images/` to `src/assets/images/` with `git mv` (app icon, favicon, 8 screenshots,
  12 badge SVGs).
- [x] Add `src/pages/images/[...file].ts` as sketched above.
- [x] Add `src/data/site.ts` with `app`, `nav`, `footerLinks`, `social`, `hero`, `highlights`,
  `features`, `faq`, `screenshots`, `pages`; copy every text verbatim from `index.html`, take each
  screenshot's `alt` and `caption` from the `alt` attribute and the `<figcaption>` in
  `press/index.html:116-147`, and add the released wording from the table in Desired End State.
- [x] Add `src/styles/site.css`: carry over from `css/styles.css` the tokens (`:2-64`), base,
  container, header, hero, section header, screenshots, highlights, features, download, FAQ,
  footer, legal pages, app icon, social links and store badges; drop every unused section.
  Replace the `body[data-site-classes…]` dark-mode selectors with one
  `@media (prefers-color-scheme: dark)` block on `:root`; set `--primary-color: #a78bfa` and
  `--primary-rgb: 167, 139, 250` directly; add own rules for what Bootstrap supplied: box-sizing
  and margin reset, heading sizes (`h1` `calc(1.375rem + 1.5vw)` capped at `2.5rem`, `h2`
  `2rem`, `h4` `1.5rem`), links, `.button` (purple, white text, small variant), navbar layout
  and its collapse below 768px, `<details>` accordion with chevron, `<dialog>` with backdrop.
- [x] Add `src/components/Icon.astro` with inline SVG paths for `graph-up`, `search`,
  `heart-fill`, `stars`, `window-sidebar`, `universal-access`, `mastodon`, `github` (Bootstrap
  Icons, MIT), each with `aria-hidden="true"`.
- [x] Add `src/components/StoreBadge.astro`: link to `app.appStoreUrl` with the black and the
  white badge of the current status, sources `/images/<file>-black.svg` and `-white.svg`.
- [x] Add `src/components/Header.astro`: brand link to `/`; nav entries from `site.ts`, anchors
  prefixed with `/` when `Astro.url.pathname !== '/'`; a toggle button with `aria-expanded` and
  `aria-controls`, plus an inline script that flips the attribute and a `data-open` flag.
- [x] Add `src/components/Footer.astro`: tagline, social icon links with `aria-label`, footer
  links (Privacy Policy, Terms of Service, Press Kit), copyright; no Kickstart link.
- [x] Add `src/layouts/Base.astro`: `lang="en"`, charset, viewport, `<title>`, description,
  canonical built from `Astro.site` and `path`, Open Graph and Twitter tags including
  `og:image` `https://tvgraphs.peterkurzok.de/images/screenshots/mac-03-popular.jpg`,
  `apple-itunes-app`, author, a 64 px favicon and a 180 px `apple-touch-icon` generated with
  `getImage({ format: 'png' })` from `src/assets/images/app-icon.png` (the default would be
  WebP), `Header`, `<main>`, `Footer`.
- [x] Add `Hero.astro` (app icon through `<Image>` at 240 px for a 120 px slot, title, subtitle,
  `StoreBadge`), `Highlights.astro`, `Features.astro`, `Download.astro`.
- [x] Add `Faq.astro`: one `<details name="faq">` per entry with the question in `<summary>`.
- [x] Add `Screenshots.astro`: resolve each `screenshots[].file` to its `ImageMetadata` with
  `import.meta.glob('../assets/images/screenshots/*.jpg', { eager: true })`; render `<Image>`
  at width 560 (portrait) or 1260 (landscape), `loading="lazy"`, with the entry's `alt`; each
  thumbnail is a `<button>` carrying the original URL `/images/screenshots/<file>`, the `alt`
  and the `caption`.
- [x] Add `Lightbox.astro`: a single `<dialog>` with caption, close button and `<img>`; an
  inline script sets `src`, `alt` and caption from the clicked button, calls `showModal()`, and
  closes on the button and on a backdrop click (Escape works natively).
- [x] Add `src/pages/index.astro` composing the sections in today's order with the ids `hero`,
  `highlights`, `features`, `screenshots`, `faq`, `download`; title `TV Graphs`; description
  "TV Graphs plots every episode of every season of a TV series by its rating. Native on
  iPhone, iPad, Mac, Apple TV and Apple Vision Pro. Free, with no account." (the page has no
  meta description today).
- [x] Delete `index.html`, `css/`, `js/`, `fonts/`.
- [x] Add `scripts/check-dist.mjs` (Node built-ins only). It asserts:
  expected files exist (`index.html`, `images/app-icon.png`, `images/favicon.png`, the 8
  screenshots, the 12 badge SVGs); every file under `dist/images/` is byte-identical to its
  source in `src/assets/images/`; every internal `href` and `src` in every HTML file resolves
  to a file in `dist/`, to a source path in `dist/_redirects` (a missing `_redirects` counts
  as empty), or to an entry of the script's `pending` list, which starts as `/privacy/` and
  `/press/`; internal links to pages end with `/`; no text file (`.html`, `.xml`, `.rss`, `.txt`, `.css`, `.js`) matches
  `/kickstart|ignite/i`; no file exceeds 25 MiB; `index.html` references the badge file that
  belongs to `app.status`, which the script reads from `src/data/site.ts` with a regular
  expression on the `status:` line; `index.html` contains the ids `features`, `faq`, `download`.
- [x] Add `README.md` with sections: what this repository is, requirements (Node 22),
  commands (`npm run dev`, `npm run check`), where content lives (`src/data/site.ts`), switching
  from pre-order to released (`app.status`), images (`src/assets/images/`, published under
  `/images/…`).

**Automated Verification**:
- [x] `npm ci` succeeds on Node 22.
- [x] `npm run check` passes: `astro check` reports 0 errors, the build succeeds and
  `check-dist.mjs` prints "All checks passed."
- [x] With `app.status` set to `'released'`, `npm run check` passes and `dist/index.html`
  references `app-store-download-black.svg`; the value is set back to `'preorder'` afterwards.
- [x] `! grep -qE '<script[^>]+src=' dist/index.html` succeeds: the page loads no script file.

**Manual Verification**:
- [x] `npm run dev`, open `http://localhost:4321/` next to `https://tvgraphs.peterkurzok.de/`:
  header, hero, highlights, features, carousel, FAQ, download band and footer match in light
  and in dark appearance; the only intended difference is the purple "Get the app" button.
- [x] At a window width below 768 px the menu button opens and closes the navigation.
- [x] Clicking a screenshot opens the lightbox with the full-size image; Escape, the close
  button and a click on the backdrop close it.
- [x] Opening one FAQ entry closes the previously open one.
- [x] Peter reads the released wording in the table under Desired End State and confirms or
  corrects it.

### Phase 2: Privacy policy, 404 page and technical files

Dependencies: Phase 1

`/privacy/` is served from Markdown, unknown paths get a real 404 page, and `feed.rss`,
`sitemap.xml` and `robots.txt` keep their URLs.

**Tasks**:
- [x] Add `src/layouts/Prose.astro`: wraps `Base`, renders the slot inside the `.privacy-page`
  and `.privacy-content` containers; takes `title` and `description` from `frontmatter`, builds
  the `<title>` as `<title> - TV Graphs`.
- [x] Add `src/pages/privacy.md` with frontmatter `layout: ../layouts/Prose.astro`,
  `title: Privacy Policy`,
  `description: "What TV Graphs sends from your device, to whom, and when: no accounts, no analytics, no tracking."`,
  `path: /privacy/`; convert
  `privacy/index.html:59-113` to Markdown verbatim (headings, lists, `code`, links, bold),
  changing only "TVGraphs" to "TV Graphs" in the first paragraph and in "Children".
- [x] Add `src/pages/404.astro`: `Base` layout with title `Page not found - TV Graphs` and
  description "This page does not exist."; heading "Page not found", one sentence, a `.button`
  link to `/`; `<meta name="robots" content="noindex">` through a `noindex` prop on `Base`.
- [x] Add `src/pages/sitemap.xml.ts`: `GET` returns a `urlset` with one `<url><loc>` per entry
  of `pages` in `site.ts` (`/`, `/privacy/`, `/press/`), built on `context.site`, content type
  `application/xml`.
- [x] Add `src/pages/feed.rss.ts`: `GET` returns the empty channel of today's `feed.rss`
  (title, empty description, link, `atom:link` self reference, `language` `en`) without the
  `generator` element, content type `application/rss+xml`.
- [x] Move `robots.txt` to `public/robots.txt` with `git mv`, content unchanged.
- [x] Delete `privacy/index.html`, `feed.rss`, `sitemap.xml`.
- [x] Extend `scripts/check-dist.mjs`: expected files `privacy/index.html`, `404.html`,
  `feed.rss`, `sitemap.xml`, `robots.txt`; `sitemap.xml` contains exactly the three URLs;
  `feed.rss` contains `<atom:link href="https://tvgraphs.peterkurzok.de/feed.rss"`;
  `privacy/index.html` has the canonical `https://tvgraphs.peterkurzok.de/privacy/`, contains
  "Last updated: 25 August 2026" and does not contain "TVGraphs"; its navigation links are
  `/#features`, `/#faq`, `/#download`. Remove `/privacy/` from the `pending` list; `/press/`
  stays on it until Phase 3.
- [x] Extend `README.md`: editing the privacy policy (`src/pages/privacy.md`, update the "Last
  updated" line when the wording changes).

**Automated Verification**:
- [x] `npm run check` passes with the extended assertions.
- [x] `xmllint --noout dist/sitemap.xml dist/feed.rss` reports no error.

**Manual Verification**:
- [x] `npm run dev`, open `/privacy/` next to the live page: text, headings, lists and links
  match; the navigation entries lead to the homepage sections.
- [x] Open `http://localhost:4321/nope`: the 404 page appears in the site's layout.

### Phase 3: Press kit and downloads

Dependencies: Phase 2

`/press/` is an Astro page in the shared layout, both ZIPs are release assets, and the
repository holds no ZIP any more.

**Tasks**:
- [x] Add `press` to `src/data/site.ts`: lead (with per-status last sentence), the three
  download cards (title, text, `href`, button label, optional `download` file name), the facts
  rows (with per-status "Launch" value), contact (with the TestFlight line for `preorder` only);
  texts verbatim from `press/index.html`.
- [x] Add `src/data/press/about.md`, `developer.md`, `usage-notes.md` with the prose of
  `press/index.html:99-110`, `:169` and `:180-181`.
- [x] Add `src/pages/press.astro`: `Base` with title `TV Graphs — Press Kit` and the
  description of `press/index.html:8`; sections `downloads`, `about`, `screenshots`, `facts`,
  `developer`, `contact`, `notes` with today's ids; Markdown through
  `import { Content as About } from '../data/press/about.md'`; gallery from `screenshots` with
  `<Image>` at width 640, the entry's `alt` and its `caption` as `<figcaption>`; download
  buttons use `.button`.
- [x] Carry the press styles of `press/index.html:26-48` into `src/styles/site.css`, with the
  three download cards in a CSS grid instead of Bootstrap's `row` and `col-md-4`.
- [x] Upload the framed ZIP to the release:
  `gh release upload press-kit-en-US press/TV-Graphs-Framed-Screenshots-en-US.zip -R pkurzok/TV-Graphs-Web`.
  This publishes the file; confirm with Peter before running it.
- [x] Update the release title to "Press kit — screenshots (en-US)" and its notes to name both
  archives and both redirecting URLs: `gh release edit press-kit-en-US --title … --notes …`.
- [x] Move `_redirects` to `public/_redirects` with `git mv` and extend it:
  ```
  # Cloudflare Pages rejects any single file over 25 MiB, so the press archives are
  # release assets; these lines keep the published URLs working.
  /press/TV-Graphs-Raw-Screenshots-en-US.zip https://github.com/pkurzok/TV-Graphs-Web/releases/download/press-kit-en-US/TV-Graphs-Raw-Screenshots-en-US.zip 302
  /press/TV-Graphs-Framed-Screenshots-en-US.zip https://github.com/pkurzok/TV-Graphs-Web/releases/download/press-kit-en-US/TV-Graphs-Framed-Screenshots-en-US.zip 302
  # Without a 404 page these two used to answer with the homepage.
  /privacy.html /privacy/ 301
  /press.html /press/ 301
  ```
- [x] Delete `press/index.html` and `press/TV-Graphs-Framed-Screenshots-en-US.zip`.
- [x] Extend `scripts/check-dist.mjs`: expected file `press/index.html`; `_redirects` contains
  the four rules above; no `.zip` in `dist/`; `press/index.html` contains the ids `downloads`,
  `facts`, `contact` and links both ZIP URLs and `/images/app-icon.png`; the `pending` list is
  now empty and is removed.
- [x] Extend `README.md`: updating the press archives
  (`gh release upload press-kit-en-US <zip> --clobber`; the archives come from
  `TVGraphs/Screenshots/screenshots/en-US` and `raw-screenshots/en-US`), and the rule that no
  file above 25 MiB may enter the build.

**Automated Verification**:
- [x] `gh release view press-kit-en-US -R pkurzok/TV-Graphs-Web --json assets --jq '.assets[].name'`
  lists both ZIP names.
- [x] `curl -sIL https://github.com/pkurzok/TV-Graphs-Web/releases/download/press-kit-en-US/TV-Graphs-Framed-Screenshots-en-US.zip`
  ends in status 200 with `content-length: 13783476`.
- [x] `npm run check` passes with the extended assertions.
- [x] `git ls-files '*.zip'` prints nothing.

**Manual Verification**:
- [x] `npm run dev`, open `/press/` next to the live page: download cards, about, gallery,
  facts, developer, contact and usage notes match; header and footer are the shared ones.
- [x] The footer link "Press Kit" on the homepage opens `/press/`.

### Phase 4: Cutover and documentation

Dependencies: Phase 3

The Astro site replaces the Kickstart export in production, and the documentation outside this
repository says so.

**Tasks**:
- [x] Delete `CNAME`.
- [x] Add `scripts/check-live.mjs` (Node built-ins, `fetch` with `redirect: 'manual'`, base URL
  as argument) and the script `check:live: node scripts/check-live.mjs` in `package.json`.
  Expected results:
  - 200: `/`, `/privacy/`, `/press/`, `/feed.rss` (`application/rss+xml`), `/sitemap.xml`
    (`application/xml`), `/robots.txt`, `/images/app-icon.png`, `/images/favicon.png`, the 8
    screenshots, `/images/app-store-preorder-black.svg`
  - 308 to the trailing-slash form: `/privacy`, `/press`, `/index.html`,
    `/privacy/index.html`, `/press/index.html`
  - 302 to the release URL: both `/press/…zip`; following the redirect ends in 200
  - 301: `/privacy.html` to `/privacy/`, `/press.html` to `/press/`
  - 404: `/does-not-exist`, `/css/styles.css`
  - `<title>` of `/privacy/` is `Privacy Policy - TV Graphs`
- [x] Extend `README.md`: deployment (Cloudflare Pages project `tv-graphs-web`, build command
  `npm run build`, output directory `dist`, `NODE_VERSION` 22, push to `main` deploys, branches
  get `<branch>.tv-graphs-web.pages.dev`), the URL contract and `npm run check:live`, rollback
  (Pages, Deployments, "Rollback" on an earlier deployment).
- [x] Peter changes the Cloudflare Pages project `tv-graphs-web` under Settings, Builds &
  deployments: build command `npm run build`, build output directory `dist`, environment
  variable `NODE_VERSION=22` for production and preview. The live site keeps its last
  deployment until the next successful build.
- [x] Only after that change, push branch `astro` for the first time; wait for the "Cloudflare
  Pages" check run on the commit to succeed.
- [x] Open a pull request from `astro` to `main` and merge it after the preview passed the
  checks below; confirm the merge with Peter first.
- [ ] In `TVGraphs/docs/aso/README.md:176-180`, replace the sentence about Kickstart and the
  two-item list with: "`tvgraphs.peterkurzok.de` lives outside this repository — it is an Astro
  project in `pkurzok/TV-Graphs-Web`, see its README — so this is recorded rather than fixed.
  One thing to fix when it is: the six store pages linking an English-only policy." The spelling
  item is dropped because Phase 2 fixed it. Commit in the `TVGraphs` repository following its
  `AGENTS.md`; confirm with Peter before committing there.
- [x] Rewrite the memory
  `~/.claude/projects/-Users-peter-kurzok-ws-workshop-TV-Graphs-Web/memory/tv-graphs-site-is-generated-output.md`
  as `tv-graphs-site-is-astro.md`: the repository is the Astro source, content lives in
  `src/data/site.ts` and Markdown, deploy is a push to `main` built by Cloudflare Pages, press
  ZIPs are assets of release `press-kit-en-US`; keep the App Store id and pre-order date. Delete
  the old file and update the line in that folder's `MEMORY.md`.
- [x] Update the memory
  `~/.claude/projects/-Users-peter-kurzok-ws-workshop-TVGraphs/memory/reference_kickstart_mcp.md`:
  state that since October 2026 the TV Graphs website is an Astro project in `TV-Graphs-Web` and
  Kickstart is not used for it; remove the TV Graphs press-kit workaround and the "when
  re-exporting from Kickstart" sentence; keep the tool limits, which still apply to the other
  projects, and the Cloudflare 25 MiB fact with a pointer to the new memory. Update the line in
  that folder's `MEMORY.md` and the `description` in the frontmatter.

**Automated Verification**:
- [x] `npm run check` passes on branch `astro`.
- [x] `npm run check:live -- https://astro.tv-graphs-web.pages.dev` passes against the preview
  deployment.
- [x] After the merge, `npm run check:live -- https://tv-graphs-web.pages.dev` passes; the same
  command against `https://tvgraphs.peterkurzok.de` passes where the domain resolves (on
  2026-10-02 it did not resolve from Peter's Mac without `--resolve`).
- [x] `git ls-files index.html css js fonts CNAME press privacy | wc -l` on `main` prints 0.
- [x] `git grep -niE "kickstart|ignite" -- ':!docs'` in `TV-Graphs-Web` prints nothing.
- [ ] `grep -c "Kickstart" /Users/peter.kurzok/ws-workshop/TVGraphs/docs/aso/README.md` prints 4
  (today 5; the remaining four concern ASO), and `grep -c "Astro" …` on the same file prints 1.

**Manual Verification**:
- [x] On the preview URL, the homepage, `/privacy/` and `/press/` look right in light and dark
  appearance on a phone and on a desktop browser.
- [ ] After the merge, `https://tvgraphs.peterkurzok.de/` shows the new site (the footer has a
  "Press Kit" link and no "Built with Kickstart"), and the privacy link in the app's Settings
  opens the policy.

## Implementation Notes

During implementation, document user feedback, problems, and decisions here.

### Phase 1 (2026-10-02)

- **Heading sizes are fixed, not fluid.** The plan asked for `h1` at `calc(1.375rem + 1.5vw)`
  capped at `2.5rem`. Measured on the live site, headings are `2.5rem`, `2rem` and `1.5rem` at
  every width (40, 32 and 24 px at 390 px too), so `site.css` uses the fixed sizes.
- **"Get the app" was already purple.** Decision 12 assumed Bootstrap blue; the live button
  renders in `#a78bfa` with white text. The rebuilt button looks the same, so there is no
  intended visual difference left in the header.
- **Compared against the live site with headless Edge** at 1280 px and 390 px, light and dark:
  every section has the same size and position within 1 px. Known differences: the footer has
  three links and no Kickstart line; the FAQ chevrons are drawn in the text colour, so they are
  visible in dark appearance (live: near-black on dark grey); the lightbox heading is the
  caption.
- **The header is not sticky today and stays that way.** `position: sticky` sits on the `<nav>`
  inside a `<header>` of the same height, so it scrolls away on the live site; the rebuild keeps
  that markup and behaviour.
- **`section` and `footer` elements** replace the generic `div`s; alternating section
  backgrounds are set per section instead of through `:nth-of-type`.
- **Extra check in `check-dist.mjs`:** a link with a fragment (`/#faq`) must point at an id that
  exists on the target page, and `data-full` (the lightbox original) is checked like `href`.
- **`@types/node` is pinned to `^22`** to match `.nvmrc`; npm would have installed 26.
- **`astro dev` picks the next free port** when 4321 is taken and prints the URL it uses.

### Phase 2 (2026-10-02)

- **Privacy text verified against the live page element by element:** the only differences are
  the two "TVGraphs" spellings. Layout is identical at 1280 px and 390 px in both appearances.
- **`code` keeps today's rendering:** full font size and Bootstrap's pink `#d63384` in both
  appearances, as measured on the live page.
- **The 404 page has no canonical link and no `og:url`;** `Base` leaves both out when `noindex`
  is set.
- **The feed drops two unused XML namespaces** (`dc`, `content`) along with the `generator`.
- **The sitemap has no `<priority>`** any more, as planned.

### Phase 3 (2026-10-02)

- **Press text verified against the live page element by element:** identical. At 1280 px every
  section has the size and position it has today.
- **The press content keeps its 1200 px width, with a gutter on narrow windows.** Today
  `.press-main` overrides the container padding with 0, so the text touches the window edge on
  a phone. The rebuild uses `width: min(1200px, 100% - 3rem)`: unchanged at 1280 px, 24 px
  gutter at 390 px. Using the shared container instead would have narrowed the page to 1120 px
  and turned the gallery from five columns into four.
- **The facts table wraps the App Store address on a phone** (`overflow-wrap: anywhere`); today
  it makes the page scroll sideways.
- **Release updated after Peter's confirmation:** the framed ZIP (13,783,476 bytes) is an asset
  of `press-kit-en-US`, the release is titled "Press kit — screenshots (en-US)" and its notes
  name both archives; the ZIP is removed from the repository.

### Phase 4 (2026-10-02)

- **`check:live` compares every image** in `src/assets/images/` byte for byte, not only the
  subset the plan lists, and it checks that both archives answer 200 at the release.
- **The memory is rewritten as `tv-graphs-site-is-astro.md` already,** worded for the state
  before the cutover (branch `astro`, not pushed); it gets its final wording after the merge.
- **Preview deployment:** after Peter changed the build settings, the first push of `astro`
  built on Cloudflare Pages in about a minute, and `check:live` against
  `https://astro.tv-graphs-web.pages.dev` passes all 42 checks. Changing the settings of the
  existing project in place worked; production kept serving the old deployment meanwhile.
- **Cutover on 2026-10-02:** Peter confirmed the preview and the merge; pull request #1 was
  merged with a merge commit and production deployed about a minute later.
- **`check:live` against `https://tv-graphs-web.pages.dev` after the merge:** 41 of 42 passed.
  `/css/styles.css` still answered 200, served from Cloudflare's edge cache
  (`cf-cache-status: HIT`, `s-maxage=604800`); with a query string the same path answers 404.
  The script now asks for its 404 paths with a query string, and then all 42 pass.
- **Custom domain:** this Mac's system DNS does not resolve `tvgraphs.peterkurzok.de`, so the
  script cannot reach it (it now says so instead of crashing). Checked with
  `curl --resolve …:172.66.47.165` instead: new homepage with "Press Kit" and "More Apps" and
  without the Kickstart line, 308, 301, 302, 200 and 404 as in the contract.
- **`git grep` for "kickstart|ignite" outside `docs/`** prints nothing. For that,
  `check-dist.mjs` assembles the two names from parts and reports "no trace of the old
  generator in N text files".
- **Memories:** `tv-graphs-site-is-astro.md` has its final wording, and
  `reference_kickstart_mcp.md` in the TVGraphs project says the website left Kickstart.
- **Still open:** the sentence in `TVGraphs/docs/aso/README.md` (waits for Peter's go-ahead to
  commit in that repository) and Peter's look at the privacy link in the app's Settings.
- **Trial run against today's site** (`tv-graphs-web.pages.dev`): 36 of 42 checks pass. The six
  failures are the ones the migration fixes: framed ZIP not yet a redirect and not yet a release
  asset, `/privacy.html` and `/press.html` answering 200, unknown paths answering 200.

### Feedback after Phases 1 to 3 (2026-10-02)

- **Peter confirmed all manual checks of Phases 1 to 3,** including the released wording.
- **Fourth footer link on Peter's request:** "More Apps", leading to `https://apps.peterkurzok.de`.

## References

- Live behaviour measured on 2026-10-02 with `curl` against Cloudflare Pages
  (`tv-graphs-web.pages.dev`, IP 172.66.47.165)
- Astro: [configuration reference](https://docs.astro.build/en/reference/configuration-reference/),
  [project structure](https://docs.astro.build/en/basics/project-structure/),
  [endpoints](https://docs.astro.build/en/guides/endpoints/),
  [images](https://docs.astro.build/en/guides/images/),
  [install](https://docs.astro.build/en/install-and-setup/) (Astro 7.3.5, Node >= 22.12)
- Cloudflare Pages: [Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/),
  [serving pages](https://developers.cloudflare.com/pages/configuration/serving-pages/),
  [redirects](https://developers.cloudflare.com/pages/configuration/redirects/),
  [limits](https://developers.cloudflare.com/pages/platform/limits/),
  [build image](https://developers.cloudflare.com/pages/configuration/build-image/),
  [Workers migration matrix](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- Theme candidates evaluated: [AstroWind](https://github.com/arthelokyo/astrowind),
  [Foxi](https://github.com/oxygenna-themes/foxi-astro-theme),
  [ScrewFast](https://github.com/mearashadowfax/ScrewFast),
  [Astroship](https://github.com/surjithctly/astroship),
  [mobile-app-landing-template](https://github.com/sofiyevsr/mobile-app-landing-template)
- App repository: `TVGraphs/docs/aso/README.md:173-180`,
  `TVGraphs/docs/aso/metadata/fields.json:18-20`,
  `TVGraphs/Packages/Features/TVGraphsFeatures/Sources/SettingsFeature/TVGraphsSettingsConfiguration.swift:34`
- Historical context, left unchanged:
  `TVGraphs/docs/agents/plans/2026-08-24-settings-and-launch-prep.md` (Phase 5 created the
  Kickstart site)
- Release holding the press archives:
  <https://github.com/pkurzok/TV-Graphs-Web/releases/tag/press-kit-en-US>
