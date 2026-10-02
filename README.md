# TV Graphs website

The source of <https://tvgraphs.peterkurzok.de>: the homepage, the privacy policy and the press
kit of the TV Graphs app. It is an [Astro](https://astro.build) project that builds to static
files; this repository is the only source of the site.

## Requirements

- Node 22 (`.nvmrc`)
- `npm ci` once after cloning

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Serves the site locally with live reload, by default at <http://localhost:4321/> |
| `npm run build` | Type-checks the project and builds the site into `dist/` |
| `npm run check` | Builds, then verifies `dist/`: expected files, images, links, file sizes |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run check:live -- <base-url>` | Verifies a deployed site against the URL contract below |

Run `npm run check` before pushing. It prints one line per check and fails when a link dangles
or a published file is missing.

## Where content lives

| Content | File |
|---|---|
| Hero, highlights, features, FAQ, download text, navigation, footer | `src/data/site.ts` |
| Screenshot list with alt texts and captions | `src/data/site.ts` (`screenshots`) |
| Privacy policy | `src/pages/privacy.md` |
| Press kit: lead, download cards, facts, contact | `src/data/site.ts` (`press`) |
| Press kit: about, developer, usage notes | `src/data/press/*.md` |
| Redirects | `public/_redirects` |
| 404 page | `src/pages/404.astro` |
| `robots.txt` | `public/robots.txt` |
| Markup of a section | `src/components/` |
| Page frame: `<head>`, header, footer | `src/layouts/Base.astro` |
| Styles | `src/styles/site.css` |

A FAQ entry, a feature text or a footer link is one edit in `src/data/site.ts`.

## Switching from pre-order to released

Set `app.status` in `src/data/site.ts` from `'preorder'` to `'released'`. The App Store badge,
the download text and the launch wording of the press kit follow that value; both wordings are
already in the file.

## Editing the privacy policy

The policy is `src/pages/privacy.md`, plain Markdown. When the wording changes, update the
"Last updated" line at the top of the text and the date that `scripts/check-dist.mjs` expects.
The app links to `/privacy/`, so the path must stay.

## Images

Originals live in `src/assets/images/` and exist only there.

- They are published unchanged under `/images/…` by `src/pages/images/[...file].ts`. These URLs
  are linked from outside, so do not rename files.
- The pages show smaller variants that Astro derives from the same originals at build time.
- A new screenshot is a file in `src/assets/images/screenshots/` plus an entry in `screenshots`
  in `src/data/site.ts`.

## Press archives

The two screenshot archives are not in this repository. They are assets of the GitHub release
[`press-kit-en-US`](https://github.com/pkurzok/TV-Graphs-Web/releases/tag/press-kit-en-US), and
`public/_redirects` sends `/press/TV-Graphs-Framed-Screenshots-en-US.zip` and
`/press/TV-Graphs-Raw-Screenshots-en-US.zip` there.

To replace an archive, build the ZIP from the app repository (`TVGraphs/Screenshots/screenshots/en-US`
for the framed images, `TVGraphs/Screenshots/raw-screenshots/en-US` for the raw ones) under the
same file name and upload it:

```sh
gh release upload press-kit-en-US TV-Graphs-Framed-Screenshots-en-US.zip --clobber -R pkurzok/TV-Graphs-Web
```

If the size or the number of images changes, update the card text in `press.downloads`.

No file above 25 MiB may enter the build: Cloudflare Pages rejects it and the whole deployment
fails. `npm run check` fails for such a file and for any ZIP in `dist/`.

## Deployment

The Cloudflare Pages project `tv-graphs-web` builds the site itself; there is nothing to upload.

- A push to `main` deploys to <https://tvgraphs.peterkurzok.de>.
- Any other branch gets a preview at `https://<branch>.tv-graphs-web.pages.dev`.
- Build settings in the Cloudflare dashboard (Settings, Builds & deployments): build command
  `npm run build`, build output directory `dist`, environment variable `NODE_VERSION` = `22`
  for production and preview.
- A failed build shows up as the "Cloudflare Pages" check on the commit in GitHub; the log is in
  the Cloudflare dashboard. The live site keeps its last successful deployment.

Check a preview before merging, and production after:

```sh
npm run check:live -- https://<branch>.tv-graphs-web.pages.dev
npm run check:live -- https://tvgraphs.peterkurzok.de
```

Two things to know about the checks:

- Cloudflare's edge may keep answering for a deleted file from its cache for up to a week.
  `check:live` therefore asks for its 404 paths with a query string, which bypasses that cache.
- Where a machine's DNS does not resolve `tvgraphs.peterkurzok.de`, run the check against
  `https://tv-graphs-web.pages.dev`, which is the same deployment, and test the domain itself
  with `curl --resolve tvgraphs.peterkurzok.de:443:<Cloudflare IP> https://tvgraphs.peterkurzok.de/`.

### Rollback

In the Cloudflare dashboard open the Pages project, go to Deployments and choose "Rollback" on
an earlier deployment. That takes effect at once and needs no commit. Follow up by reverting
the offending commit on `main`, so that the next push does not bring the problem back.

## URL contract

These addresses are linked from the app, from App Store Connect or from press mails and must
keep working. `npm run check:live` tests every line.

| Address | Answer |
|---|---|
| `/`, `/privacy/`, `/press/` | 200 |
| `/privacy`, `/press`, `/index.html`, `/privacy/index.html`, `/press/index.html` | 308 to the form with a trailing slash |
| `/press/TV-Graphs-Framed-Screenshots-en-US.zip`, `/press/TV-Graphs-Raw-Screenshots-en-US.zip` | 302 to the GitHub release |
| `/privacy.html`, `/press.html` | 301 to `/privacy/`, `/press/` |
| `/feed.rss`, `/sitemap.xml`, `/robots.txt` | 200 |
| every file in `src/assets/images/`, under `/images/…` | 200, identical bytes |
| anything else | 404 with the 404 page |
