// Verifies the build output in dist/ against the URL contract of the site.
// Run through `npm run check`; uses Node built-ins only.
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = 'dist';
const imageSource = 'src/assets/images';
const sizeLimit = 25 * 1024 * 1024; // Cloudflare Pages rejects larger files.

const badgeFiles = { preorder: 'app-store-preorder', released: 'app-store-download' };

const screenshots = [
  'appletv-03-popular.jpg',
  'iphone-01-chart.jpg',
  'iphone-02-combined.jpg',
  'iphone-03-popular.jpg',
  'iphone-04-favorites.jpg',
  'iphone-05-recommendations.jpg',
  'mac-03-popular.jpg',
  'visionpro-03-popular.jpg',
];
const badges = ['app-store', 'apple-tv', 'mac-app-store'].flatMap((store) =>
  ['download', 'preorder'].flatMap((kind) => ['black', 'white'].map((tone) => `${store}-${kind}-${tone}.svg`)),
);
const site = 'https://tvgraphs.peterkurzok.de';
const release = 'https://github.com/pkurzok/TV-Graphs-Web/releases/download/press-kit-en-US';
const archives = ['TV-Graphs-Raw-Screenshots-en-US.zip', 'TV-Graphs-Framed-Screenshots-en-US.zip'];
const expectedRedirects = [
  ...archives.map((archive) => [`/press/${archive}`, `${release}/${archive}`, '302']),
  ['/privacy.html', '/privacy/', '301'],
  ['/press.html', '/press/', '301'],
];
const sitemapUrls = ['/', '/privacy/', '/press/'].map((page) => site + page);

const expectedFiles = [
  'index.html',
  'privacy/index.html',
  'press/index.html',
  '404.html',
  'feed.rss',
  'sitemap.xml',
  'robots.txt',
  'images/app-icon.png',
  'images/favicon.png',
  ...screenshots.map((file) => `images/screenshots/${file}`),
  ...badges.map((file) => `images/${file}`),
];

let failures = 0;
const pass = (message) => console.log(`✓ ${message}`);
const fail = (message) => {
  failures += 1;
  console.log(`✗ ${message}`);
};
const check = (ok, message, problem = '') => (ok ? pass(message) : fail(`${message}   ${problem}`.trimEnd()));

const walk = async (directory) => {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)));
};

if (!existsSync(dist)) {
  console.log(`✗ ${dist}/ does not exist; run the build first`);
  process.exit(1);
}

const files = await walk(dist);
const read = (file) => readFile(path.join(dist, file), 'utf8');

// Expected files
for (const file of expectedFiles) {
  check(files.includes(file), `${dist}/${file}`, 'missing');
}

// Images are published unchanged
for (const file of files.filter((file) => file.startsWith('images/'))) {
  const source = path.join(imageSource, file.slice('images/'.length));
  const identical =
    existsSync(source) && (await readFile(source)).equals(await readFile(path.join(dist, file)));
  check(identical, `${dist}/${file} (identical to source)`, existsSync(source) ? 'differs' : 'has no source');
}

// Redirects
const redirects = existsSync(path.join(dist, '_redirects'))
  ? (await read('_redirects'))
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split(/\s+/))
  : [];
const redirectSources = redirects.map(([source]) => source);
for (const [source, target, status] of expectedRedirects) {
  const rule = redirects.find(([candidate]) => candidate === source);
  check(
    rule?.[1] === target && rule?.[2] === status,
    `_redirects: ${source} -> ${target.replace('https://github.com/pkurzok/TV-Graphs-Web/', '')} ${status}`,
    rule ? `found "${rule.join(' ')}"` : 'rule missing',
  );
}

// Internal links
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const html = new Map(await Promise.all(htmlFiles.map(async (file) => [file, await read(file)])));
const pageFor = (pathname) => path.join(pathname, pathname.endsWith('/') ? 'index.html' : '').replace(/^\//, '');

let links = 0;
const linkProblems = [];
for (const [file, content] of html) {
  for (const [, , target] of content.matchAll(/\s(href|src|data-full)="([^"]*)"/g)) {
    if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) continue; // external
    links += 1;
    const [pathname, fragment] = target.split('?')[0].split('#');
    if (pathname && !pathname.startsWith('/')) {
      linkProblems.push(`${file}: "${target}" is not root-relative`);
      continue;
    }
    if (redirectSources.includes(pathname)) continue;
    const page = pathname ? pageFor(pathname) : file;
    if (!files.includes(page)) {
      const isPage = !path.extname(pathname) && files.includes(pageFor(`${pathname}/`));
      linkProblems.push(
        isPage ? `${file}: "${target}" must end with "/"` : `${file}: "${target}" does not resolve`,
      );
      continue;
    }
    if (fragment && !html.get(page)?.includes(`id="${fragment}"`)) {
      linkProblems.push(`${file}: "${target}" points at a missing id`);
    }
  }
}
linkProblems.forEach(fail);
if (linkProblems.length === 0) pass(`${links} internal links resolve`);

// No trace of the old generator. Its two names are assembled here, so that searching the
// repository for them finds nothing either.
const oldGenerator = new RegExp(['kick' + 'start', 'ign' + 'ite'].join('|'), 'i');
const textFiles = files.filter((file) => /\.(html|xml|rss|txt|css|js)$/.test(file));
const tainted = [];
for (const file of textFiles) {
  if (oldGenerator.test(await read(file))) tainted.push(file);
}
check(
  tainted.length === 0,
  `no trace of the old generator in ${textFiles.length} text files`,
  `found in ${tainted.join(', ')}`,
);

// File size
const sizes = await Promise.all(files.map(async (file) => (await stat(path.join(dist, file))).size));
const largest = Math.max(...sizes);
check(
  largest <= sizeLimit,
  `largest file ${(largest / 1024 / 1024).toFixed(1)} MiB (limit 25 MiB)`,
  files[sizes.indexOf(largest)],
);

// Homepage
const index = html.get('index.html') ?? '';
const status = (await readFile('src/data/site.ts', 'utf8')).match(/^\s*status:\s*'(\w+)'/m)?.[1];
const badge = badgeFiles[status];
check(
  badge !== undefined && ['black', 'white'].every((tone) => index.includes(`/images/${badge}-${tone}.svg`)),
  `index.html shows the badge for status "${status}"`,
  badge ? `${badge}-{black,white}.svg not referenced` : 'unknown status in src/data/site.ts',
);
for (const id of ['features', 'faq', 'download']) {
  check(index.includes(`id="${id}"`), `index.html has id "${id}"`, 'missing');
}

// Sitemap and feed
const sitemap = files.includes('sitemap.xml') ? await read('sitemap.xml') : '';
const locations = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, location]) => location);
check(
  locations.length === sitemapUrls.length && sitemapUrls.every((url) => locations.includes(url)),
  `sitemap.xml lists exactly ${sitemapUrls.length} URLs`,
  `found ${locations.join(', ') || 'none'}`,
);
const feed = files.includes('feed.rss') ? await read('feed.rss') : '';
check(feed.includes(`<atom:link href="${site}/feed.rss"`), 'feed.rss links to itself', 'atom:link missing');

// Privacy policy
const privacy = html.get('privacy/index.html') ?? '';
check(
  privacy.includes(`<link rel="canonical" href="${site}/privacy/"`),
  'privacy/index.html has its canonical URL',
  'missing',
);
check(
  privacy.includes('Last updated: 25 August 2026'),
  'privacy/index.html carries its "Last updated" date',
  'adjust this check when the policy changes',
);
check(!privacy.includes('TVGraphs'), 'privacy/index.html spells the app "TV Graphs"', 'found "TVGraphs"');
for (const anchor of ['/#features', '/#faq', '/#download']) {
  check(privacy.includes(`href="${anchor}"`), `privacy/index.html navigation links to ${anchor}`, 'missing');
}

// Press kit
const pressPage = html.get('press/index.html') ?? '';
for (const id of ['downloads', 'facts', 'contact']) {
  check(pressPage.includes(`id="${id}"`), `press/index.html has id "${id}"`, 'missing');
}
for (const target of [...archives.map((archive) => `/press/${archive}`), '/images/app-icon.png']) {
  check(pressPage.includes(`href="${target}"`), `press/index.html links ${target}`, 'missing');
}
const zips = files.filter((file) => file.endsWith('.zip'));
check(zips.length === 0, 'no ZIP archive in the build', `found ${zips.join(', ')}`);

if (failures > 0) {
  console.log(`${failures} ${failures === 1 ? 'check' : 'checks'} failed.`);
  process.exit(1);
}
console.log('All checks passed.');
