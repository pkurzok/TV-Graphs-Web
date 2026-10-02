// All structured texts of the site. Longer prose lives in Markdown:
// src/pages/privacy.md and src/data/press/*.md.

export type LaunchStatus = 'preorder' | 'released';

export const app = {
  name: 'TV Graphs',
  tagline: 'Episode rating charts for every TV series.',
  author: 'Peter Kurzok',
  appStoreId: '6804961357',
  appStoreUrl: 'https://apps.apple.com/app/tv-graphs-season-ratings/id6804961357',
  // The one value to change on launch day.
  status: 'preorder' as LaunchStatus,
  badge: {
    preorder: { file: 'app-store-preorder', alt: 'Pre-order on the App Store' },
    released: { file: 'app-store-download', alt: 'Download on the App Store' },
  },
  downloadText: {
    preorder:
      'Available for pre-order now on the App Store — it arrives automatically on October 11 for iPhone, iPad, Mac, Apple TV and Apple Vision Pro. Free, with nothing to buy and nothing to subscribe to.',
    released:
      'Available now on the App Store for iPhone, iPad, Mac, Apple TV and Apple Vision Pro. Free, with nothing to buy and nothing to subscribe to.',
  },
};

// Entries starting with "#" are sections of the homepage.
export const nav = [
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Download', href: '#download' },
  { label: 'Imprint', href: 'https://apps.peterkurzok.de/imprint' },
];

export const navCta = { label: 'Get the app', href: '#download' };

export const footerLinks = [
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Terms of Service', href: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula' },
  { label: 'Press Kit', href: '/press/' },
];

export const social = [
  { icon: 'mastodon', label: 'Mastodon', href: 'https://kind.social/@filmaniac' },
  { icon: 'github', label: 'GitHub', href: 'https://github.com/pkurzok' },
] as const;

export const copyright = '© 2026 Peter Kurzok';

export const hero = {
  title: 'See the shape of a series',
  subtitle:
    'TV Graphs plots every episode of every season by its rating — the slow build, the golden run, and the season everyone warns you about, visible at a glance instead of buried in a list. Native on iPhone, iPad, Mac, Apple TV and Apple Vision Pro.',
};

export const sections = {
  highlights: {
    title: 'Why TV Graphs',
    description: 'A small, focused app that does one thing properly.',
  },
  features: {
    title: 'Features',
    description:
      'Built with SwiftUI for iPhone, iPad, Mac, Apple TV and Apple Vision Pro — one app, native on all five.',
  },
  screenshots: {
    title: 'A look inside',
    description:
      'One season at a time, the whole run combined with a trend line, what is popular right now, and your favourites.',
  },
  faq: { title: 'Questions' },
  download: { title: 'Get TV Graphs' },
};

export const highlights = [
  {
    title: 'Every episode, plotted',
    text: 'Per-season charts or one combined view of the whole run, with an optional trend line that shows the direction of travel.',
  },
  {
    title: 'No account, ever',
    text: 'No sign-up, no login, nothing to create. Free to use, with nothing to buy and nothing to subscribe to.',
  },
  {
    title: 'Private by construction',
    text: 'No analytics, no crash reporting, no advertising, and no third-party SDK. I run no server of my own, so there is nowhere for your data to go — I cannot tell whether you use the app at all.',
  },
];

export const features = [
  {
    icon: 'graph-up',
    title: 'Episode rating charts',
    text: 'Swift Charts plots every episode of every season. Switch between one chart per season and a single combined run, and select any point for the episode title and its exact rating.',
  },
  {
    icon: 'search',
    title: 'Search and discover',
    text: 'Search the full TMDB catalogue or browse what is popular right now, with posters, ratings and synopses — in your own language.',
  },
  {
    icon: 'heart-fill',
    title: 'Favourites that follow you',
    text: 'Star a series and it appears on your other devices through your private iCloud account. Favourites keep working with no network.',
  },
  {
    icon: 'stars',
    title: 'AI recommendations',
    text: 'Suggestions built from your own favourites by Apple Intelligence on Private Cloud Compute. Only the titles of your favourite series are ever sent. Needs iOS, iPadOS, macOS or visionOS 27 and Apple Intelligence — Apple TV has neither, so the feature is simply absent there.',
  },
  {
    icon: 'window-sidebar',
    title: 'Native on every device',
    text: 'Not a stretched phone app anywhere. A real sidebar on iPad, a real Settings window at Command-comma on the Mac, focus-driven posters and ten-foot type on Apple TV, and a layout built for the platform on Apple Vision Pro.',
  },
  {
    icon: 'universal-access',
    title: 'Accessible by default',
    text: 'Full VoiceOver labels on every chart point, Dynamic Type throughout, and Reduce Motion respected.',
  },
] as const;

export const faq = [
  {
    question: 'Where does the data come from?',
    answer:
      'All series, season and episode information comes from The Movie Database (TMDB), including the ratings the charts are drawn from. This application uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.',
  },
  {
    question: 'What does it cost?',
    answer:
      'Nothing. TV Graphs is free, and every feature is there from the moment you install it — there are no in-app purchases, no subscription, no trial and no advertising, on any device. Why free? The charts are drawn from The Movie Database, whose API is free to use non-commercially; charging for an app built on it would need a commercial licence agreement instead, and giving you the whole app is the better side of that bargain.',
  },
  {
    question: 'Do you collect any data about me?',
    answer:
      'No. There is no analytics, no crash reporting, no advertising identifier, and no third-party SDK in the app. I have no server, so there is nowhere for your data to go. The privacy policy sets out exactly what leaves your device and to whom.',
  },
  {
    question: 'How do favourites sync between my devices?',
    answer:
      "Through your own private iCloud account, using Apple's CloudKit. That storage is yours: I have no access to it and receive no copy. If you do not use iCloud, favourites simply stay on the device.",
  },
  {
    question: 'Why can I not see the Recommendations tab?',
    answer:
      "Recommendations run on Apple's Private Cloud Compute, which needs iOS, iPadOS, macOS or visionOS 27, supported hardware, and Apple Intelligence switched on. When any of that is missing the tab is hidden rather than shown broken — and the Settings screen explains which piece is missing. On Apple TV the tab never appears at all: tvOS ships no Apple Intelligence at any version. Everything else in the app works regardless.",
  },
  {
    question: 'What is sent to Apple for recommendations?',
    answer:
      'The titles and first-air years of your favourite series, and nothing else. It happens only when you open the Recommendations tab and have at least three favourites. Apple states that data sent to Private Cloud Compute is used only to fulfil the request and is not retained.',
  },
  {
    question: 'Which devices does it run on?',
    answer:
      "iPhone and iPad on iOS/iPadOS 26 or later, Mac on macOS 26 or later, Apple TV on tvOS 26 or later, and Apple Vision Pro on visionOS 26 or later. It is a single universal app, native on each rather than one platform's app stretched to fit the others.",
  },
];

// Files in src/assets/images/screenshots/, shared by the homepage carousel and the press gallery.
export const screenshots = [
  {
    file: 'iphone-01-chart.jpg',
    orientation: 'portrait',
    alt: 'A season at a time: every episode plotted by its rating, on iPhone',
    caption: 'A season at a time: every episode plotted by its rating, on iPhone.',
  },
  {
    file: 'iphone-02-combined.jpg',
    orientation: 'portrait',
    alt: 'The whole run combined into one chart, with a trend line',
    caption: 'The whole run combined into one chart, with a trend line.',
  },
  {
    file: 'iphone-03-popular.jpg',
    orientation: 'portrait',
    alt: 'What is popular right now, on iPhone',
    caption: 'What is popular right now.',
  },
  {
    file: 'iphone-04-favorites.jpg',
    orientation: 'portrait',
    alt: 'Your favourites, synced through your private iCloud account',
    caption: 'Your favourites, synced through your private iCloud account.',
  },
  {
    file: 'iphone-05-recommendations.jpg',
    orientation: 'portrait',
    alt: 'AI recommendations from your own favourites, on Private Cloud Compute',
    caption: 'AI recommendations from your own favourites, on Private Cloud Compute.',
  },
  {
    file: 'appletv-03-popular.jpg',
    orientation: 'landscape',
    alt: 'Ten-foot browsing with focus-driven posters on Apple TV',
    caption: 'Ten-foot browsing with focus-driven posters on Apple TV.',
  },
  {
    file: 'mac-03-popular.jpg',
    orientation: 'landscape',
    alt: 'What is popular right now, on the Mac',
    caption: 'Popular, on the Mac.',
  },
  {
    file: 'visionpro-03-popular.jpg',
    orientation: 'landscape',
    alt: 'A layout built for Apple Vision Pro',
    caption: 'A layout built for Apple Vision Pro.',
  },
] as const;

// The press kit. Its longer texts are src/data/press/*.md.
export const press = {
  title: 'Press Kit',
  lead: 'Episode rating charts for every TV series, native on iPhone, iPad, Mac, Apple TV and Apple Vision Pro. Free, with nothing to buy and nothing to subscribe to.',
  leadLaunch: {
    preorder: 'Launching on the App Store on 11 October 2026.',
    released: 'Available on the App Store since 11 October 2026.',
  },
  // The ZIP archives are assets of the GitHub release press-kit-en-US; public/_redirects
  // sends the /press/ URLs there.
  downloads: [
    {
      title: 'Framed screenshots',
      text: '23 framed images in Apple device bezels — iPhone, iPad, Mac, Apple TV and Apple Vision Pro (English). JPG, 14\u00a0MB.',
      href: '/press/TV-Graphs-Framed-Screenshots-en-US.zip',
      label: 'Download ZIP',
    },
    {
      title: 'Raw screenshots',
      text: '23 unframed, full-resolution captures straight from the device screens (English). PNG, 93\u00a0MB.',
      href: '/press/TV-Graphs-Raw-Screenshots-en-US.zip',
      label: 'Download ZIP',
    },
    {
      title: 'App icon',
      text: 'The TV Graphs app icon as PNG.',
      href: '/images/app-icon.png',
      label: 'Download PNG',
      download: 'TV-Graphs-App-Icon.png',
    },
  ] as { title: string; text: string; href: string; label: string; download?: string }[],
  downloadsNote:
    "Screenshots in German, Polish, Italian, Spanish and French — the app's other five languages — are available on request.",
  galleryNote: 'All 23 framed and 23 raw images are in the ZIP archives above.',
  facts: [
    {
      label: 'Launch',
      value: {
        preorder: '11 October 2026 on the App Store (available for pre-order now)',
        released: '11 October 2026 on the App Store',
      }[app.status],
    },
    { label: 'Price', value: 'Free — no in-app purchases, no subscription, no advertising' },
    {
      label: 'Platforms',
      value:
        'iPhone and iPad (iOS/iPadOS 26 or later), Mac (macOS 26 or later), Apple TV (tvOS 26 or later), Apple Vision Pro (visionOS 26 or later)',
    },
    { label: 'AI recommendations', value: 'Require iOS, iPadOS, macOS or visionOS 27 with Apple Intelligence' },
    { label: 'Languages', value: 'English, German, Polish, Italian, Spanish, French' },
    { label: 'App Store', value: app.appStoreUrl.replace('https://', ''), href: app.appStoreUrl },
    { label: 'Website', value: 'tvgraphs.peterkurzok.de', href: 'https://tvgraphs.peterkurzok.de' },
  ] as { label: string; value: string; href?: string }[],
  contact: {
    name: 'Peter Kurzok',
    email: 'tvgraphs@peterkurzok.de',
    // Shown below the address; nothing is shown once the app is released.
    note: {
      preorder: 'Review access before launch is available via TestFlight on request.',
      released: null,
    } as Record<LaunchStatus, string | null>,
  },
};

// The paths the sitemap lists.
export const pages = ['/', '/privacy/', '/press/'];
