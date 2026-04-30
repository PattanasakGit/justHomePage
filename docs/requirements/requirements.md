# Requirements

## Product Goal

Build a minimal, fast browser homepage for daily use on MacBook and iPhone.

## MVP Features

- Search input with multiple providers.
- Provider shortcuts in the query.
- Search engine picker lives inside the search input dropdown; no provider chip list below the search bar.
- Search providers include classic web search plus AI providers such as ChatGPT, Claude, Gemini, Copilot, Perplexity, You.com, and Phind.
- Favorite website list.
- Add, edit, delete, and reorder favorite websites.
- Default favorite website title/logo should come from website metadata when a URL is added.
- Choose custom brand-style icons for favorite websites after metadata defaults are loaded.
- A letter-avatar fallback is the default icon for new favorites — a colored circle with the first letter of the title, shown when no brand icon or metadata logo is selected.
- Sync local timezone, location label, and current temperature in Celsius when browser location permission is granted.
- Configurable theme color separated from wallpaper image.
- Theme catalog covers warm, cool, dark, and neutral moods with at least two dozen distinct gradient bases grouped by Light/Dark tabs and tagged by style (soft, minimal, vibrant, neon).
- Each theme ships with a hand-picked palette of primary accent colors that read well against its gradient — primary color is selected from the palette, not from a free color picker.
- Theme controls include primary/accent color, text contrast, UI transparency, and UI blur strength.
- Sliders show their current value as a chip and use a custom track + thumb that picks up the active accent color; drags update CSS variables directly so they stay smooth, committing to the store only on release.
- Text contrast must remain readable over light/dark themes and uploaded wallpapers.
- Upload a local wallpaper image, compress it for browser storage, preview it, and allow removal without changing theme color.
- When wallpaper is present, wallpaper becomes the visible page background while theme only controls system colors.
- Provide five font styles users can switch from settings.
- Favorite tiles and workspace widgets can be resized independently.
- Draggable widget workspace.
- Add and remove widgets.
- Clock, date, notes, and quick links widgets.
- Responsive layout for desktop and mobile.

## Non-Functional Requirements

- First screen is the usable app, not a landing page.
- Fast startup with no external API dependency for core rendering.
- Drag and drop should avoid expensive visual effects while dragging and keep favorite/widget sorting scopes independent.
- Weather/location enhancement may fail gracefully when permission, network, or API access is unavailable.
- Accessible labels for icon-only controls.
- Zustand for client interaction state.
- SQLite/libSQL data boundary for future persistence.

## Edit Mode — Zone Reorder

- Users can reorder the three top-level zones (Search, Favorites, Workspace) and hide any zone in edit mode.
- Hidden zones expose a "Show <zone>" affordance in the edit-mode header so they remain reachable.
- "Reset zone layout" in Settings → Layout returns to defaults.
- Persistence survives reload (Zustand persist v5 with migration from v4).
