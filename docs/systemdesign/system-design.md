# System Design

> Last verified against codebase: 2026-10-07 (branch `feat/homepage-v2`).

## Stack

| Layer | Choice |
|-------|--------|
| Runtime / package manager | Bun |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui (owned copies), react-icons, lucide-react |
| Client state | Zustand 5 + `persist` (`localStorage`, key `justhomepage:v1`, version `5`) |
| DnD | `@dnd-kit/core` + `@dnd-kit/sortable` |
| DB boundary | `@libsql/client` (scaffold only; not hydrating UI in v2) |
| Unit tests | Vitest + Testing Library |
| E2E | Playwright |

Core rendering does not depend on network. Site-metadata remains an optional enhancement for favorite add.

## Architecture

```txt
src/app/page.tsx
  -> HomePage (client)
       -> Zustand useHomeStore (persist v5)
       -> SearchBar (multi-provider + shortcuts)
       -> Favorites grid + folders filter + empty state
       -> CustomizeSheet (appearance axes)
       -> FavoriteEditor (metadata + icons)
       -> import/export via Netscape HTML bookmarks

API scaffold (unused by homepage UI in v2):
  GET /api/favorites|widgets|settings|local-weather
```

## Directory Map

| Path | Role |
|------|------|
| `src/app` | Next layout, page, `globals.css` (liquid glass tokens), API routes |
| `src/components` | UI — homepage, search, settings/customize, icons; widgets kept but unused on homepage |
| `src/hooks` | Legacy weather hook (not used on homepage v2) |
| `src/stores` | Zustand home store + persist migration (folders, chrome, density, contrastStrength) |
| `src/features` | Feature services (scaffold) |
| `src/lib` | Pure helpers: search, theme, bookmarks import/export, url, letter-avatar, image-file, db |
| `src/data` | Defaults (favorites, folders, preferences) + `themeCatalog` |
| `tests/e2e` | Playwright smoke |
| `docs/ui/demo-v2.html` | Visual reference for liquid glass materials |

**Rule:** components must not import database code.

## Key Flows

### Search

1. User submits query in `SearchBar`.
2. `resolveSearchInput` may switch provider via leading shortcut token (e.g. `g cats`).
3. Provider picker lives inside the search bar dropdown.
4. `buildSearchUrl` navigates to the provider URL.

### Favorites / folders

- Favorites + folders live in Zustand; filter by `preferences.activeFolderId` (`null` = All).
- Reorder via `@dnd-kit` on the visible favorites list.
- Favorite editor may call `/api/site-metadata?url=` for title/favicon defaults.

### Import / export

- `src/lib/bookmarks.ts` encodes/decodes Netscape Bookmark HTML.
- Store actions `importBookmarks` / `exportBookmarks` create folders by name when needed.

### Theme / wallpaper / customize

- Axes: appearance light/dark, accent, font, transparency, blur, contrastStrength, density, chrome, wallpaper upload/clear.
- Liquid glass CSS: heavy frost (~40 blur) on search/sheet/chrome/empty; lighter (~20) on tiles.
- Honors `prefers-reduced-transparency` and `prefers-reduced-motion`; `@supports` fallback without backdrop-filter.
- Persist migration v4 → v5 fills new preference fields and `folderId` on favorites.

### Persistence

- **Canonical:** Zustand `persist` (favorites, folders, widgets retained unused, preferences).
- **Scaffolded:** SQLite/libSQL tables remain for a later sync phase.

## Out of scope on homepage (v2)

Weather UI, widget workspace UI. API routes may remain unused.
