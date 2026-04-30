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

## Theme Tokens

- `--ink` — primary text color, flips with auto contrast.
- `--ink-inverse` — opposite of `--ink`, used for text on `--ink` backgrounds (selected pills, segmented buttons).
- `--muted` — secondary text, paired with `--ink`.
- `--surface`, `--surface-strong`, `--panel`, `--tile` — glass surfaces; auto-flip from white-translucent to dark-translucent based on contrast. Opacity follows the user's transparency slider.
- `--popup` — near-opaque (96%) surface for dropdowns and modal containers; ignores the transparency slider so popups stay readable on busy wallpapers.
- Components must use these tokens instead of hardcoded `bg-white/*` or `text-white` so light/dark contrast both stay readable.
