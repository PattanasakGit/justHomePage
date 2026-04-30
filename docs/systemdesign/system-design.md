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
- `font`: selected font style id.
- `accentColor`: primary system color used by controls, focus rings, selected states, and accents.
- `uiOpacity`: opacity of glass surfaces.
- `blur`: blur strength for glass surfaces.
- `contrast`: automatic/dark/light text mode.
- `favoriteScale` and `widgetScale`: independent layout density controls.

The store migrates legacy `background` and `backgroundImage` persisted keys into `theme` and `wallpaperImage`.

When `wallpaperImage` exists, the body receives `has-wallpaper`; CSS makes the uploaded image the visible page background and leaves the theme class active for tokens/accent colors. Without a wallpaper, the theme gradient is the page background.

Theme controls are converted into CSS variables by `src/lib/theme.ts` and applied to `document.body`. Light contrast mode also switches glass surfaces to dark translucent panels so text does not disappear over bright backgrounds.

Drag/drop performance notes:

- Favorite and widget sort scopes use separate `SortableContext`s.
- Pointer activation waits for a short drag distance to avoid accidental layout work.
- During active drag the body receives `dnd-active`, disabling card backdrop blur and transitions on sortable cards.

## External Data

- `/api/site-metadata?url=` fetches website HTML server-side and extracts `<title>` plus favicon/touch icon metadata. The client uses this as the default favorite name/logo, then lets the user override with custom icons.
- `useLocalEnvironment` uses browser geolocation, then calls `/api/local-weather` so Open-Meteo forecast and reverse geocoding happen server-side. This avoids browser CORS failures while keeping core app rendering independent from weather requests.

## Vercel SQLite Caveat

Do not rely on a local SQLite file in Vercel serverless. Use Turso/libSQL with `DATABASE_URL` for production.
