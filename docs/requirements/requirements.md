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
- Sync local timezone, location label, and current temperature in Celsius when browser location permission is granted.
- Configurable theme color separated from wallpaper image.
- Theme controls include primary/accent color, text contrast, UI transparency, and UI blur strength.
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
