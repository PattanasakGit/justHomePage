# UX Blueprint

> Last verified against codebase: 2026-10-07 (branch `feat/homepage-v2`).  
> Visual reference: `docs/ui/demo-v2.html` (Apple liquid glass).

## Primary Screen

- Topbar icon buttons (import / export / customize); chrome can be hidden.
- Hero greeting + calm subtitle (no weather).
- Search: pill glass bar with in-bar provider menu + submit; shortcut hint when chrome shown.
- Favorites: folder tabs (All + user folders), density-aware glass tile grid, Add tile.
- Empty state: short copy + Add Favorite / Import only.
- Customize: bottom sheet (mobile) / centered panel (desktop) with bounded personalization axes.

## Interaction Rules

- Enter submits search; leading shortcuts switch provider (`g`, `yt`, `ai`, …).
- Folder tabs filter without leaving the page.
- Tile ··· opens edit; long-press/context on ··· can remove (desktop hover reveals ···).
- Import/export entry points are visible in the topbar when chrome is shown; empty state also offers Import.
- Tap targets ≥44px; safe-area insets honored; responsive 3 → 4 → 6 column grid.

## Materials

- Frost heavy (~40 blur, saturate 1.8) on search, customize sheet, chrome buttons, empty state.
- Lighter frost (~20) on favorite tiles.
- No blur-radius animation; respect reduced transparency / reduced motion.

## Customization axes

- Theme light/dark + accent swatches (default iOS blue `#007AFF` / dark `#0A84FF`)
- Font set, transparency, blur slider
- Contrast soft / normal / strong
- Density comfort / cozy / compact
- Chrome shown / hidden
- Wallpaper upload / clear

## Dropped from UI (v2)

Weather/location strip and widget workspace.
