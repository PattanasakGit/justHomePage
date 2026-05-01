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

## Responsive ladder

Three breakpoints, mapped 1:1 to Tailwind `sm` (640px) and `lg` (1024px). See [`docs/ux/specs/2026-05-01-responsive-polish.md`](../ux/specs/2026-05-01-responsive-polish.md).

| Token / property | `<sm` (iPhone) | `≥sm` (iPad) | `≥lg` (MacBook) |
|---|---|---|---|
| Page padding | `px-3 py-3` | `px-6 py-4` | `px-10 py-4` |
| Greeting type | `text-2xl` | `text-3xl` | `text-4xl` |
| Search pill height | `min-h-[64px]` | `min-h-[78px]` | `min-h-[78px]` |
| Search input text | `text-base` | `text-xl` | `text-xl` |
| Favorites grid | `grid-cols-4` | `grid-cols-6` | `grid-cols-8` |
| Card shadow | `shadow-sm` | `shadow-tile` | `shadow-tile` |
| Card radius | `rounded-[18px]` | `rounded-[18px]` | `rounded-[18px]` |
| Settings panel | bottom sheet (`rounded-t-[28px]`, `max-h-[88svh]`) | right drawer `m-3 rounded-[28px]` | right drawer `m-3 rounded-[28px]` |
| Modals (favorite editor) | full-screen `h-[100svh]` with sticky save | centred `max-w-md` | centred `max-w-md` |
| Icon picker grid | `grid-cols-6` | `grid-cols-7` | `grid-cols-7` |
| Search-pill `FiSliders` | hidden | visible (no-op TODO) | visible (no-op TODO) |
| Provider chip label | hidden (icon + chevron only) | visible | visible |

Brand icon plates remain the documented `bg-white/*` exception — never replicate that for new components. All other surfaces stay on tokens.

Touch targets at `<sm` are sized to ≥44×44 (WCAG 2.5.5): provider chip `h-11 min-h-11`, header buttons `h-11 w-11`, settings tile rows `min-h-12`.

A `useMediaQuery('(max-width: 639.98px)')` hook in `src/hooks/use-media-query.ts` powers branches that pure CSS cannot express (full-screen modal vs centered card, mobile-only widget bodies, single "Add widget" sheet replacing the inline 8-chip tray).

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

- Each widget is a small focused component under `src/components/widgets/`. The frame (`widget-frame.tsx`) is responsible only for chrome (header drag handle + `⋯` overflow trigger that opens a Variants picker over Remove) and dispatches body rendering by type.
- All widgets use theme tokens (`--accent`, `--accent-soft`, `--surface`, `--surface-strong`, `--ink`, `--ink-inverse`, `--muted`). No raw `bg-white` or `text-white` outside two documented exceptions: the favorite tile brand-icon plate and the bookmark widget plate.
- Pomodoro uses `tabular-nums` for the timer display so digit width stays steady.
- Bookmark thumbnail uses a light brand-icon plate (the documented exception); falls back to a `FiBookmark` glyph when no metadata is fetched yet.

### Variant + free-placement grid (since 2026-05-01)

The legacy 5-id `WidgetSize` vocabulary is **retired**. Each widget now exposes a curated `variants: WidgetVariantSpec[]` list (`src/components/widgets/widget-registry.ts`); each spec carries `{id, label, w, h, minW, minH, maxW, maxH, description}` in **grid cells**, not pixels. `defaultVariant` is always a member of the list.

Widgets are free-placed on a responsive grid via `react-grid-layout`'s `Responsive` component:

| viewport | breakpoint | cols | row height | gap |
|---|---|---|---|---|
| ≥ 1024 px | `lg` | 12 | 80 | 12 |
| 640–1023 px | `md` | 8 | 70 | 10 |
| < 640 px | `sm` | 4 | 60 | 8 |

On `sm` widgets auto-stack as a single column (sorted by `(y, x)` of the desktop layout); drag and resize are disabled. On `lg` and `md` the user can drag (header strip is the handle, see below) and resize from the bottom-right corner. Per-variant `min/max` clamp the resize handle.

Widget layout state lives on `HomeWidget.layout = {x, y, w, h}`; `HomeWidget.variant` is the currently selected variant id. `home-store` exposes `setVariant(id, variantId)` (writes both fields), `setLayout(id, layout)`, `setLayouts(entries)` (used by RGL's `onLayoutChange`), and `compactWidgets()` (vertical compaction triggered by the **Compact** button in the edit-mode workspace header).

### Variant submenu in `⋯` overflow popover

The single trailing control on each widget header in edit mode is the `⋯` overflow trigger. It opens a 240 px popover (`--popup` background) containing:

- **Size** section header.
- One row per variant: 28×20 mini-preview rectangle proportional to `w×h`, humanised label (`Square`, `Banner`, `Display`…), `w×h` chip in `tabular-nums`. The active row is filled with `--accent-soft`, gets a 3 px `--accent` left border, and shows a `FiCheck` glyph.
- A 1 px `--border` divider.
- **Remove** menuitem (`FiTrash2` + label).

The popover is rendered through `createPortal(document.body)` so it escapes the article's `overflow-hidden`. Pressing `r` while a widget has focus opens the same popover; the trigger advertises `aria-keyshortcuts="r"` and the popover root is `role="menu"` with `role="menuitemradio"` rows (`aria-checked`).

When `variants.length === 1` the Size section is omitted (no dead affordance) — only Remove renders.

### Workspace edit chrome

- **Grid paper** appears under the workspace only in edit mode: 1 px `repeating-linear-gradient` lines in `color-mix(--accent-soft 50%, transparent)`, fading in over 220 ms. Clamped to 0.18 alpha on neon themes (`theme-cyber/neonCyan/neonPink/neonViolet`).
- **Resize handles** are rendered on the bottom-right corner only — 14×14 `--accent` square with a 2 px `--surface` (or `--ink-inverse` on dark vibrant themes) inner ring. Visible on widget hover/focus, hidden at rest. The handle is suppressed when the widget exposes a single variant.
- **Drag preview**: the dragged tile gets `transform: scale(1.02)`, `shadow-lg`, and a 1 px `--accent` outline. The placeholder is filled with `color-mix(--accent-soft 60%, transparent)` and outlined with a 1.5 px dashed `--accent`.
- The **header strip** is the only drag surface (`.widget-drag-handle`). RGL is configured with `dragConfig.handle = ".widget-drag-handle"` and `dragConfig.cancel = "button, [role='menu']"` so buttons inside the header (the `⋯` trigger) still register clicks.

### v6 → v7 migration

`migrateHomeState(persisted, version)` honours the new shape:

1. If a widget has a recognised `variant` string, keep it; pull `{w, h}` from the registry.
2. Otherwise map the legacy `size` enum via `legacySizeToVariantSpec(type, size)` (table in `widget-registry.ts`). Unknown values fall back to `defaultVariant`.
3. Backfill `layout` from the registry when missing.
4. Run `autoPack` (first-fit top-left in array order) so the resulting layout is overlap-free.
5. `partialize` writes `widgets`, `favorites`, `preferences` only; persist version is bumped to **7**.

### Quiet OS hero language

The widget set follows the "Quiet OS" direction (calm, type-led, one accent touch per tile):

- **clock** — large `tabular-nums` HH:MM with a thin accent seconds bar.
- **date** — oversized accent day-number with subdued weekday + month.
- **notes** — minimal textarea framed by a single accent focus bar at the top (`--accent-soft` idle, `--accent` while focused).
- **quickLinks** — leading accent dot (HSL-rotated from `--accent`) before each link label.
- **pomodoro** — circular SVG ring with explicit `size: sm | md | lg` (88 / 112 / 128 px); `stroke-dashoffset` animation; solid stroke for focus, dashed for break. The ring self-guards via `ResizeObserver`: when `min(parentW, parentH) − 24 < RING_SIZE_PX[size]`, the component renders nothing so the host can drop in a flat fallback. The `pomo-compact` variant never renders the ring; instead the body is a single horizontal flex row (mode tabs · digits · play/reset) and the 2 px accent progress bar is absolutely positioned at the bottom edge of the body so it does not consume vertical space. Body compositions that DO render the ring (`pomo-card`, `pomo-wide`) wrap it in an explicit `(ringSize + 24)` square slot so the ring observes a stable parent regardless of column auto-sizing.
- **todo** — strip with a thin accent left edge (`--accent-soft` idle, `--accent` checked).
- **weather** — accent-tinted temperature glyph; label `LOCAL WEATHER` uppercase; soft top-down `--accent-soft → transparent` gradient.
- **bookmark** — light icon plate ring with caption underneath; in edit mode the inline form replaces the launch tile.

### Per-size composition rules (clock / date / weather / pomodoro / quickLinks)

Each widget body is laid out per `allowedSize` so content always fits the
card. The frame's `article` is `flex flex-col min-h-0 overflow-hidden`; every
body root uses `flex h-full min-h-0 flex-col` so internal scroll regions
report finite height (see `docs/agents/knowledge-rules.md` for the global
rule). Bodies never grow beyond the card; overflow becomes a scroll region
or replaces an in-place footer.

| widget | size | composition |
|---|---|---|
| clock | compact | HH:MM hero stacked over a 2 px accent seconds bar; bottom row carries short weekday + short timezone (e.g. `FRI · Bangkok`). No seconds string. |
| clock | regular | `grid-cols-[1fr_auto_auto]` baseline grid: HH:MM hero left, vertical hairline divider, right column = AM/PM tag + short weekday + short timezone. Seconds bar spans the full width below. |
| date | compact | Oversized day digit (`text-6xl`), short weekday (`text-[11px] uppercase`), short month. |
| date | regular | `grid-cols-[auto_1fr]`: day digit (`text-7xl`) on the left, `border-l` divider, weekday (long) + month + year stacked right. |
| weather | compact | 4 stacked lines: `LOCAL WEATHER` label, temp+`C` hero, condition word, footer. The footer slot (`data-testid="weather-footer"`) is **replaced in place** when blocked/error — never appended — so card height is constant. |
| weather | regular | `grid-cols-[auto_1fr]`: temp+`C` hero on the left, condition / location stacked right. Same in-place footer rule applies; while error/blocked, the right-column secondary line collapses to keep total height stable. |
| pomodoro | regular | `flex items-center gap-4`: 88 px ring left (`shrink-0`), digits inside the ring, controls (`ModeSwitch` over play/reset row) on the right, end-aligned. |
| pomodoro | wide | `grid-cols-[auto_1fr_auto] items-center gap-6`: 128 px ring left, mode label + `text-4xl` time centred, mode pill over play/reset right. |
| pomodoro | compact | `pomo-compact` variant only (3×2 / max 5×2): SINGLE-ROW body — `flex items-center justify-between gap-2` with `[ ModeSwitch ]  [ HH:MM `text-xl` digits, shrink-0 ]  [ ControlButtons ]` inline. The 2 px accent progress bar is rendered as a `position: absolute; inset-x-0; bottom-0` hairline pinned to the body's bottom edge so it consumes ZERO vertical layout space — this is what stops play/reset from clipping at 3×2. **No SVG ring.** |
| quickLinks | regular | `grid-cols-1` scrollable list with `mask-image` fade on the bottom 16 px; ~4 visible at typical card height, scrolls beyond. |
| quickLinks | wide | `grid-cols-2` scrollable grid with the same fade mask; ~8 visible, scrolls beyond. |

### Accent readability fallback for hero digits

`accentReadsOnLight(color)` (in `src/lib/theme.ts`) returns `false` when an
accent's relative luminance exceeds `0.85` (e.g. saturated yellow on the
`paper` theme). Widgets that fill large numerals with the accent — clock
HH:MM, date day-number, weather temp, pomodoro digits — pipe through
`useAccentTextColor()` (in `src/hooks/use-accent-text-color.ts`), which
swaps the inline `color` to `var(--ink)` whenever the active accent would
disappear on a near-white surface. The accent still drives every other
decoration (ring stroke, seconds bar, link dot, play button) so the theme
remains visually present.
