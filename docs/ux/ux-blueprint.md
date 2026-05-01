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

## Widgets — Expanded Set

- The Workspace zone now exposes eight widget types in the Add menu: Clock, Date, Notes, Quick links, Pomodoro, Todo, Weather, Bookmark.
- Pomodoro: tab between Focus / Break, primary action toggles play/pause, secondary action resets the current cycle. Auto-pauses when timer hits zero and pre-loads the opposite mode's full duration.
- Todo: inline add input, click checkbox to mark done, hover/focus reveals delete; "Clear done" appears once at least one item is complete. Empty list shows the calm placeholder "Nothing on the list — add a task above."
- Weather: uses the existing geolocation + `/api/local-weather` pipeline. Handles `blocked`/`error` states with a one-line hint instead of a fake reading. Idle/locating shows a shimmer on the temperature slot only.
- Bookmark: in edit mode the tile becomes a tiny form (URL + caption); outside edit mode it's a launch tile that opens in a new tab with `noopener noreferrer`. Thumbnail and caption auto-fill from `/api/site-metadata`. Empty state placeholder reads "Add a bookmark — paste a URL in edit mode."

### Free-placement workspace + per-widget variants (since 2026-05-01)

The workspace is a **fine grid** that the user freely arranges. Widgets carry `{x, y, w, h}` coordinates in cells, and each widget exposes a curated **variants** list (the user picks one — the variant supplies `{w, h}` and `{minW, maxW, minH, maxH}` clamps).

| widget | variants (default in **bold**) |
|--------|-------------------------------|
| clock | **clock-square 2×2**, clock-banner 4×1, clock-display 4×3 |
| date | **date-square 2×2**, date-banner 4×1, date-calendar 4×4 |
| weather | **weather-square 2×2**, weather-detail 4×2, weather-forecast 6×3 |
| bookmark | **bookmark-tile 2×2**, bookmark-card 3×2, bookmark-banner 6×2 |
| quickLinks | **links-row 4×2**, links-grid 4×3, links-strip 8×1 |
| pomodoro | **pomo-card 4×3**, pomo-compact 3×2, pomo-wide 6×3 |
| todo | **todo-list 4×4**, todo-compact 3×3, todo-board 6×5 |
| notes | **notes-pad 4×4**, notes-strip 6×2, notes-page 6×6 |

**Edit mode chrome.**
- The widget header strip is the drag handle (RGL `.widget-drag-handle`); body controls (textareas, todo rows, pomodoro buttons) stay pointer-interactive.
- Bottom-right corner exposes a 14×14 `--accent` resize handle on hover/focus; clamps to the variant's `min/max`.
- The header trailing control is the `⋯` overflow trigger; it opens a popover with a **Size** section (variants list) over a Remove action. Active variant gets `--accent-soft` fill and `--accent` left border. Press `r` while a widget is focused to open the same popover.
- The workspace header in edit mode includes a **Compact** button that vertically packs the layout (`compactWidgets()`), plus a tray of `+ Widget` buttons.
- Removing a widget does **not** auto-reflow others — user-arranged layouts are preserved.

**Empty state.** When no widgets exist and edit mode is on, a centred 320×180 dashed `--border` panel shows `+ Add a widget to get started` with sub-text. Out of edit mode, the same area collapses to a single muted line (`Turn on Edit to place widgets.`).

### Quiet OS visual direction

The widget set follows the "Quiet OS" direction: each tile honest about its single job, with one disciplined accent touch. See `docs/ui/ui-design.md → Widgets → Quiet OS hero language` for the per-widget rules.

### Per-size description (clock / date / weather / pomodoro / quickLinks)

Sizing is composition, not stretch — the hero element identity stays
constant across sizes; only typography scale, column count, and which
secondary fields are visible change.

- **Clock — compact**: HH:MM hero stacked over the accent seconds bar; bottom row carries short weekday + short timezone. No seconds string, no AM/PM tag.
- **Clock — regular**: same hero, plus a right column with AM/PM tag, short weekday, and short timezone separated by a vertical hairline divider; the seconds bar still spans full width below.
- **Date — compact**: oversized day digit (`text-6xl`) with a short weekday and short month underneath; weekday/month always truncate, never wrap.
- **Date — regular**: day digit at `text-7xl` left, `border-l` divider, long weekday over long month + year right.
- **Weather — compact**: four stacked lines (`LOCAL WEATHER` label → temp+`C` hero → condition → footer with map pin + location). Error / blocked replaces the footer line **in place** so the card never grows.
- **Weather — regular**: temp + `C` hero left, stacked condition + location right (`grid-cols-[auto_1fr]`). Same in-place footer treatment for error / blocked.
- **Pomodoro — regular**: 88 px ring on the left, controls (focus/break pill over play + reset) right-aligned. Time digits sit inside the ring at `text-base`.
- **Pomodoro — wide**: 128 px ring on the left, mode label + large `text-4xl` time digits centred, focus/break pill over play + reset right. Three columns, each visually anchored.
- **Quick links — regular**: 1-column scrollable list, ~4 visible, scrolls beyond with a 16 px bottom fade mask.
- **Quick links — wide**: 2-column scrollable grid, ~8 visible, scrolls beyond with the same fade mask.

The footer-replacement rule (Weather) and the scroll regions (Quick links)
both rely on the global flex chain `flex h-full min-h-0 flex-col` →
`flex-1 min-h-0 overflow-y-auto`. See `docs/agents/knowledge-rules.md` for
the underlying rule.
