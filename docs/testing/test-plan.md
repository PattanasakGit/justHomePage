# Test Plan

## Unit

- Search URL generation and provider fallback.
- Search provider registry includes web, media, and AI engines.
- Store actions for favorites, widgets, and preferences.
- Store actions for editing favorites and setting/clearing custom wallpaper images without changing theme.
- Store action for changing font preference.
- Store action for theme controls: accent color, opacity, blur, contrast, favorite scale, and widget scale.
- Theme utility CSS variable generation and readable text pairs.
- Auto contrast resolution: dark wallpapers flip to light text, bright wallpapers keep dark text, missing luminance falls back to dark.
- Auto contrast resolution treats every dark theme (graphite, ocean, forest, midnight, nebula, plum) the same way without a wallpaper.
- Average luminance computation handles white, black, mid-tone, and empty pixel buffers.
- Letter-avatar helper returns first character (uppercased), a fallback bullet for empty input, and a stable hex color per seed.
- Website metadata extraction and favicon fallback.
- Open-Meteo forecast URL generation with Celsius and automatic timezone.
- Date and clock formatting helpers.

## Component

- Search bar provider selection and submit behavior.
- Search provider dropdown is inside the search input; provider chips are not shown below.
- Favorite tile rendering.
- Widget add/remove/edit flows.
- Settings background changes.
- Settings theme color changes.
- Favorite add/edit modal opens and saves name, URL, and logo.
- Wallpaper image upload compresses and updates the page background layer.
- Uploaded wallpaper visually overrides theme gradient while theme tokens remain active.
- Font selector changes the page body font class.
- Theme controls update body CSS variables for accent color, glass opacity, blur, and contrast.
- Favorite/widget size controls change tile heights and widget grid density.
- Drag starts add `dnd-active` and drag end/cancel removes it.
- Location/weather enhancement displays Celsius temperature or graceful unavailable state.

## E2E

- Homepage loads.
- Search navigates with encoded query.
- Change background.
- Add/edit/remove notes widget.
- Mobile smoke path.

## Commands

- Install: `bun install`
- Unit: `bun run test`
- Typecheck: `bun run typecheck`
- Build: `bun run build`

## Accessibility

- Icon-only buttons have names.
- Search input has a label.
- Focus rings are visible.
- Settings dialog has role and modal semantics.

## Zone Reorder & Visibility

- Unit (`src/stores/home-store-zones.test.ts`): default order, default visibility, `setZoneOrder`, `setZoneVisible`, `reorderZones` (with `zone-` prefix handling), `resetZones`.
- Component (`src/components/homepage/sortable-zone.test.tsx`): edit-mode chrome (drag handle + eye toggle), non-edit-mode passthrough, toggle callback, "Show" vs "Hide" label.
- Manual e2e (browser smoke): enter edit mode → reorder Workspace above Favorites → reload → order persists. Hide Search → header chip "Show Search" appears → click → restored. Settings → Layout → Reset zone layout → defaults return.

## Favorites Icon Picker

- Unit (`src/components/icons/icon-catalog.test.ts`): unique ids, every entry has at least one keyword, `LETTER_ICON` first, `getBrandIcon` returns a renderer for every entry, `getCatalogByCategory` filters, `searchCatalog` matches by label and keyword, empty query returns the full catalog, neutral icon set is non-trivial.
- Component (`src/components/icons/icon-picker.test.tsx`): search filters, category chip filters, selection callback, empty-state message.
- Manual e2e: open favorite editor → search "mail" → select Mail → save → tile renders the mail icon. Repeat with a brand icon (Spotify) and verify brand color. Mobile viewport: picker keeps Save button reachable.

## Widgets Expansion

- Unit (`src/components/widgets/widget-registry.test.ts`): every `WidgetType` has metadata; registry keys match the union; `defaultTitle` is non-empty; every widget exposes a non-empty `variants` list; `defaultVariant` is always one of the variants; `resolveVariant` falls back to default for unknown ids; `legacySizeToVariantSpec` maps the documented v6 → v7 table for the seed cases.
- Unit (`src/components/widgets/pomodoro-engine.test.ts`): initial state, start/pause, tick decrement, paused tick no-op, auto switch at zero, reset preserves mode, switchMode resets seconds, time formatter padding.
- Unit (`src/components/widgets/todo-engine.test.ts`): trim-on-add, ignore empty, toggle by id, remove by id, clear-done filter.
- Manual: add each new widget from edit mode → configure (set bookmark URL, set first todo, start pomodoro) → reload → state persists. Confirm Workspace DnD still reorders and sizes still respected.

## Widget Grid Layout (variants + free placement)

- Unit (`src/components/widgets/widget-variants.test.ts`): every widget exposes ≥3 variants; ids are unique within a widget; `defaultVariant` exists in the variants list; w/h are positive integers; `min ≤ default ≤ max` for both axes; the seed defaults (clock-square 2×2, date-square 2×2, weather-square 2×2, bookmark-tile 2×2, links-row 4×2, pomo-card 4×3, todo-list 4×4, notes-pad 4×4) match the spec table.
- Unit (`src/stores/home-store.test.ts`): persist v6 → v7 migration maps each `(type, legacy size)` pair onto the correct variant + `{w, h}` (clock, notes, todo, pomodoro, bookmark cases); when two persisted widgets would overlap post-migration, `autoPack` resolves them to disjoint rectangles; widgets persisted at v7+ without a `layout` get the variant's `{w, h}` backfilled; unknown legacy size strings fall back to `defaultVariant`. `setVariant` rejects unknown variant ids (no-op + dev `console.warn`); `setLayout` writes the {x, y, w, h} verbatim; `compactWidgets` packs widgets to `y=0` (top) while preserving `x`; `addWidget` first-fits a placement that does not overlap existing widgets.
- Component (`src/components/widgets/widget-frame.test.tsx`): the `⋯` overflow trigger only renders in edit mode; clicking it opens a `role="menu"` popover with `role="menuitemradio"` items (≥2 for clock); clicking a non-active variant updates `widgets[i].variant` in the store; the popover always includes a `Remove` menuitem.
- Manual: enter edit mode → drag the clock by its header → release on a new cell → confirm `setLayouts` persisted the new `{x, y}`. Resize pomodoro 4×3 → drag corner to 6×4 → confirm RGL clamps to the variant's `maxW`/`maxH`. Click `⋯` on todo → switch to `todo-board` → confirm the widget grows to 6×5 and other widgets shift only where needed. Click **Compact** → all widgets pack to `y=0`. Remove a widget → others stay at their previous coords (no auto-reflow). On a tablet viewport (≈800 px) the workspace renders on the 8-col grid with drag/resize still on; below 640 px it falls back to a single-column auto-stack with drag/resize disabled.

### Widget size redesign (2026-05-01)

Triggered by the bug "pomodoro/weather/date/clock/quickLinks render content that doesn't fit their card; some content is hidden because the card never scrolls". Fixed by propagating `min-h-0` down the flex chain (frame → body) so internal scroll regions stop being silently clipped, plus per-size composition rewrites for the five widgets.

New tests (delta +15):

- Unit (`src/lib/theme.test.ts`): `accentReadsOnLight` returns `false` for pure white, `false` for saturated yellow (`#ffff00`, luminance ≈ 0.93), `true` for mid-luminance teal, `true` for dark accents, `true` for `#d4d4d4` (just below the 0.85 threshold), `true` for malformed input (safe default).
- Unit (`src/components/widgets/pomodoro-ring.test.tsx`): the explicit `size: 'sm' | 'md' | 'lg'` prop renders the wrapper at 88 / 112 / 128 px respectively (replaces the previous `scale: 'compact' | 'full'` enum).
- Component (`src/components/widgets/widget-quick-links.test.tsx`): with 12 fake links at `wide`, the `[data-testid='quick-links-scroll']` element exists and has `overflow-y-auto` + `min-h-0` + `flex-1` classes (the actual fix verification); `wide` uses `grid-cols-2` and `regular` uses `grid-cols-1`; the body root carries the `flex h-full min-h-0 flex-col` chain.
- Component (`src/components/widgets/widget-weather.test.tsx`): in `error` state exactly one element with `role="status"` renders and exactly one `data-testid='weather-footer'` exists (footer slot is replaced in place, not appended); same for `blocked`; the ready state has zero `role="status"` nodes and a single footer.
- Component (`src/components/widgets/widget-frame.test.tsx`): mounts each `(type, size)` pair and asserts the article's class string. Cases:
  - `clock/regular`, `weather/compact`, `weather/regular`, `pomodoro/wide` MUST contain `row-span-2` (the per-(type, size) exception table in `widget-frame.tsx` must allocate a second row at `lg`).
  - `clock/compact`, `pomodoro/regular`, `date/compact`, `date/regular`, `weather/wide` MUST NOT contain `row-span-2` (sibling rows stay 1; only the explicit exceptions get a taller row).
  - `notes/tall`, `todo/tall` keep the implicit `row-span-2` from `sizeSpanClass`.

Manual matrix (must do before declaring polish work done):

- Add all five widgets (clock, date, weather, pomodoro, quickLinks). Cycle through every `allowedSize`. Theme matrix: `linen` (light), `cyber` (neon-dark), `paper` (high-luminance-accent edge case — set the accent to `#ffff00` to test the readability fallback). For each combination, capture a screenshot and read `preview_console_logs` (must be clean).
- Pomodoro at `regular` AND `wide`: play + reset buttons must be clearly visible.
- QuickLinks with 12 fake links at `regular` (1 col) AND `wide` (2 cols): scroll region's `scrollHeight > clientHeight` is checked via the preview eval; visually the bottom fade-mask exposes only the first ~4 / ~8 rows.
- Clock and date at `compact` AND `regular`: layouts must visibly differ — compact stacks vertically; regular adds a divider + right-column metadata.
- Weather at `compact` AND `regular` including a forced error / blocked path: the footer must replace, not stack — body height stays constant.
- On the `paper` theme with a forced near-white accent (`#ffff00`), hero digits across clock/date/weather/pomodoro must remain readable (rendered in `var(--ink)` instead of disappearing); accent decorations (ring, seconds bar, link dots, play button) keep the accent.

### Pomodoro Size Fix (2026-05-01)

Triggered by the bug "card focus timer มีปัญหาตอนปรับอิสระเป็นไซต์เล็ก" — at the smallest free-resize size the 88 px SVG ring overflowed `pomo-compact`, and `pomo-card` resized below 4×3 also collided. Brief: `docs/ux/explorations/2026-05-01-pomodoro-size-fix.md`.

New tests (delta +9):

- Unit (`src/components/widgets/widget-registry.test.ts`): `pomo-compact` clamps to `{ minW: 3, minH: 2, maxW: 5, maxH: 2 }`; `pomo-card` clamps to `{ minW: 4, minH: 3, maxW: 6, maxH: 4 }`; `pomo-wide` clamps to `{ minW: 6, minH: 3, maxW: 10, maxH: 4 }`. Each variant's default `(w, h)` falls inside its own clamps.
- Component (`src/components/widgets/pomodoro-ring.test.tsx`): the universal parent-size guard. With a stubbed `ResizeObserver`, when the parent reports `min(w, h) − 24 < RING_SIZE_PX[size]` the component renders no `<svg>`; when the parent reports `min(w, h) − 24 ≥ RING_SIZE_PX[size]` the SVG renders. Covers `sm` (88) and `lg` (128).
- Component (`src/components/widgets/widget-pomodoro.test.tsx`): per-variant body composition. `pomo-compact` renders no ring (`[data-testid='pomodoro-ring']` is null) and exposes a `role="progressbar"` element with `aria-valuemin=0`, `aria-valuemax=100`, and `aria-valuenow` matching the progress percent. **Single-row layout assertion** (replaces the prior 3-stack assertion): the body root is a flex row (className matches `/(^|\s)flex(\s|$)/` and does NOT match `/flex-col/`, plus `h-full`); ModeSwitch (parent of the `focus` tab button), the `[data-testid='pomo-digits']` element, and the ControlButtons cluster (parent of the play button) all share that single flex parent — no vertical stacking. `pomo-card` mounts a 88 px ring and a `[data-testid='pomo-controls']` right column whose className includes `grid-rows-[auto_auto]` and `justify-items-end`. `pomo-wide` mounts a 128 px ring and a `[data-testid='pomo-digits']` element with `text-4xl`.

Manual matrix (must do before declaring this fix done):

- Seed the workspace with one of each pomodoro variant (`pomo-compact`, `pomo-card`, `pomo-wide`). For each, verify visually:
  - `pomo-compact`: SINGLE-ROW body — `[ focus/break tabs ] [ HH:MM digits ] [ play/reset ]` inline, with the 2 px accent progress bar pinned as an absolute hairline at the body's bottom edge. NO ring overflow and `article.scrollHeight === article.clientHeight` (no clipping of play/reset).
  - `pomo-card`: 88 px ring left with digits inside, `focus/break` tabs above play/reset right.
  - `pomo-wide`: 128 px ring left, `FOCUS` label + `text-4xl` digits centred, tabs above buttons right.
- In edit mode, drag the resize corner: react-grid-layout must refuse to shrink below the variant's `minW × minH` (compact 3×2, card 4×3, wide 6×3) and refuse to grow past `maxW × maxH`.
- `preview_console_logs` filtered to `error` returns no entries.
- Theme matrix: `linen`, `paper`, `cyber`, `neonViolet`. Compact digits remain readable on every theme — on `paper` with a saturated near-white accent the digits must fall back to `var(--ink)` (verifies `useAccentTextColor`).
