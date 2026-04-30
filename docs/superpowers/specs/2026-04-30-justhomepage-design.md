# justHomePage Design Spec

## Goal

Create a fast, minimal browser homepage with multi-provider search, favorites, configurable backgrounds, and draggable widgets.

## Architecture

Next.js App Router renders a client-heavy homepage. Zustand owns instant browser state. API routes and a libSQL-compatible SQLite schema are present as persistence boundaries for future durable sync.

## UX

The homepage opens directly to the working surface: a compact header, large search, favorites, and widget workspace. Settings live in a drawer so the normal state remains calm.

## Testing

Vitest covers search utilities and store behavior. Playwright smoke tests cover homepage load, search, and background change.
