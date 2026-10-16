# vaughanm-xyz

<https://vaughanm.xyz>

My personal site: projects and a blog. Built with SvelteKit, Skeleton and Tailwind CSS, and
prerendered into a fully static site that's deployed to GitHub Pages.

## Developing

```sh
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # static site in build/
npm run preview    # serve the built site
```

Checks (all run in CI; tests also run before every deploy):

```sh
npm run lint       # Prettier + ESLint
npm run check      # svelte-check (types)
npm test           # unit and component tests (Vitest); `npm run test:unit` to watch
```

## Content

### Blog posts

One markdown file per post in `src/lib/blog/`. The file name is the URL slug
(`002-alvr-config.md` → `/blog/002-alvr-config`).

```md
---
title: Configuring ALVR
description: An in depth guide to configuring ALVR
pubDate: 2025-03-01
tags: [vr]
---
```

`title` and `pubDate` are required. Markdown is GitHub-flavored, and headings get ids, so
`[Bitrate](#bitrate)` links work.

### Projects

One folder per project in `src/lib/projects/`, containing a `project.json` and any images it uses.
The folder name is the project's anchor (`/projects#polonium`).

```json
{
	"name": "Polonium v1.1",
	"description": "Tiling window management script for KDE Plasma",
	"codeLink": "https://github.com/zeroxoneafour/polonium",
	"deployLink": "https://polonium.vaughanm.xyz",
	"tags": ["linux"],
	"skills": ["typescript", "git"],
	"importance": 100,
	"startDate": "2026-05-23",
	"slides": [{ "src": "1.png", "alt": "Polonium Screenshot 1" }]
}
```

- `name` and `description` are required; everything else is optional.
- Dates: `date` for a one-day project, or `startDate` with an `endDate`. A missing `endDate` (or
  `"ongoing"`) means the project is ongoing; ongoing projects are listed under "Currently working on"
  on the home page.
- `importance` sorts the projects page (higher first); it defaults to 50.
- Slide `src` is a file relative to `project.json` (`1.png`, `shots/2.png`), a path from the site
  root for files in `static/` (`/images/a.png`), or a URL. URLs to images are shown as images; any
  other URL (e.g. a YouTube embed link) is embedded.

Invalid content (missing fields, bad dates, missing image files) fails the build with a message
naming the file.

## Theme

The look comes from the Skeleton theme in `src/themes/catppuccin-mauve.css` (Catppuccin Latte in light
mode, Frappé in dark mode, with mauve accents), activated by `data-theme` in `src/app.html`.
Components use Skeleton's theme tokens, so swapping the theme restyles the whole site.
