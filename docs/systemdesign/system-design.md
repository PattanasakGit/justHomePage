# System Design

## Architecture

```txt
UI components
  -> Zustand store
    -> feature services / fetchers
      -> Next API routes
        -> feature services
          -> lib/db adapter
```

## Boundaries

- `src/components`: UI only.
- `src/hooks`: browser capability hooks such as geolocation, timezone, and weather synchronization.
- `src/stores`: client state and optimistic interactions.
- `src/features`: feature services and future validation.
- `src/lib/db`: SQLite/libSQL client, schema, migrations.
- `src/app/api`: thin route handlers.

## Persistence

The MVP uses Zustand `persist` for instant local browser state. The SQLite schema and routes are scaffolded so canonical persistence can be promoted feature by feature.

Preferences use separate fields for visual mode and media:

- `theme`: color theme id.
- `wallpaperImage`: compressed local image data URL or `null`.
- `wallpaperLuminance`: average perceived luminance (0–1) sampled from the wallpaper at upload time, or `null` for legacy wallpapers; consumed by auto-contrast resolution to flip text color on dark images.
- `font`: selected font style id.
- `accentColor`: primary system color used by controls, focus rings, selected states, and accents.
- `uiOpacity`: opacity of glass surfaces.
- `blur`: blur strength for glass surfaces.
- `contrast`: automatic/dark/light text mode.
- `favoriteScale` and `widgetScale`: independent layout density controls.

The store migrates legacy `background` and `backgroundImage` persisted keys into `theme` and `wallpaperImage`. The persistence version is bumped when new preference fields are introduced (e.g. `wallpaperLuminance`); legacy persisted state without the field falls back to `null` and behaves like pre-luminance auto contrast (dark text).

When `wallpaperImage` exists, the body receives `has-wallpaper`; CSS makes the uploaded image the visible page background and leaves the theme class active for tokens/accent colors. Without a wallpaper, the theme gradient is the page background.

Theme controls are converted into CSS variables by `src/lib/theme.ts` and applied to `document.body`. Light contrast mode also switches glass surfaces to dark translucent panels so text does not disappear over bright backgrounds.

Drag-heavy controls (color picker, transparency, blur sliders) bypass Zustand during the drag and write CSS variables directly to `document.body.style`. This avoids per-pixel `localStorage` writes from the persist middleware and keeps the picker smooth. The store commit only fires on pointer-up / change.

Drag/drop performance notes:

- Favorite and widget sort scopes use separate `SortableContext`s.
- Pointer activation waits for a short drag distance to avoid accidental layout work.
- During active drag the body receives `dnd-active`, disabling card backdrop blur and transitions on sortable cards.

## External Data

- `/api/site-metadata?url=` fetches website HTML server-side and extracts `<title>` plus favicon/touch icon metadata. The client uses this as the default favorite name/logo, then lets the user override with custom icons.
- `useLocalEnvironment` uses browser geolocation, then calls `/api/local-weather` so Open-Meteo forecast and reverse geocoding happen server-side. This avoids browser CORS failures while keeping core app rendering independent from weather requests.

## Vercel SQLite Caveat

Do not rely on a local SQLite file in Vercel serverless. Use Turso/libSQL with `DATABASE_URL` for production.

## Zone Layout (Preferences v5)

- `Preferences.zoneOrder: ZoneId[]` — order of `"search" | "favorites" | "workspace"`.
- `Preferences.zoneVisibility: Record<ZoneId, boolean>` — per-zone visibility flag.
- Persisted store version bumped from 4 → 5. The migration backfills both fields with defaults so any v4 snapshot keeps working without resetting other preferences.
- Store actions: `setZoneOrder`, `setZoneVisible(zone, visible)`, `reorderZones(activeId, overId)` (accepts `zone-` prefixed dnd-kit ids), `resetZones`.
- DnD routing in `home-page.tsx` discriminates by id prefix: `zone-` → `reorderZones`, `fav` → `reorderFavorites`, `widget` → `reorderWidgets`.

## Widget Registry

- All widget metadata lives in `src/components/widgets/widget-registry.ts`, keyed by `WidgetType`. Each entry exposes `{ label, defaultTitle, icon, defaultVariant, variants, defaultConfig }`.
- `WidgetVariantSpec = { id, label, w, h, minW, minH, maxW, maxH, description? }` — every variant defines its size in cells plus the resize-handle clamps. `defaultVariant` is always one of `variants`. Tests in `widget-variants.test.ts` enforce: ≥3 variants per widget, unique ids, default ∈ variants, positive integer w/h, and `min ≤ default ≤ max` for both axes.
- `WidgetSize` is **deprecated**; it survives as a typing aid for the v6 → v7 migration only. Layout consumers read `HomeWidget.layout = {x, y, w, h}` and `HomeWidget.variant`.
- The home-store actions are: `setVariant(id, variantId)` (clamped against the registry; rejects unknown ids with a dev `console.warn`), `setLayout(id, layout)` (single update), `setLayouts(entries)` (used by RGL's `onLayoutChange`), and `compactWidgets()` (vertical first-fit pack).
- `addWidget(type)` reads defaults from the registry and runs `firstFitPlacement` against the existing widgets so the new widget never overlaps.
- Per-widget config types are declared in `WidgetConfigByType` (`PomodoroConfig`, `TodoConfig`, `WeatherConfig`, `BookmarkConfig`, plus the existing notes/quickLinks shapes). `HomeWidget.config` is loosened to `Record<string, unknown>` so persisted snapshots remain non-fragile; each widget component reads its slice via the typed helper.
- Pomodoro logic lives in a pure `pomodoroReducer` (focus → break auto-switch on tick, reset preserves current mode). The 140-px progress ring (`pomodoro-ring.tsx`) is a separate pure component that animates `stroke-dashoffset` and switches dasharray for break vs focus. Todo mutations live in pure helpers. All have unit tests.

### Persist v6 → v7 migration

- Persisted store version is bumped to **7** to retire `WidgetSize` and switch widgets to the variant + free-placement model.
- `migrateHomeState` in `src/stores/home-store.ts` walks each persisted widget:
  1. If `widget.variant` is a known id for the widget type, keep it; pull `{w, h}` from `widgetRegistry[type].variants`.
  2. Otherwise consume the legacy `widget.size` via `legacySizeToVariantSpec(type, size)` (per-type table, see UX-lead spec §8). Unknown values fall back to `defaultVariant`.
  3. Backfill `layout` from the registry when missing; persisted `{x, y}` is preserved when present.
- After per-widget upgrades, `autoPack(widgets)` runs a first-fit top-left scan in array order so any leftover overlap from legacy snapshots is resolved.
- The 12-col grid is the canonical surface; tablet (`md`, 8 cols) and mobile (`sm`, 4 cols) are derived layouts (`mediumLayout`, `smallLayout`) on each render.
- `react-grid-layout` (`Responsive` component) is the workspace surface; favorites and zones still use `@dnd-kit`. The two libraries do not interact — RGL only owns the workspace zone interior.

## Responsive helpers (2026-05-01)

- `src/hooks/use-media-query.ts` — SSR-safe `matchMedia` subscription. Returns `false` on the server for stable hydration, then subscribes to live `change` events. Components that need a behavior split that pure CSS cannot express (modal vs full-screen, mobile-only widget body) call `useMediaQuery('(max-width: 639.98px)')`. Pure CSS responsive utilities (Tailwind `sm:` / `lg:`) are still preferred for spacing, typography, and grid columns.
- Home-store actions `moveWidgetUp(id)` and `moveWidgetDown(id)` swap the y of the target widget with the previous / next neighbor in sm-stack ordering (sorted by `(y, x)`). They power the per-widget `↑ ↓` reorder buttons that replace drag/resize at `<sm`. Both are no-ops when the target is already at the boundary; they do not pack other widgets.

