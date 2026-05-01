# UI Design

## Visual Direction

Minimal personal productivity dashboard: soft material surfaces, restrained accents, compact rounded controls, a large pill search bar, and no marketing hero.

## Tokens

- Radius: `18px` for favorite/widget cards, `28px` for drawers/modals, full pill for search.
- Spacing: `4, 8, 12, 16, 24, 32`.
- Motion: `120-180ms`.
- Surface: translucent with enough contrast.
- Accents: muted teal plus warm coral.

## Component Rules

- Icon buttons need accessible labels.
- Brand icons use free icon sets exposed through `react-icons` / Simple Icons where available.
- Brand icon plates always use a light off-white surface (independent of contrast mode) so colored and dark logos remain visible.
- Cards are only for repeated tiles, widgets, and dialogs.
- Avoid nested cards.
- Use stable dimensions for tiles and widgets.
- Background upload previews through the page background layer with a subtle blur/veil for contrast.

## Theme Catalog

- Themes live in `src/data/themes.ts` as a single `themeCatalog` array; each entry has `category` (`light`/`dark`), `style` (`soft`/`minimal`/`vibrant`/`neon`), a Tailwind preview gradient, and a curated `accents` palette.
- Settings UI groups themes under Light/Dark tabs and labels each thumbnail with its style tag.
- Picking a theme also resets the accent to the theme's first palette entry when the current accent is not part of the new palette.

## Sliders

- Use the shared `RangeField` with a custom track (filled portion uses `--accent`) and themed thumb (`.theme-range`).
- The current value is displayed as a chip on the right of the slider label, in `--ink` text on a `--surface` chip.
- Drag updates write CSS variables directly via `buildThemeVariables`; the store commit only fires on release.

## Theme Tokens

- `--ink` — primary text color, flips with auto contrast.
- `--ink-inverse` — opposite of `--ink`, used for text on `--ink` backgrounds (selected pills, segmented buttons).
- `--muted` — secondary text, paired with `--ink`.
- `--surface`, `--surface-strong`, `--panel`, `--tile` — glass surfaces; auto-flip from white-translucent to dark-translucent based on contrast. Opacity follows the user's transparency slider.
- `--popup` — near-opaque (96%) surface for dropdowns and modal containers; ignores the transparency slider so popups stay readable on busy wallpapers.
- Components must use these tokens instead of hardcoded `bg-white/*` or `text-white` so light/dark contrast both stay readable.

## Icon Picker

- `IconPicker` lives at `src/components/icons/icon-picker.tsx`; the catalog at `src/components/icons/icon-catalog.ts`.
- Brand icons keep their brand color; neutral icons use `var(--ink)` so they remain readable across light/dark themes.
- Search field height is 40px; chip row is horizontally scrollable on overflow; grid is `grid-cols-7 gap-2` with 11×11 px tiles.
- Container uses `--surface` background, internal grid scrolls at `max-h-[260px]` to protect modal layout.

## Widgets

- Each widget is a small focused component under `src/components/widgets/`. The frame (`widget-frame.tsx`) is responsible only for chrome (header, cycle resize, overflow popover) and dispatches body rendering by type.
- All widgets use theme tokens (`--accent`, `--accent-soft`, `--surface`, `--surface-strong`, `--ink`, `--ink-inverse`, `--muted`). No raw `bg-white` or `text-white` outside two documented exceptions: the favorite tile brand-icon plate and the bookmark widget plate.
- Pomodoro uses `tabular-nums` for the timer display so digit width stays steady.
- Bookmark thumbnail uses a light brand-icon plate (the documented exception); falls back to a `FiBookmark` glyph when no metadata is fetched yet.

### Size vocabulary (per-widget)

Five size ids share a Tailwind class map:

| id | sm span | lg span | row-span | typical use |
|----|---------|---------|----------|-------------|
| `compact` | 1 | 1 | 1 | single metric |
| `regular` | 2 | 2 | 1 | label + body |
| `wide` | 2 | 4 | 1 | timeline / horizontal list |
| `tall` | 1 | 2 | 2 | editor / scroll list |
| `hero` | 2 | 4 | 2 | rich panel |

Each widget exposes a curated `allowedSizes: WidgetSize[]` and a `defaultSize` (defined in `src/components/widgets/widget-registry.ts`). `defaultSize` is always a member of `allowedSizes`. The `home-store` `resizeWidget` action rejects (no-op + dev `console.warn`) sizes outside the widget's allowed list.

### Cycle resize control + overflow popover

In edit mode, each widget header shows two trailing controls:

1. A single **cycle button** that advances through `allowedSizes` (icon mapping: `compact → FiSquare`, `regular → FiColumns`, `wide → FiMinus`, `tall → FiBookOpen`, `hero → FiMaximize2`). When `allowedSizes.length === 1` the button is **not rendered** (no dead affordance). The button label includes the current size; `r` keypress while the article holds focus cycles forward.
2. An **overflow trigger** (`⋯` / `FiMoreHorizontal`) that opens a small popover (`--popup` background) with theme-token menu items. Today only `Remove` is rendered; widget-specific `Settings…` items will appear here in the future and are simply omitted when no settings exist.

Both trailing buttons stop pointer propagation so they do not initiate `@dnd-kit` drag.

### Quiet OS hero language

The widget set follows the "Quiet OS" direction (calm, type-led, one accent touch per tile):

- **clock** — large `tabular-nums` HH:MM with a thin accent seconds bar.
- **date** — oversized accent day-number with subdued weekday + month.
- **notes** — minimal textarea framed by a single accent focus bar at the top (`--accent-soft` idle, `--accent` while focused).
- **quickLinks** — leading accent dot (HSL-rotated from `--accent`) before each link label.
- **pomodoro** — 140-px SVG ring (96-px at `regular`); `stroke-dashoffset` animation; solid stroke for focus, dashed for break.
- **todo** — strip with a thin accent left edge (`--accent-soft` idle, `--accent` checked).
- **weather** — accent-tinted temperature glyph; label `LOCAL WEATHER` uppercase; soft top-down `--accent-soft → transparent` gradient.
- **bookmark** — light icon plate ring with caption underneath; in edit mode the inline form replaces the launch tile.
