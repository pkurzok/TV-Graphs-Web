import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://tvgraphs.peterkurzok.de',
  // The Markdown texts keep their straight quotes.
  markdown: { smartypants: false },
});
