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
- Cards are only for repeated tiles, widgets, and dialogs.
- Avoid nested cards.
- Use stable dimensions for tiles and widgets.
- Background upload previews through the page background layer with a subtle blur/veil for contrast.
