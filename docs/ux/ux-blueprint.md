# UX Blueprint

## Primary Screen

- Header: app name, edit mode, settings.
- Search: large input with compact provider selector.
- Favorites: compact draggable icon tiles.
- Favorites management: add/edit modal with name, URL, and logo picker.
- Workspace: draggable widgets below favorites.
- Settings: side drawer on desktop, full-screen feeling on mobile.

## Interaction Rules

- Enter submits search.
- Shortcuts: `g`, `d`, `b`, `yt`, `gh`, `p`.
- Edit mode reveals widget creation and drag handles.
- Add controls remain discoverable even outside edit mode for favorites.
- Background settings include theme thumbnails plus an image upload target.
- Normal mode keeps chrome minimal.
- Mobile layout stacks widgets and keeps tap targets at least 44px.

## Auto Text Contrast

- Auto contrast keeps text readable across themes and uploaded wallpapers.
- Without a wallpaper, only the graphite theme switches to light text.
- With a wallpaper, the uploaded image is sampled for average luminance; dark images (luminance < 0.55) flip to light text, bright images keep dark text.
- Users can override auto by picking Dark or Light text explicitly in Settings → Theme.

## Edit Mode — Zone Reorder & Visibility

- In edit mode, each top-level zone (Search, Favorites, Workspace) gains a small drag handle (`FiMove`) and an eye toggle.
- Zones reorder vertically via dnd-kit (`verticalListSortingStrategy`). The existing favorite/widget sort scopes stay independent — drag IDs are namespaced (`zone-…`, `fav…`, `widget…`).
- Hiding a zone keeps it discoverable: an edit-mode header strip lists every hidden zone with a one-tap "Show <zone>" button. Outside edit mode, hidden zones are not rendered.
- Settings → Layout exposes a "Reset zone layout" action that restores `["search","favorites","workspace"]` with all three visible.
- Keyboard reorder uses dnd-kit defaults: focus the drag handle, Space to lift, arrow keys to move, Space to drop.

## Favorites — Icon Picker

- The favorite editor now uses a unified `IconPicker` instead of a flat 32-tile brand grid.
- Layout: search input on top (auto-clears pagination when typing), category chips below (`All`, `Brand`, `Productivity`, `Communication`, `Media`, `Money`, `Travel`, `General`), then a paginated 7-column grid (page size 28).
- The letter-avatar tile is always shown first when the active filter is "All" and the search query is empty or matches "letter avatar".
- Brand icons render in their brand color; neutral icons render in `--ink` so they stay legible on every theme.
- Empty state: "No icons match your search" when the query and category produce zero results.
- The picker grid is capped at `max-h-[260px]` with internal scroll so the modal Save button stays visible on small viewports.
