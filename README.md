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

Run `npm run check` before pushing. It prints one line per check and fails when a link dangles
or a published file is missing.

## Where content lives

| Content | File |
|---|---|
| Hero, highlights, features, FAQ, download text, navigation, footer | `src/data/site.ts` |
| Screenshot list with alt texts and captions | `src/data/site.ts` (`screenshots`) |
| Markup of a section | `src/components/` |
| Page frame: `<head>`, header, footer | `src/layouts/Base.astro` |
| Styles | `src/styles/site.css` |

A FAQ entry, a feature text or a footer link is one edit in `src/data/site.ts`.

## Switching from pre-order to released

Set `app.status` in `src/data/site.ts` from `'preorder'` to `'released'`. The App Store badge and
the download text follow that value; both wordings are already in the file.

## Images

Originals live in `src/assets/images/` and exist only there.

- They are published unchanged under `/images/…` by `src/pages/images/[...file].ts`. These URLs
  are linked from outside, so do not rename files.
- The pages show smaller variants that Astro derives from the same originals at build time.
- A new screenshot is a file in `src/assets/images/screenshots/` plus an entry in `screenshots`
  in `src/data/site.ts`.
