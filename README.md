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
- Favorite websites as compact draggable tiles.
- Drag-and-drop widgets for clock, date, notes, and quick links.
- Background themes with readable overlays.
- Zustand keeps the homepage instant. API and SQLite boundaries are scaffolded for durable persistence.

## Vercel Note

Local file SQLite is not durable on Vercel serverless. For deployment, set `DATABASE_URL` to a Turso/libSQL database and `DATABASE_AUTH_TOKEN` if required.
