# justHomePage

A fast personal browser homepage built with Next.js, Tailwind, Zustand, React Icons, API routes, and SQLite/libSQL boundaries.

## Local Development

```bash
bun install
bun run dev
```

Open `http://localhost:3000` and set it as the browser homepage.

## Verification

```bash
bun run test
bun run typecheck
bun run build
```

## Core Ideas

- Large multi-provider search with shortcuts such as `gh query`, `yt query`, and `d query`.
- Favorite websites as compact draggable tiles. Custom logo picker covers brand icons, ~60 neutral icons, and a letter-avatar fallback (search + categories + pagination).
- Workspace widgets: clock, date, notes, quick links, pomodoro, todo, weather, bookmark — free-placed on a 12-col grid (drag the header, resize from the corner). Each widget exposes a curated variants list (e.g. clock: square / banner / display) you pick from the `⋯` menu.
- Responsive: 12 cols on desktop, 8 on tablet, full-width single-column strips on mobile (`<640px`). Settings becomes a bottom sheet, favorite editor goes full-screen, widget bodies switch to landscape strips that fit a single row.
- Edit mode lets you reorder and hide the three top-level zones (Search / Favorites / Workspace).
- 28 theme bases grouped by Light/Dark and tagged by style; per-theme curated accent palette and themed range sliders.
- Auto text contrast samples wallpaper luminance and flips text color when needed.
- Zustand keeps the homepage instant. API and SQLite boundaries are scaffolded for durable persistence.

## Working with Claude

This project uses a 6-agent team under `.claude/agents/` orchestrated by `project-owner`. See [CLAUDE.md](CLAUDE.md) and [docs/agents/team-flow.md](docs/agents/team-flow.md) for the workflow recipes.

## Vercel Note

Local file SQLite is not durable on Vercel serverless. For deployment, set `DATABASE_URL` to a Turso/libSQL database and `DATABASE_AUTH_TOKEN` if required.
