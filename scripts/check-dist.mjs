// Verifies the build output in dist/ against the URL contract of the site.
// Run through `npm run check`; uses Node built-ins only.
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = 'dist';
const imageSource = 'src/assets/images';
const sizeLimit = 25 * 1024 * 1024; // Cloudflare Pages rejects larger files.

// Internal links that are allowed to dangle because a later phase adds their page.
const pending = ['/privacy/', '/press/'];

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
const expectedFiles = [
  'index.html',
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
    if (redirectSources.includes(pathname) || pending.includes(pathname)) continue;
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

// No trace of the old generator
const textFiles = files.filter((file) => /\.(html|xml|rss|txt|css|js)$/.test(file));
const tainted = [];
for (const file of textFiles) {
  if (/kickstart|ignite/i.test(await read(file))) tainted.push(file);
}
check(
  tainted.length === 0,
  `no "Kickstart" or "Ignite" in ${textFiles.length} text files`,
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

if (failures > 0) {
  console.log(`${failures} ${failures === 1 ? 'check' : 'checks'} failed.`);
  process.exit(1);
}
console.log('All checks passed.');
