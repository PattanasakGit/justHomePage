# Requirements

> Version: **v2** (renewed 2026-10-07). Supersedes prior MVP that included weather and widgets.  
> Status: **Signed by product owner** (desktop + mobile required).  
> Implementation: **v2 homepage shipped on `feat/homepage-v2`** (liquid glass UI; weather/widgets removed from homepage).  
> Demo reference: `docs/ui/demo-v2.html`

## Product Goal

A minimal, fast browser homepage for daily use — search and favorites first — on **desktop and mobile** (MacBook and iPhone as primary targets).

## MVP Features (v2)

### Search
- **Google-only** pill search bar (`Search Google` placeholder); no multi-provider picker or shortcut hints on the homepage.

### Favorites
- Favorite website list with add, edit, delete, and reorder.
- Default title/logo from website metadata when a URL is added.
- Optional custom brand-style icons after metadata defaults load.
- Letter-avatar fallback (colored plate + first letter) when no brand/metadata logo is selected.

### Folders / groups
- Organize favorites into folders or groups (e.g. All + user groups).
- Filter or switch group without leaving the homepage.

### Import / export
- Import bookmarks from a common browser export format.
- Export current favorites (and groups) for backup/portability.
- Entry points visible in UI (not buried).

### Theme and wallpaper
- Theme color separated from wallpaper image.
- Theme catalog with light/dark moods; readable contrast over themes and wallpapers.
- Controls for primary/accent color and text contrast as needed for readability.
- Upload local wallpaper (compress for browser storage), preview, and remove without changing theme color.
- When wallpaper is present, it is the visible page background; theme controls system colors.

### Calm empty state
- When the user has no favorites yet, show a calm, uncluttered empty state (short copy + clear Add / Import actions only).

### Persistence
- Local-first: Zustand (or equivalent client persist) is the live source of truth for MVP.
- API + libSQL scaffold may remain in the repo but is **not** required to hydrate the UI in v2 MVP.

## Explicitly out of scope (v2 MVP)

- Weather / location temperature.
- Widgets workspace (clock, date, notes, quick-links widgets, drag widget board).
- Cloud sync / accounts.
- Heavy third-party integrations (Gmail, Calendar, Spotify, etc.).
- Multi-page cloud workspaces (start.me-style).

## Non-Functional Requirements

- **Responsive:** first-class **desktop and mobile** layouts (usable at ~375px width and at desktop widths). Tap targets ≥44px on mobile.
- First screen is the usable app, not a marketing landing page.
- Fast startup; core UI usable without network.
- Accessible labels for icon-only controls.
- Package manager and scripts: Bun (`bun install`, `bun run dev`, `bun run test`, `bun run typecheck`, `bun run build`).
- Theme tokens preferred over hardcoded white/black text fills (see `docs/ui` / knowledge rules).

## Keep / Drop / Add (decision log)

| Decision | Items |
|----------|--------|
| Keep | Search, favorites CRUD/reorder/icons, theme/wallpaper, local persist, desktop+mobile |
| Add | Folders/groups, import/export, calm empty state |
| Drop (v2) | Weather, widgets |
| Defer | Cloud sync, heavy integrations, DB hydration of UI |

## Related artifacts

- UX demo: `docs/ui/demo-v2.html`
- Knowledge rules: `docs/agents/knowledge-rules.md`

## Tech decisions (v2)

- UI components: **shadcn/ui** (owned copies in-repo), customized to product tokens — not a locked vendor theme.
- Stack: Next 16, React 19, Tailwind 4, shadcn/ui, Zustand, Bun, Vitest/Playwright.

## Customization (v2 — signed)

Direction: **beautiful, minimal, fast/light**, with **free personalization** within bounded axes.

### In MVP
- Theme light/dark + accent colors
- Wallpaper upload/remove
- Font set (limited curated options)
- UI transparency / text contrast strength
- Favorite tile size + grid density
- Show/hide non-essential chrome where it keeps the page calm

### Deferred
- Custom CSS escape hatch
- Multi-page layouts
- Widget plugins / heavy integrations

## UI / IA decisions (signed 2026-10-07 evening)

- Visual reference: Apple.com web techniques + flat layered glass (not 3D).
- Search: **Google only** (remove multi-provider UI).
- Typography: **Mitr** (Thasadith optional); chrome icons: **Phosphor** Light/Regular.
- Favorite icons: squircle plates; prefer site metadata / apple-touch, then SVG, then letter-avatar.
- Navigation: **toggleable sidebar** (desktop collapse + mobile full-screen) for Library — folders, add folder, add bookmark (folder optional / None).
- Settings: redesigned grouped layout; icon size presets S–XL.
- No cluttered folder rail / + strip on main canvas; no harsh double horizontal bars.
- Spec of record: `docs/ui/demo-v2.html` + `docs/ui/ui-design.md`.
