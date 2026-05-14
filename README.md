# berkkirik.github.io

Personal site of Berk Kırık — Senior AI Engineer.

Live at <https://berkkirik.github.io>.

## Stack

- **Astro** — static site generator
- **Newsreader** (Production Type, via Fontsource) — display + body serif
- **JetBrains Mono** — metadata, code, tags
- Cream-paper editorial aesthetic; no JS shipped to the browser
- **GitHub Pages** + custom GitHub Actions workflow

## Local dev

```sh
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check (type validation)
npm run build    # production build → ./dist
npm run preview  # serve the built site
```

Requires Node 22.12+.

## Where to edit things

| Want to change…                 | Edit                                              |
| ------------------------------- | ------------------------------------------------- |
| Name, bio, nav, socials         | `src/config.ts`                                   |
| Homepage copy                   | `src/pages/index.astro`                           |
| `/now` page contents            | `src/pages/now.astro` (update `lastUpdated`)      |
| Projects list                   | `src/pages/projects.astro` (the `projects` array) |
| Resume content                  | `src/pages/resume.astro` (top of the file)        |
| Replace resume PDF              | `public/berk_kirik_cv.pdf`                        |
| Colors / type tokens            | `src/styles/global.css` (top `:root`)             |
| Default OG image                | re-run `python scripts/generate_og.py`            |

## Add a blog post

Create a new file in `src/content/blog/`:

```markdown
---
title: "Post title"
description: "Optional one-line description (used on the index and in RSS / OG)."
pubDate: 2026-05-15
updatedDate: 2026-06-01   # optional
tags: ["llm", "production"]   # optional
draft: false              # optional; drafts are hidden in prod
---

Body in Markdown. Reading time is computed automatically.
```

The filename (without `.md`) becomes the URL: `my-post.md` → `/blog/my-post/`.

Headings get auto-generated anchor links (rehype-autolink-headings).

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`:

1. **Type check** — `astro check` (fails fast on TS errors)
2. **Build** — `withastro/action@v6`
3. **Deploy** — `actions/deploy-pages@v4`

GitHub Pages is configured with `build_type: workflow` (the legacy Jekyll
build is disabled). A `.nojekyll` file in `public/` defends against
accidental Jekyll processing.

## What's in the SEO / sharing layer

- `robots.txt` pointing to the sitemap
- `sitemap-index.xml` (auto, via `@astrojs/sitemap`)
- `rss.xml` for the blog
- JSON-LD: `WebSite` on every page, `Person` on `/`, `Article` on each blog post
- Open Graph + Twitter Card image (`/og/default.png`, 1200×630)
- Per-page meta description + canonical URL

## Things you can do yourself

These are the next things worth doing that I can't do for you in code:

### 1. Add a photo

Drop a portrait at `public/photo.jpg` (or `.webp`), then add an `<img>` to
`src/pages/index.astro` between the README eyebrow and the headline.
Suggested size: 800×800, lossy-encoded.

### 2. Wire up analytics (no signup yet)

The site has no tracking. Two low-friction options when you want it:

- **Plausible** (paid, $9/mo, no cookies): sign up at <https://plausible.io>,
  then add a single `<script defer …>` line to `src/layouts/Layout.astro`.
- **GoatCounter** (free, no cookies): sign up at <https://www.goatcounter.com>,
  add their script the same way.

### 3. Custom domain

If you buy `berkkirik.com` (or similar):

1. Add `public/CNAME` containing the bare domain (no protocol).
2. Update `site` in `astro.config.mjs` to `https://berkkirik.com`.
3. DNS:
   - **Apex**: `A` records to GitHub's IPs (185.199.108.153 .109.153 .110.153 .111.153)
   - **Subdomain (`www`)**: `CNAME` to `berkkirik.github.io`
4. GitHub Pages → Settings → Pages → add the domain, enable HTTPS once DNS propagates.

### 4. Newsletter (when you want it)

Buttondown and Beehiiv both have a free tier. Sign up, then drop their
embed `<iframe>` or `<form>` somewhere — `/blog/` index is a natural fit
(small "subscribe" call near the RSS link).

### 5. Real blog content

The site has one placeholder post. Worth at least 2–3 real ones — that's
what gives a personal site its weight.

## Project layout

```
.
├── .github/workflows/deploy.yml   Type check + build + deploy
├── astro.config.mjs               site, sitemap, rehype plugins
├── public/
│   ├── og/default.png             1200×630 OG card (regenerable)
│   ├── robots.txt
│   ├── .nojekyll                  silences GitHub's legacy builder
│   ├── favicon.svg
│   └── berk_kirik_cv.pdf
├── scripts/generate_og.py         re-run to update OG image
├── src/
│   ├── config.ts                  single source of truth: name, nav, socials
│   ├── content.config.ts          blog collection schema
│   ├── content/blog/*.md          posts
│   ├── layouts/Layout.astro       head, masthead, footer, JSON-LD
│   ├── pages/
│   │   ├── index.astro            README home
│   │   ├── now.astro              /now (Sivers convention)
│   │   ├── projects.astro         2-column work grid
│   │   ├── resume.astro           structured CV
│   │   ├── 404.astro
│   │   ├── rss.xml.js             RSS feed
│   │   └── blog/
│   │       ├── index.astro        date · title · description list
│   │       └── [...slug].astro    article view
│   └── styles/global.css          all CSS (tokens, components, print)
├── package.json
└── tsconfig.json
```
