# Widget Grid — Edit-Mode Visual Language

_2026-05-01 · ux-explorer · scope: edit-mode chrome, drag/resize handles, variant picker, snap feedback_

Companion to `2026-05-01-widget-redesign.md` (Quiet OS) and `2026-05-01-widget-size-redesign.md`. Body design is **unchanged**: each widget remains a calm instrument with one accent touch. This round only specifies the chrome that appears **above** the body when `editMode` is on.

## 1. Brief

The grid should feel like **calm graph paper that lifts into view only while editing**. When edit mode toggles on, faint ruled lines fade in beneath the workspace so the user reads the rhythm of placement; when it toggles off, the paper recedes and the wallpaper takes over again. Drag and resize affordances are token-derived, never decorative — every line on screen earns its keep. The Quiet OS body language defined previously is preserved verbatim.

## 2. Edit-mode background (graph paper)

- **Stroke colour**: `color-mix(in oklab, var(--accent-soft) 50%, transparent)`. Falls back to `--border` at 60% on themes where `--accent-soft` is < 6% alpha (see §7).
- **Line weight**: 1 px CSS (renders sub-pixel on 2x). Both axes.
- **Cell**: matches the structural grid's `cellSize` — no parallel "decorative" grid.
- **Implementation**: single `background-image` of two `repeating-linear-gradient`s on the workspace wrapper, gated on `data-edit-mode="true"`.
- **Opacity**: 0 → 0.6 on enter, 0.6 → 0 on exit. **220 ms** ease-out, slightly slower than widget transitions so the paper feels like it "lifts up under" the tiles.
- **Major lines**: every 4th line at 1.4× alpha — gives the eye a coarser anchor without adding a second token.

```
┌───────┬───────┬───────┬───────┐
│       │       │       │       │   ← faint --accent-soft @ 50%
├───────┼───────┼───────┼───────┤      every 4th line slightly darker
│   ▓▓▓▓▓▓▓ widget ▓▓▓▓▓ │       │
└───────┴───────┴───────┴───────┘
```

## 3. Drag affordance (header grab)

- **Cursor**: header gets `cursor: grab`; while `isDragging`, body root flips to `cursor: grabbing`.
- **Dragged tile**: `scale(1.02)` (not 1.05 — that overshoots into snap targets), `shadow-lg` lifted from the existing `shadow-tile`, 1 px inner ring in `--accent` at 40%, opacity stays 1 (current 0.6 is too ghostly, makes users think they dropped it).
- **Drop placeholder**: a dashed 1.5 px outline in `--accent`, fill `--accent-soft @ 30%`, same rounded-[18px] corners. Sits at the snap target {x, y, w, h}.
- **Off-grid hover** (mouse between cells): the placeholder still snaps; cursor stays `grabbing`. No "free placement" preview — discourages misuse.
- **Motion**: pickup 140 ms `cubic-bezier(0.2, 0.7, 0.1, 1)`; placeholder follows on the same easing. Drop = 160 ms settle.
- **No body animation during drag** — Quiet OS rule still holds: `pointer-events-none` on the body, motion suppressed.

## 4. Resize affordance

- **Where**: **corners only** (4 handles), not edges. Justification: free `(w, h)` placement already lets the user reach any size in two corner drags; edge handles double the chrome and clutter widgets that are visually busy on `vibrant`/`neon` themes. Corners are the iPad Stage Manager precedent.
- **Handle**: 14×14 px rounded-[4px] square, `--accent` background, 2 px inner ring of `--surface` (not white — flips correctly for dark themes). Centred on the corner with a 4 px outward offset so they never overlap content.
- **Hover**: handle scales to 1.15 in 120 ms; cursor flips to `nwse-resize` / `nesw-resize` per corner.
- **Drag preview**: live dashed outline of the projected `{w, h}` snapped to grid cells; floating chip top-left of the outline showing `4×3` in `--ink-inverse` on `--accent`, 11 px font, `tabular-nums`. Chip fades in 100 ms after the drag starts (so a quick click never flashes one).
- **Snap feedback**: when the cursor crosses a cell boundary, the outline jumps with a 90 ms `ease-out`, paired with a 1-frame brighten of the affected grid line (alpha 0.6 → 0.9 → 0.6). No haptics, no sound.
- **Locked widgets** (`allowedSizes.length === 1`): handles **not rendered**. No greyed-out fakes — silence is the affordance.

```
  ┌■─────────────────────■┐
  │         clock          │     ■ = 14×14 accent handle
  │    ┌─ 4×3 ─────────┐   │     dashed outline = projected snap
  │    │  09:42         │   │
  └■─────────────────────■┘
```

## 5. Variant picker (inside the `⋯` overflow popover)

- **Popover width**: 240 px (was 160 px). **Max height**: 320 px. Scrolls when ≥ 5 variants using the same `mask-image` fade-bottom trick from the size-redesign doc.
- **Layout**: a "Size" section on top, a 1 px `--border` divider, then "Remove" below.
- **Each row** (40 px tall, full width):
  - Left: 28×20 px mini-preview rectangle, proportional to `{w, h}`, filled with `--surface-strong`, 1 px `--border`.
  - Centre: humanised label (`Square`, `Banner`, `Display`, `Marquee`) at `text-sm font-medium`.
  - Right: `w×h` chip in `text-[11px] tabular-nums`, muted bg `--surface`, `--muted` ink.
- **Active variant**: filled `--accent-soft` row background + 1 px `--accent` left border (3 px wide), label switches to `--ink` weight 600.
- **Hover**: row bg `--surface-strong`, mini-preview gets a 1 px `--accent` ring.

## 6. Per-widget variant ideas

Names + character only — engineering picks the {w, h} numbers.

| widget | variants |
|---|---|
| **clock** | `Square` (compact stack), `Banner` (wide HH:MM with timezone right), `Display` (huge time, full hero), `Marquee` (very wide, horizontal time + weekday + tz on one line) |
| **date** | `Square` (day digit only), `Card` (digit + weekday + month), `Calendar` (digit + week + ISO week chip), `Strip` (wide single-row date) |
| **weather** | `Glance` (temp + glyph), `Today` (temp + hi/lo + location), `Forecast` (today + 3-day strip), `Hero` (temp huge + condition + location + 3-day) |
| **pomodoro** | `Dial` (square ring + time inside), `Focus` (ring + controls right), `Studio` (large ring + time + controls in three columns), `Strip` (wide horizontal ring + state) |
| **notes** | `Card` (square sheet), `Page` (tall, more lines), `Spread` (wide, two-column note), `Index` (tall list of recent notes) |
| **quickLinks** | `Stack` (1-col list), `Grid` (2-col), `Wall` (3-col wide), `Launcher` (tall scrollable list) |
| **todo** | `List` (square 4 rows), `Page` (tall 8+ rows), `Board` (wide split: open / done), `Inbox` (tall with input always visible) |
| **bookmark** | `Tile` (favicon + caption), `Card` (favicon + caption + host + description), `Strip` (wide favicon-row), `Hero` (large favicon + caption centred) |

## 7. Theme robustness

- **paper / mist / sand (minimal-light)**: `--accent-soft @ 50%` washes out below visibility. Mitigation: when `--accent-soft` alpha resolves < 8%, fall back to `--border @ 70%` for the grid stroke; handles still render in `--accent`.
- **noir / abyss (minimal-dark)**: same low-alpha story; same fallback applies.
- **cyber / neonCyan / neonPink / neonViolet (neon)**: `--accent-soft @ 50%` is too loud — the grid hums. Mitigation: clamp grid alpha at 0.18 when `style === "neon"`; major-line multiplier drops from 1.4× to 1.2×.
- **inferno / nebula (dark vibrant)**: handle's 2 px `--surface` inner ring can disappear over `--tile`. Mitigation: switch inner ring to `--ink-inverse` when `category === "dark"` and `style === "vibrant"`.
- **dawn / sunset / honey (light vibrant)**: handles are fine; drop-placeholder `--accent-soft @ 30%` can collide with a warm wallpaper. Mitigation: bump placeholder fill to 40% on light-vibrant only.

## 8. Motion guidelines

| event | duration | easing |
|---|---|---|
| edit-mode grid fade | 220 ms | `ease-out` |
| header grab pickup | 140 ms | `cubic-bezier(0.2, 0.7, 0.1, 1)` |
| drag drop settle | 160 ms | same |
| resize handle hover | 120 ms | `ease-out` |
| resize snap step | 90 ms | `ease-out` |
| size chip fade-in | 100 ms (delayed) | `ease-out` |
| variant picker open | 140 ms | same |

All within the 120–180 ms house rule except the grid fade (220 ms — intentional, the workspace "lifts" rather than snaps).

## 9. Empty state

When `widgets.length === 0` and edit mode is on:

- Centred on the grid: a 320×180 dashed rounded-[18px] panel in `--border`, fill transparent.
- Inside: `FiPlus` icon (28 px, `--muted`), then `text-base font-medium --ink` headline **"Add a widget to get started"**, then `text-sm --muted` sub **"Pick from the tray below — or press `A` to open it."**
- When edit mode is off and there are no widgets, the panel becomes a single line: `text-sm --muted` "Turn on Edit to place widgets." centred. No dashed box (off-mode should never show edit chrome).

## 10. References

- [Notion Home dashboard](https://www.notion.so/product/home) — widgets reflow on a soft grid; takeaway: chrome appears only on hover, never permanent.
- [Grafana panel drag/resize](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/) — corner+edge handles work for data density but feel heavy; informs our corners-only choice.
- [Apple iPad Stage Manager](https://support.apple.com/guide/ipad/use-stage-manager-ipad13a22427/ipados) — corner-only resize with snap rails; our direct precedent for handle placement.
- [Linear inbox](https://linear.app/) — quiet keyboard-first chrome, only the active row shows controls; mirrors our "locked widgets get no handles" rule.
- [Things 3](https://culturedcode.com/things/) — confident accent on one element only; reinforces the single `--accent` handle vs. multi-colour clutter.
