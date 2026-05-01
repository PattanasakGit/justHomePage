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

- Unit (`src/components/widgets/widget-registry.test.ts`): every `WidgetType` has metadata; registry keys match the union; `defaultTitle` is non-empty; every widget exposes a duplicate-free `allowedSizes` from the known vocabulary; `defaultSize` is always a member of `allowedSizes`; multi-size widgets (`notes`, `pomodoro`, `todo`, `quickLinks`) expose at least 2 sizes.
- Unit (`src/components/widgets/pomodoro-engine.test.ts`): initial state, start/pause, tick decrement, paused tick no-op, auto switch at zero, reset preserves mode, switchMode resets seconds, time formatter padding.
- Unit (`src/components/widgets/todo-engine.test.ts`): trim-on-add, ignore empty, toggle by id, remove by id, clear-done filter.
- Manual: add each new widget from edit mode → configure (set bookmark URL, set first todo, start pomodoro) → reload → state persists. Confirm Workspace DnD still reorders and sizes still respected.

## Widget Polish (sizes + Quiet OS)

- Unit (`src/components/widgets/size-cycle.test.ts`): `nextSize` advances + wraps; single-allowed list returns same; out-of-list current falls back to first allowed. `previousSize` mirrors the behaviour for `shift+r`.
- Unit (`src/components/widgets/pomodoro-ring.test.tsx`): `computeRingDashOffset` is 0 at full remaining, full circumference at 0, half at 50%; rendered SVG has the full circumference dasharray + zero offset for `focus`/`full-remaining`, `4 6` dasharray for `break` mode.
- Unit (`src/stores/home-store.test.ts`): persist v5 → v6 migration maps `small → compact`, `middle → regular`, `max → wide`; values not in a widget's `allowedSizes` (e.g. notes + `wide`) fall back to that widget's `defaultSize`; unknown legacy strings also fall back. `resizeWidget` rejects out-of-allowed sizes (no-op).
- Manual: enter edit mode → for each widget cycle through every allowed size; confirm the cycle button's icon swaps to match the current size; confirm overflow popover (`⋯`) shows `Remove` and dismisses on Escape / outside-click; confirm the cycle button is hidden when only one size is allowed (no widgets currently expose this case but the rule is enforced in `widget-frame.tsx`).
