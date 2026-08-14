# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Marketing/content website for H.E.A.R.T Beat Improv (Bangalore improv comedy community), built with Astro + Tailwind CSS, deployed to Netlify.

## Commands

Package manager is Bun (`bun.lock` present).

- `bun run dev` / `bun run start` — start Astro dev server
- `bun run build` — production build (runs `astro build`)
- `bun run preview` — preview the production build locally
- `bun run astro ...` — run arbitrary Astro CLI commands (e.g. `bun run astro check`)

There is no test suite, linter, or type-checker configured in this repo.

## Architecture

### Content is hardcoded JS, not Markdown/MDX

Despite `src/content.config.js` defining Astro content collections (`articles`, `events`) with Zod schemas, the actual content does **not** live as individual collection entries. Instead, all data is hardcoded as JS array literals:

- `src/content/events/all-events.js` — exports `allEvents` (one-off/dated events) and `regularEvents` (recurring weekly jams). Each object has `id`, `title`, `date`, `venue`, `price`, `category`, `level`, `fullDescription` (raw HTML string), etc.
- `src/content/articles/all-articles.js` — exports `allArticles`, same pattern, with `content` as a raw HTML string.

When adding an event or article, add an object to the relevant array in these files — do not create new files under `src/content/`.

### Slug scheme

`src/utils/slug.js` builds URLs as `{id}-{slugified-title}` (e.g. `1-improv-comedy-workshop`). `createFullSlug(id, title)` generates it, `extractIdFromSlug(slug)` parses the id back out. Detail pages (`src/pages/events/[slug].astro`, `src/pages/articles/[slug].astro`) use `getStaticPaths()` to statically pre-render one page per array entry via this slug, looking the item up from `all-events.js`/`all-articles.js` by matching the generated slug.

### Events: two categories merged

Event listing/detail pages combine `allEvents` (dated, e.g. workshops/showcases) and `regularEvents` (`date: "Every Saturday"`-style recurring jams) into a single list. Past-vs-upcoming state is derived at render time by comparing `new Date(event.date)` against `now` — recurring events with non-parseable dates (`"Every Saturday"`) will not evaluate as past. `event.fullDescription` is raw HTML injected via `set:html`, so keep it trusted/hand-authored, not user input.

### No component library — everything is inline in pages

`src/components/` exists but is currently empty; all markup lives directly in `.astro` files under `src/pages/` and in `src/layouts/BaseLayout.astro`. `BaseLayout.astro` is the single shared shell (head/meta/OG/Twitter tags, fonts, global nav/footer) — every page wraps its content in `<BaseLayout title=... description=... image=... type=...>`.

### Constants

`src/constants.js` centralizes contact info, external URLs (e.g. `URLS.REGISTRATION_FORM`, the Taplink registration form all "Register" CTAs point to), and SEO/org metadata. Prefer importing from here over hardcoding contact/URL strings in pages.

### Styling

Tailwind CSS (`tailwind.config.js`) with a small custom theme: brand colors `primary`/`secondary`/`dark`/`accent`, `font-display` (Poppins) for headings vs `font-sans` (Inter) for body text. `@tailwindcss/typography` is used for the `prose` classes wrapping article/event HTML content.

### SEO/deploy plumbing

`src/pages/sitemap.xml.js` and `src/pages/robots.txt.js` are generated dynamically from the same event/article data rather than via an Astro integration. Deployed via `@astrojs/netlify` adapter (`astro.config.mjs`); site URL is `https://heartbeatimprov.com`.
