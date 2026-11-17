# Repository Guidelines

## Project Structure & Module Organization

This is an Astro and Tailwind CSS website for H.E.A.R.T Beat Improv. Routes live in `src/pages/`; dynamic article and event pages use `[slug].astro`. Shared UI lives in `src/components/` and `src/layouts/BaseLayout.astro`. Global styles are in `src/styles/`, helpers in `src/utils/`, and shared URLs and contact details in `src/constants.js`. Static images and icons belong in `public/`.

Articles and events are JavaScript arrays in `src/content/articles/all-articles.js` and `src/content/events/all-events.js`. Add entries there and follow existing object fields. Slugs use an ID and title via `src/utils/slug.js`; preserve IDs when editing existing content. Sitemap and robots routes are generated in `src/pages/`.

## Build, Test, and Development Commands

Use Bun, as indicated by `bun.lock`:

- `bun install` installs dependencies.
- `bun run dev` starts the local Astro development server.
- `bun run build` builds the production site.
- `bun run preview` serves the production build locally.
- `bun run astro --help` lists Astro CLI commands.

## Coding Style & Naming Conventions

Follow the surrounding Astro and JavaScript style: two-space indentation, ES module imports, double-quoted strings, and semicolons. Use descriptive camelCase for JavaScript identifiers and PascalCase for Astro components. Keep route names consistent with existing lowercase paths. Prefer Tailwind utilities and the theme in `tailwind.config.js`; reuse constants instead of duplicating contact information or external URLs. No formatter or linter is configured.

## Testing Guidelines

There is no configured test suite or coverage requirement. Run `bun run build` after changes, then use `bun run preview` to check affected pages, links, and responsive layouts. For content changes, verify the relevant listing and detail page, including generated slugs.

## Commit & Pull Request Guidelines

Recent commits use short, plain-language subjects, such as `past events` and `Complete SEO & discoverability improvements: Phase 1-3`. Keep subjects concise and describe the change. Pull requests should explain the purpose and visible behavior, link relevant issues, list verification performed, and include screenshots for visual changes.

## Content & Configuration Safety

Event descriptions and article content contain HTML rendered by the site; keep it trusted and hand-authored. Do not commit secrets or local environment files. The site uses the Netlify adapter configured in `astro.config.mjs`.
