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

## Favorites Icon Picker

- Unit (`src/components/icons/icon-catalog.test.ts`): unique ids, every entry has at least one keyword, `LETTER_ICON` first, `getBrandIcon` returns a renderer for every entry, `getCatalogByCategory` filters, `searchCatalog` matches by label and keyword, empty query returns the full catalog, neutral icon set is non-trivial.
- Component (`src/components/icons/icon-picker.test.tsx`): search filters, category chip filters, selection callback, empty-state message.
- Manual e2e: open favorite editor → search "mail" → select Mail → save → tile renders the mail icon. Repeat with a brand icon (Spotify) and verify brand color. Mobile viewport: picker keeps Save button reachable.
