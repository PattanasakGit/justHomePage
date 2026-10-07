# Test Plan

> Last verified against codebase: 2026-10-07 (branch `feat/homepage-v2`).

## Unit (present under `src/**/*.test.ts`)

- Search URL generation, provider registry, shortcuts.
- Store: favorites CRUD/reorder; folders add/rename/remove/filter; import/export bookmarks; chrome/density/contrastStrength/appearance; wallpaper; font; theme controls.
- Bookmarks Netscape HTML export/import and round-trip.
- Theme CSS variables (blur/surface-alpha), readable text pairs + contrast strength, auto contrast resolution.
- Letter-avatar, site-metadata, image luminance, URL helpers.
- Weather helper unit tests remain (API unused by homepage UI).

## Component (planned)

- Search bar provider selection and submit.
- Favorite tile + folder tabs.
- Customize sheet axes (appearance, accent, density, chrome, wallpaper).
- Empty state Add / Import.
- Drag start adds `dnd-active`; end/cancel removes it.

## E2E (`tests/e2e/home.spec.ts`)

- Homepage loads; search navigates with encoded query.
- Customize sheet opens; Dark appearance sets `data-theme="dark"`.

## Commands

- Install: `bun install`
- Unit: `bun run test`
- Typecheck: `bun run typecheck`
- Build: `bun run build`
- E2E: `bun run test:e2e`

## Accessibility

- Icon-only buttons have names; search labeled; focus rings visible.
- Customize sheet uses dialog/sheet semantics; folder tabs use `role="tab"`.
