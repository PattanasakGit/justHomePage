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

- All widget metadata lives in `src/components/widgets/widget-registry.ts`, keyed by `WidgetType`. Each entry exposes `{ label, defaultTitle, icon, defaultSize, allowedSizes, defaultConfig }`.
- `WidgetSize` is a global string union (`"compact" | "regular" | "wide" | "tall" | "hero"`); the registry curates which sizes each widget supports via `allowedSizes`. `defaultSize` is always a member of `allowedSizes`. Tests in `widget-registry.test.ts` enforce both invariants.
- The home-store `resizeWidget(id, size)` action clamps requests against the type's `allowedSizes` (no-op + dev `console.warn` on miss) so a broken caller cannot push a widget into an unsupported size.
- The pure helper `nextSize(current, allowed)` (and `previousSize`) lives in `src/components/widgets/size-cycle.ts`; the cycle button in `widget-frame.tsx` calls it on click and on the `r` keyboard shortcut.
- `addWidget(type)` reads defaults from the registry — no per-type `if/else` branches outside the registry file.
- Per-widget config types are declared in `WidgetConfigByType` (`PomodoroConfig`, `TodoConfig`, `WeatherConfig`, `BookmarkConfig`, plus the existing notes/quickLinks shapes). `HomeWidget.config` is loosened to `Record<string, unknown>` so persisted snapshots remain non-fragile; each widget component reads its slice via the typed helper.
- Pomodoro logic lives in a pure `pomodoroReducer` (focus → break auto-switch on tick, reset preserves current mode). The 140-px progress ring (`pomodoro-ring.tsx`) is a separate pure component that animates `stroke-dashoffset` and switches dasharray for break vs focus. Todo mutations live in pure helpers. All have unit tests.

### Persist v5 → v6 migration

- Persisted store version is bumped from 5 → 6 to retire the old `small | middle | max` size vocabulary.
- The migrate function (`migrateHomeState` in `src/stores/home-store.ts`) walks each persisted widget and resolves its size via `resolveWidgetSize(type, raw)` from the widget registry:
  1. Pass-through if the raw value is already a valid size for the widget's `allowedSizes`.
  2. Else map through the legacy table `{ small: "compact", middle: "regular", max: "wide" }`.
  3. If the mapped value is still not allowed (e.g. `notes` does not support `wide`), fall back to the widget's `defaultSize`.
- Preferences continue to backfill missing fields against `defaultPreferences` so older v4/v5 snapshots keep working.
