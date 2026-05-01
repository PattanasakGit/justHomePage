# Mobile Workspace Fix — Native Calm, Strip Edition

_2026-05-01 · ux-explorer · branch `feat/responsive-polish` · supersedes the
mobile portions of `2026-05-01-responsive-treatment.md` §3 "Workspace" and
§3 "Edit-mode affordances"._

## 1. Diagnosis

1. **Half-width strips.** `home-page.tsx` `smallLayout` keeps each widget's
   variant width (`w = Math.min(COLS.sm, widget.layout.w)`). A 2-cell
   `clock-square` on a 4-cell mobile grid renders at 50 % width, sitting
   beside a void; the "single-column auto-stack" promise is never met.
2. **Header chrome eats the title.** In mobile edit mode `widget-frame.tsx`
   stacks `↑ ↓ ⋯` (three 44 px circles) inline with the title. On a half-
   width card the title truncates to one or two glyphs.
3. **Grid-paper bleeds through.** `globals.css` paints
   `.workspace-grid--edit` with a graph-paper background at every
   breakpoint. On mobile, drag/resize is disabled, so the paper is pure
   visual noise.
4. **Hero digits clip vertically.** `clock-square` / `date-square` /
   `weather-square` size their hero with `text-6xl` for a square card.
   Forced into a 4×2-cell strip (≈120 px tall) the digit is cropped at
   the baseline.

## 2. Mobile layout policy (binding)

| rule | value |
|------|-------|
| widget width on `sm` | **always `w = 4`** (full grid) |
| widget height on `sm` | **`mobileH` per widget type+variant**, see §3 |
| row gap | `MARGIN.sm = [8, 8]` (unchanged) |
| outer padding | `px-3` (unchanged) |
| grid-paper | **hidden** below `640px` |

CSS rule (drop into `globals.css` workspace section):

```css
@media (max-width: 639.98px) {
  .workspace-grid--edit { background-image: none; }
}
```

Engineer note: in `smallLayout`, replace
`const w = Math.min(COLS.sm, widget.layout.w)` with `const w = COLS.sm;`
and substitute `h` with `mobileH(widget.type, widget.variant)`.

## 3. Per-widget mobile body spec

All bodies are full-width landscape strips. Hero is left/right split: an
**identity** glyph or label on the left, a **hero datum** on the right.

| widget | mobileH | layout sketch | type ramp |
|--------|---------|---------------|-----------|
| **clock** | 1 (≈60 px) | `[FiClock] City  →  HH:MM` | digits `text-3xl tabular-nums`, city `text-xs --muted` |
| **date** | 1 | `[FiCalendar] Wed, May 01  →  01` | weekday `text-sm`, day `text-3xl --accent` |
| **weather** | 1 | `[FiCloud] Bangkok  →  28°` | temp `text-3xl --accent`, city `text-xs --muted` |
| **bookmark** | 1 | `[plate 44px] Caption / host  →  ▸` | caption `text-sm font-semibold`, host `text-[11px] --muted` |
| **pomodoro** | 2 (≈128 px) | row 1 `Focus · Break  25:00`; row 2 `[Start] [Reset]` plus 2 px progress strip | digits `text-2xl`, tabs `text-xs uppercase tracking-wide` |
| **quickLinks** | 2 | single 1-row horizontally scrollable chip strip; `mask-image` fade right; chips `h-10 rounded-full` | chip label `text-xs` |
| **todo** | 4 (≈280 px) | header (count + clear-done), list, inline add | row `text-sm`, checkbox 24×24, internal `overflow-y-auto` |
| **notes** | 4 | textarea fills strip, autosize off, internal `overflow-y-auto` | body `text-sm leading-relaxed` |

Concrete tailwind for the **single-line strips** (clock/date/weather/bookmark):

```
flex items-center gap-3 px-3 h-full min-h-0
  > [icon plate 28×28]      // text-[color:var(--accent)]
  > <span flex-1 truncate>  // label · muted
  > <span ml-auto>          // hero datum, right-aligned, accent
```

Empty / loading: weather temp shows `--`, bookmark shows the dashed-
border placeholder card (existing). Clock and date never empty.

## 4. Header chrome on mobile

- **Drop** inline `↑` / `↓` buttons from the header.
- **Keep** the `⋯` overflow trigger (44×44 on mobile, was `h-9 w-9`).
- **Move** `Move up` and `Move down` into the popover, ordered:
  Size variants → Move up → Move down → Remove. Each row is `h-11`
  (44 px). On a single-line strip the title now has the full row minus
  one circle.

```
+--------------------------------------------+
| FiClock  Bangkok          07:42      [⋯]   |
+--------------------------------------------+
            ⋯ open →
            +-------------------+
            | Size              |
            |  ◉ Square 2×2     |
            |  ○ Banner 4×1     |
            | ─────────────     |
            |  ↑ Move up        |
            |  ↓ Move down      |
            |  🗑  Remove        |
            +-------------------+
```

## 5. Edit-mode chrome on mobile

- Keep the muted hint **above** canvas: `Open on a larger screen to
  rearrange widgets.`
- Keep the footnote **below** canvas: `Workspace layout (drag/resize) is
  set on a larger screen.`
- Remove the grid-paper backdrop (§2 CSS).
- Keep the existing favorites bottom-sheet `+ Add` picker.
- The 8-chip add-widget tray stays collapsed behind the single bottom-
  sheet trigger (already shipped).

## 6. Accessibility

- Tap targets ≥ 44×44: `⋯` trigger upgrades to `h-11 w-11` on mobile.
- Popover items use `min-h-[44px]` and `px-3 py-2`, focus ring on
  `--accent`.
- Move-up on the topmost widget and Move-down on the bottommost are
  `aria-disabled="true"` (visible but non-actionable, no role removal,
  so screen readers still announce the option).
- Hero data on strips uses `tabular-nums` so swapping minutes does not
  reflow the row.

## 7. Open questions

1. **Pomodoro mobileH = 2 vs 1.** A single-row pomo strip
   (`Focus 25:00 [▶]`) fits, but loses the secondary action and progress
   bar. Recommend 2 unless the engineer finds 1 already has a
   composition that survives 60 px height.
2. **Notes/todo cap.** Spec says 4 cells (~280 px). If the user has
   eight widgets the page becomes long; an alternative is `mobileH = 3`
   and rely on internal scroll. Defer to ux-lead.
3. **Clock-banner / date-banner variants.** Their desktop intent is
   already a 4×1 strip; on mobile they collapse to the same single-line
   body as `*-square`. Confirm that's acceptable rather than preserving
   variant-specific bodies on `sm`.
