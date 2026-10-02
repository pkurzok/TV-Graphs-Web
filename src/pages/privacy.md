---
layout: ../layouts/Prose.astro
title: Privacy Policy
description: "What TV Graphs sends from your device, to whom, and when: no accounts, no analytics, no tracking."
path: /privacy/
---

# Privacy Policy

*Last updated: 25 August 2026*

TV Graphs has no accounts, no login, and no server of my own. I do not collect, receive, or store any personal data about you. There is no analytics, no crash reporting, no advertising, and no third-party SDK that phones home — the app ships with zero remote code dependencies.

That said, the app is not silent: it talks to The Movie Database to fetch series data, and — if you use them — to Apple for iCloud sync and recommendations. This page explains exactly what leaves your device, and when.

## The Movie Database (TMDB)

All series information comes from TMDB. When you use the app it contacts two hosts:

- `api.themoviedb.org` — for searches, the popular list, and series and season details
- `image.tmdb.org` — for poster images

What is sent is the search text you type and the numeric identifiers of the series you open. No account, no device identifier, and nothing that identifies you personally is attached. As with any request over the internet, TMDB’s servers do see your IP address and the usual technical connection data; that happens between you and TMDB, and I neither receive nor store it.

Legal basis: Art. 6(1)(b) GDPR — sending a query to TMDB is what makes the app do the thing you asked it to do.

TMDB’s own privacy policy: <https://www.themoviedb.org/privacy-policy>

This product uses the TMDB API but is not endorsed or certified by TMDB.

## iCloud sync of your favourites

Your favourites are stored on your device and, if you are signed in to iCloud with iCloud Drive enabled, synced to your other devices through Apple’s CloudKit.

They sync through your **private** CloudKit database. That is your personal iCloud storage: I have no access to it, cannot read it, and receive no copy. Apple sends a silent push notification to your devices to tell them something changed — which is why the app declares a background mode for remote notifications.

Each favourite holds the TMDB series identifier, its title, its poster path, its first air date, and the times it was added and last refreshed. Nothing else.

If you do not use iCloud, favourites simply stay on the device. Deleting a favourite in the app removes it everywhere it synced.

Legal basis: Art. 6(1)(b) GDPR. Apple’s privacy policy: <https://www.apple.com/legal/privacy/>

## Recommendations (Apple Private Cloud Compute)

The Recommendations tab is optional and only appears when your device supports it. It requires iOS 27 or macOS 27 and Apple Intelligence, and it needs at least three favourites before it will do anything.

When you open it, the **titles and first-air years of your favourite series** are sent to Apple Intelligence running on **Private Cloud Compute** to generate suggestions. Nothing else about you is sent — no identifier, no favourites list beyond those titles, no usage history.

Private Cloud Compute is Apple’s server-side extension of Apple Intelligence. Apple states that data sent to it is used only to fulfil the request, is not retained, and is not accessible to Apple. I never see the request or the response.

There is no on-device fallback: if Private Cloud Compute is unavailable, the feature simply says so. If you never open the Recommendations tab, nothing is ever sent to Apple this way.

Legal basis: Art. 6(1)(b) GDPR. Apple’s description of Private Cloud Compute: <https://security.apple.com/blog/private-cloud-compute/>

## What is stored on your device

- **Favourites** — as described above.
- **Cached recommendations** — kept for at most **30 days**, then discarded automatically. This cache is local to the device and is not synced to iCloud. You can clear it at any time in Settings ▸ Recommendations.
- **The title, poster and first air date of each favourite** — re-read from TMDB on the same **30-day** cycle, so stored TMDB data never grows stale and is never kept indefinitely.
- **Two display preferences** — whether to show the chart trend line, and the chart layout.

Deleting the app removes everything stored on the device. Favourites already synced to iCloud are removed by deleting them in the app, or through your iCloud settings.

## No tracking

To be explicit, because “we value your privacy” pages rarely are:

- no analytics or usage statistics of any kind
- no crash or diagnostic reporting to me
- no advertising and no advertising identifier
- no cookies, no fingerprinting, no profiling
- no third-party SDK embedded in the app

I cannot tell how many people use the app, which series they look at, or whether they open it at all.

## Your rights

Under the GDPR you have the right to access the personal data held about you (Art. 15), have inaccurate data corrected (Art. 16), have it erased (Art. 17), have processing restricted (Art. 18), receive it in a portable format (Art. 20), and object to processing based on legitimate interest (Art. 21).

In practice there is little for me to act on, because I hold no personal data about you. Data held by Apple in your private iCloud database is under your own control, and requests concerning data held by Apple or TMDB should go to them directly.

You also have the right to lodge a complaint with a supervisory authority, normally the data protection authority of the German state in which I am established.

## Children

TV Graphs is not directed at children and collects no data from anyone, children included.

## Changes to this policy

If this policy changes, the new version appears on this page with a new date at the top.

## Contact

Questions about this policy: [tvgraphs@peterkurzok.de](mailto:tvgraphs@peterkurzok.de)

The controller and the postal address required by § 5 DDG are given in the [imprint](https://apps.peterkurzok.de/imprint).
