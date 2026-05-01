# Responsive polish — mobile, tablet, desktop

Date: 2026-05-01 • Owner: ux-lead • Branch: `feat/responsive-polish`
Targets: `home-page.tsx`, `search-bar.tsx`, `favorite-tile.tsx`, `widget-frame.tsx`, `settings-panel.tsx`, `favorite-editor.tsx`, `globals.css`.

## 1. Problem

Product target is MacBook + iPhone, but the layout was tuned on desktop. Header + greeting wrap, the search pill is at the edge of fitting on 390 px, the settings drawer leaves an awkward 13 px gap on iPhone, and the favorites grid resolves to 3 columns on a phone where 4 is the iOS norm. Make every primary surface intentional at three viewports.

## 2. Audit (current → failure mode)

| Surface | Mobile 390 px | Tablet 834 px | Desktop 1440 px |
|---|---|---|---|
| Page padding | `px-4 py-4` (16/16) — fine | `sm:px-6` 24 — fine | `lg:px-10` 40 — fine |
| Header (title + edit + settings) | OK; 11×11 buttons meet 44 px | OK | OK |
| Greeting + date + temp + city + tz | Single row wraps to 2–3 lines, "•" separators dangle. **Fail** | Fits | Fits |
| Search pill (`min-h-[78px]`, search icon + 64 px input + sliders 44 + provider chip 48 + chevron) | Estimated content width ≈ 360 px inside a 358 px pill (390 − 32). Provider label hides at `<sm`, but the **slider button + provider button + input** still crowd. **Fail at 360 px** | OK | OK |
| Provider dropdown `w-[min(82vw,360px)]` | Anchored `right-0`; OK width but vertical groups push below fold | OK | OK |
| Favorites grid `grid-cols-3 sm:grid-cols-4 lg:grid-cols-8` | 3 cols, gap-3, tile `min-h-[94px]`. Tile width ≈ 110 px — comfy but **3 ≠ iOS dock pattern** | 4 cols (sm threshold) — fine | 8 cols — fine |
| Favorite tile touch | 94 × ~110, OK ≥ 44 px | OK | OK |
| Zone chrome (drag handle + eye toggle from `SortableZone`) | Visible only in edit; small handle may be < 44 px on touch | OK | OK |
| Workspace header `flex-wrap items-center justify-end gap-2` (Compact + 8 widget chips) | Wraps to 3–4 rows above the canvas, **buries the canvas** | Wraps to 2 rows | Single row |
| Hidden-zones strip | `flex-wrap gap-2`, fine | OK | OK |
| RGL canvas | Auto-stack 1-col, drag/resize disabled, "Open on a larger screen" hint shown — **correct** | 8-col free layout — fine | 12-col — fine |
| Widget body min sizes (clock-square 2×2 ≈ 124×120 at sm) | A 2-col widget on a 4-col stack still spans full width — fine | Fine | Fine |
| Settings drawer `max-w-[420px]` inside `inset-0 p-3` | 390 − 24 = 366 px outer, content 366 px wide, **right-rounded corners against the left edge of the screen feel awkward**; close button OK | 420 + 24 px outside — fine | OK |
| Favorite editor `max-w-md` (≈ 448 px) inside `p-4` | 358 px modal — content wraps but icon picker `max-h-[260px]` plus form pushes Save below fold on landscape (812 → keyboard takes 320). **Fail in landscape + keyboard** | OK | OK |
| Icon picker `grid-cols-7` | Tile pitch ≈ 44 px — borderline on 358 px modal | OK | OK |

## 3. Target behavior per surface

| Surface | Mobile | Tablet | Desktop |
|---|---|---|---|
| Page padding | `px-3 py-3` (12) | `sm:px-6` 24 | `lg:px-10` 40 |
| Greeting block | Stack vertically: greeting `text-xl`, then a 2-line meta row ("date · °C" / "📍 city") | Single row, drop tz | Single row, all fields |
| Search pill | Drop sliders button at `<sm`; provider button shows **icon-only** (already does) but trim chevron-gap; reduce input `text-[17px]` → `text-base`; pill `min-h-[64px]` on mobile (still ≥ 44 px touch) | `min-h-[72px]` | `min-h-[78px]` |
| Provider dropdown | `w-[min(92vw,340px)]`, `top-[calc(100%+8px)]` | unchanged | unchanged |
| Favorites grid | **`grid-cols-4`** at `<sm` (4-up dock pattern), gap-2; tile `min-h-[88px]` | `sm:grid-cols-6`, gap-3 | `lg:grid-cols-8`, gap-3 |
| Workspace header (edit) | Collapse `+ Widget` chips into a single "Add widget" button that opens a sheet with the 8 options; keep Compact visible | Wrap allowed | Single row |
| Hidden-zones strip | `text-[11px]` chips, full-width row | unchanged | unchanged |
| Settings panel | **Bottom sheet** at `<sm`: full width, `rounded-t-[28px]`, `max-h-[88svh]`, drag-handle bar on top; respect `safe-area-inset-bottom` | Right drawer 420 px | Right drawer 420 px |
| Favorite editor | **Full-screen** at `<sm`: `inset-0`, no `p-4`, `rounded-none`, sticky header with Close, sticky Save button anchored to bottom with `safe-area-inset-bottom` | Centered modal `max-w-md` | Centered modal `max-w-md` |
| Icon picker | `grid-cols-6` at `<sm` (52 px pitch, ≥ 44 px target) | `grid-cols-7` | `grid-cols-7` |

Spacing tokens: at `<sm` step everything one notch tighter — page 12, section gap 16, card gap 12, intra-card 8.
Typography scale: `text-2xl` greeting → `text-xl`; `text-xl` input → `text-base`; `text-lg` modal title stays.

## 4. Edit-mode chrome on mobile

The current decision (auto-stack, drag/resize disabled at `<sm`, banner "Open on a larger screen") is correct — touch-resize on a 4-col grid is fiddly and the user goal on mobile is *read*, not *arrange*. Refinements:

- **Hide the widget tray entirely** at `<sm`. A user who can't drag also can't usefully add. Keep only **Compact** (no-op effectively, but harmless) plus the trailing per-widget `⋯` (variant pick + remove still useful as content edits).
- **Hidden-zones strip** stays — show/hide is content-level, not layout.
- The "Open on a larger screen" banner moves from below the canvas to **above** it, so the user sees the constraint before scrolling through widgets.

## 5. Settings + modals on mobile

**Settings panel** today is a 420 px right-drawer inside `inset-0 p-3`. On 390 px the 12 px right padding leaves rounded corners floating in space. Fix:

- `<sm`: full-bleed bottom sheet. `class="fixed inset-x-0 bottom-0 max-h-[88svh] rounded-t-[28px] pb-[max(env(safe-area-inset-bottom),16px)]"`. Add a 36×4 px `--border` drag indicator at the top center.
- `≥sm`: keep right drawer, but switch to `inset-y-0 right-0 max-w-[420px] m-3 rounded-[28px]` so it docks cleanly with no left gap.
- Backdrop `bg-black/30 backdrop-blur-sm` unchanged. Trap focus, close on Esc, close on backdrop click.

**Favorite editor**: full-screen on `<sm` (see table). Critical because the icon picker grid + URL field + metadata row + Save button must all be reachable when iOS keyboard takes ~290 px. Use `100svh` not `100vh` to avoid the iOS Safari address-bar jump. Sticky Save with `safe-area-inset-bottom` keeps the primary action one thumb away.

## 6. Search bar at 390 px

Smallest set of changes to keep the pill on one line and the menu fits:

1. Remove the **filter (`FiSliders`)** button at `<sm` — its function isn't documented and it competes with the provider button. Reintroduce at `≥sm`. (If product wants it kept, hoist it into the provider menu under "Search settings".)
2. Provider button: drop `sm:px-5 sm:text-base`, use `px-3 text-sm` at `<sm`; keep icon + chevron only.
3. Input: `text-base` at `<sm`, `sm:text-xl`. Placeholder shortens from "Search the web…" to "Search…" at `<sm`.
4. Pill `min-h-[64px]`, `gap-2`, `px-4` at `<sm`; `sm:min-h-[78px] sm:gap-3 sm:px-5`.
5. Dropdown: `w-[min(92vw,340px)]`, anchor `right-0 top-[calc(100%+8px)]`, max-h `60svh` so it never exceeds viewport.

After: 390 − 32 page = 358 px pill. Inside: 16 + 24 (search icon) + 8 + flex-1 input + 8 + 44 (provider chip) + 16 = leaves ~210 px input. Fits.

## 7. Favorites grid

Recommend `grid-cols-4` at `<sm`. Rationale: iOS Home Screen, app picker, Spotlight all use 4-up; users read justHomePage as a launcher. Tile width at gap-2: (390 − 24 page − 24 gaps) / 4 ≈ 85 px — still hits the 44 px touch target with the 12×12 icon plate centered. Drop scale to `compact` automatically? **No** — leave scale to user; just verify the `compact` size still meets 44 px at 4-up (78 min-h with 40 px icon: yes).

`Add` tile remains the last cell; if the grid wraps to a row of 1 with only "Add", that's fine.

## 8. Header + greeting at 390 px

Today: `text-2xl` greeting on row 1; row 2 is `flex items-center gap-4 text-sm` of 4–5 chips. Wraps unpredictably. Target:

```
[ ☀ Good evening ]              text-xl, semibold
[ Mon, 1 May · 28°C ]            text-xs, muted
[ 📍 Bangkok ]                   text-xs, muted
```

Use `flex-col gap-1 sm:flex-row sm:items-center sm:gap-4`. Hide tz at `<sm` (already hidden). Right-side header buttons (Edit, Settings) stay at 44×44.

## 9. Accessibility under responsive

- Focus order survives stacking — DOM order is search → favorites → workspace by default; reordering zones with dnd-kit preserves DOM.
- Bottom-sheet settings: focus traps to the sheet; first focus lands on the back button or close; Esc closes.
- Full-screen favorite editor: `aria-modal="true"`, sticky Save remains in tab order before Close so the keyboard user can submit without scrolling.
- Reduced motion: bottom-sheet slide-in honors `prefers-reduced-motion` (snap, no tween).
- Touch targets: every interactive on mobile measured ≥ 44×44 (favorites add tile, provider chip, settings tile rows, range thumbs).
- Contrast tokens unchanged; no new colors.

## 10. Edge cases

- **Long greeting** ("สวัสดีตอนเย็น") — uses `truncate` on the greeting line; meta row fixed.
- **No location permission** — meta row collapses to date + tz only; no empty pin glyph.
- **No widgets** — empty-state panel `w-[320px]` stays centered; on mobile clamp to `w-[min(320px,calc(100vw-32px))]`.
- **Very small viewport (320 px)** — favorites at 4 cols still works (~64 px tile); search pill drops to `min-h-[56px]`; settings sheet edge-to-edge.
- **RTL / Thai** — mirror right-side header buttons; bottom-sheet is RTL-safe (full width); favorite-editor sticky Save unchanged.
- **iOS Safari address bar** — use `svh` units everywhere bottom-anchored.

## 11. Acceptance checklist

- [ ] On 390×844, search pill stays single-line with placeholder "Search…", provider chip icon-only, no slider button visible.
- [ ] On 390×844, greeting block stacks vertically; no wrapping mid-row.
- [ ] On 390×844, favorites render 4 columns; every tile ≥ 44×44 hit area.
- [ ] On 390×844, settings opens as a bottom sheet with rounded top corners and a 36×4 drag indicator; respects `safe-area-inset-bottom`.
- [ ] On 390×844, favorite editor is full-screen; Save button sticks to the bottom above the home indicator.
- [ ] On 390×844 in edit mode, the workspace header shows only Compact + a single "Add widget" trigger; no inline tray of 8 chips.
- [ ] On 390×844 in edit mode, the "Open on a larger screen to rearrange" hint appears above the canvas, not below.
- [ ] On 834×1194, settings remains a 420 px right drawer with `m-3` gap; favorites render 6 columns.
- [ ] On 1440×900, every surface visually identical to today (no regression).
- [ ] All interactive elements meet WCAG 2.5.5 (44×44) on coarse pointers.
- [ ] `prefers-reduced-motion` honored on bottom-sheet entry, modal entry, RGL drag.
- [ ] Lighthouse mobile a11y ≥ 95; no horizontal scroll at 320 px.

## 12. Open questions

1. Filter button (`FiSliders`) inside search pill — what is its job? If it's dead, remove permanently across all viewports. **User input.**
2. Bottom-sheet drag-to-dismiss — implement now or defer to a polish pass? Recommend defer; one-tap close from the X is enough.
3. Should favorites scale auto-shift to `compact` on mobile when user has `large` selected? Recommend **no** — respect user choice. **User confirm.**
4. Tablet portrait (834) — keep 6 favorites cols or 8? Recommend 6 for breathing room. **ux-explorer call.**
5. Custom breakpoint for 320 px? Recommend no — Tailwind `<sm` covers it; check at 320 only as a regression guard.

## Cross-references / changes

- `docs/ux/ux-blueprint.md` — Primary Screen and Mobile rules: refresh with the new bottom-sheet/full-screen modal patterns and 4-up favorites.
- `docs/ui/ui-design.md` — add a "Responsive scale" subsection mapping mobile/tablet/desktop spacing and typography reductions.
- `docs/ux/specs/2026-05-01-widget-grid-layout.md` — Section 7 (Mobile) reference confirmed; cross-link this spec.
- `docs/testing/` — add a Playwright matrix at 390/834/1440 covering search submit, favorite add, settings open, edit-mode banner.

## References

- Apple HIG, *Layout* — "respect safe areas… components within them have appropriate spacing." (https://developer.apple.com/design/human-interface-guidelines/layout)
- Material 3, *Bottom sheets* — full-width sheets are the standard mobile container for secondary tasks. (https://m3.material.io/components/bottom-sheets/overview)
- WCAG 2.5.5 *Target Size (Enhanced)* — touch targets ≥ 44×44 CSS px. (https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
