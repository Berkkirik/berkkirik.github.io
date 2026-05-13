# berkkirik.github.io

Personal site of Berk Kirik. Built with [Astro](https://astro.build), deployed to GitHub Pages via GitHub Actions.

Live at: <https://berkkirik.github.io>

## Stack

- **Astro** — static site generator, ships ~0 JS by default
- **JetBrains Mono** (self-hosted via `@fontsource/jetbrains-mono`)
- **@astrojs/sitemap** + **@astrojs/rss** — sitemap + blog RSS feed
- **No CSS framework** — hand-rolled CSS in `src/styles/global.css` with CSS custom properties

## Quick start

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # build to ./dist
npm run preview  # serve the built site locally
```

Requires Node 22.12+ (specified in `package.json`).

## Where to edit things

| What you want to change       | File                                                 |
| ----------------------------- | ---------------------------------------------------- |
| Name, bio, nav links, socials | `src/config.ts`                                      |
| About page copy               | `src/pages/index.astro`                              |
| Projects list                 | `src/pages/projects.astro` (edit the `projects` array) |
| Resume page summary           | `src/pages/resume.astro`                             |
| Replace resume PDF            | `public/berk_kirik_cv.pdf`                           |
| Theme colors / fonts          | `src/styles/global.css` (CSS variables in `:root`)   |

## Add a blog post

Create a new markdown file in `src/content/blog/`:

```sh
touch src/content/blog/my-new-post.md
```

Frontmatter schema (see `src/content.config.ts`):

```markdown
---
title: "Post title"
description: "Optional one-line description for the index + RSS."
pubDate: 2026-05-13
updatedDate: 2026-06-01   # optional
tags: ["astro", "notes"]  # optional
draft: false              # optional; drafts are hidden in production
---

Your post content here, in Markdown.
```

The filename (without `.md`) becomes the URL slug: `my-new-post.md` → `/blog/my-new-post/`.

## Deployment (one-time setup)

1. Create an **empty** repo on GitHub named exactly `berkkirik.github.io` — no README, no .gitignore.
2. From this directory:

   ```sh
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:berkkirik/berkkirik.github.io.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The workflow at `.github/workflows/deploy.yml` runs automatically on every push to `main`.
5. After ~60 seconds the site is live at <https://berkkirik.github.io>.

## Project structure

```
.
├── .github/workflows/deploy.yml  GitHub Pages deploy
├── astro.config.mjs              Site URL + integrations
├── public/                       Static assets served as-is (favicon, CV PDF)
├── src/
│   ├── config.ts                 Personal info (single source of truth)
│   ├── content.config.ts         Blog collection schema
│   ├── content/blog/             Markdown blog posts
│   ├── layouts/Layout.astro      Shared HTML shell (head, nav, footer)
│   ├── pages/
│   │   ├── index.astro           About / homepage
│   │   ├── projects.astro        Projects list
│   │   ├── resume.astro          Resume + contact
│   │   ├── rss.xml.js            RSS feed endpoint
│   │   └── blog/
│   │       ├── index.astro       Blog index
│   │       └── [...slug].astro   Individual post template
│   └── styles/global.css         All site CSS (terminal/monospace theme)
└── package.json
```

## Custom domain (optional, later)

1. Add a `CNAME` file in `public/` containing your domain (no protocol):
   ```
   yourdomain.com
   ```
2. Update `site` in `astro.config.mjs` to `https://yourdomain.com`.
3. Configure DNS at your registrar:
   - **Apex** (`yourdomain.com`): `A` records to GitHub's IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
   - **Subdomain** (`www.yourdomain.com`): `CNAME` to `berkkirik.github.io`.
4. On GitHub: **Settings → Pages → Custom domain** → enter your domain → enable **Enforce HTTPS** once DNS propagates.
