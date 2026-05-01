# Widget Size Redesign — Per-Size Layout Plan

_2026-05-01 · ux-explorer · scope: clock, date, weather, pomodoro, quickLinks_

Follow-up to `2026-05-01-widget-redesign.md`. Quiet OS direction stays. Bug: bodies do not scale across `allowedSizes`; some clip below the card with no scroll. The frame already sets `overflow-hidden` on the article, so any scroll region inside MUST set `min-h-0` on every flex ancestor or content disappears.

## 1. Diagnosis

| widget × size | what breaks today |
|---|---|
| **clock-compact** | HH:MM uses `text-4xl` while tile is ~140 px tall; seconds bar + timezone footer push the time off-centre, looks tiny relative to tile. |
| **clock-regular** | Same `text-4xl` hero on a 2-col tile leaves a huge dead band on the right; nothing fills the gained width. |
| **date-compact** | `text-5xl` day stacks above two muted lines; weekday wraps "Wednesday" on narrow screens, blowing the row height. |
| **date-regular** | Hero day at `text-6xl` is fine, but right column is single-line text — wastes the gained columns; no calendar/quote utility added. |
| **weather-compact** | Temp `text-5xl` plus label, "C" suffix, location row + footer = 5 stacked lines in 1×1; the footer line clips below the card with no scroll. |
| **weather-regular** | Identical layout simply re-rendered wider; `locationLabel` shows twice (once mid, once footer). |
| **pomodoro-regular** | 96-px ring + mode pill + button row stacks vertically in a 2×1 (`row-span 1`) tile; bottom buttons get cut. This is the loudest reported bug. |
| **pomodoro-wide** | Side-by-side layout works visually, but ring is still `compact` (96 px) — wasted vertical space; controls cluster left of centre. |
| **quickLinks-regular** | `grid-cols-2`, no row cap, no scroll: > 4 links overflow the card invisibly. Also no `min-h-0` so it can never scroll. |
| **quickLinks-wide** | `grid-cols-3 sm:grid-cols-4` single-row only; > 8 entries vanish below the card. |

## 2. Per-size layout plan

### Clock

| size | composition | hero | density (largest text) | negative space | overflow |
|---|---|---|---|---|---|
| compact | HH:MM stacked over a 2 px accent seconds bar; timezone abbr only (`PT`, not full IANA). No seconds string. | HH:MM | `text-5xl font-semibold tabular-nums leading-none` | bar = sole filled element; no footer line | tz abbr `truncate`; never wraps |
| regular | Two columns: HH:MM left (huge), right column = AM/PM tag + weekday + tz full label, separated by a vertical hairline. Seconds bar spans full width below. | HH:MM (left col) | `text-7xl` left, `text-xs uppercase` right | right column ~30% width; bar full width | right-col text `truncate` |

### Date

| size | composition | hero | density | negative space | overflow |
|---|---|---|---|---|---|
| compact | Day digit + weekday + month stacked. Weekday in `short` form (`Wed`). | Day digit | `text-6xl font-bold tabular-nums text-[var(--accent)]` | digit hugs top-left; muted lines hugged below | weekday/month `truncate` |
| regular | Two-column: huge day digit left, hairline divider, right column = weekday (`long`) on top, month + year, then a third line with ISO week (`Week 18`). | Day digit | `text-7xl` digit, `text-sm` right rows | divider 1 px; right column 50% width | right rows `truncate` |

### Weather

| size | composition | hero | density | negative space | overflow |
|---|---|---|---|---|---|
| compact | Stacked: tiny `LOCAL` label, temp + °C, condition glyph as right-side hero, single footer line `MapPin · city`. **No mid location line.** | Temp digits | `text-5xl` temp, glyph 28 px | gradient sits behind temp half | error/blocked = replaces footer line, not added (so height never grows) |
| regular | Two-column: temp + glyph hero left at `text-6xl`; right column = condition word, hi/lo strip, location with map pin. Label sits top-left full-width. | Temp digits | `text-6xl` temp, `text-sm` right | right column carries everything except temp | error/blocked replaces right column rows in place |

### Pomodoro

| size | composition | hero | density | negative space | overflow |
|---|---|---|---|---|---|
| regular | Horizontal: 88 px ring left, controls right (mode pill above play/reset row). Time digits sit inside ring. | Ring + time | ring 88 px, time `text-xl` inside, controls `h-9 w-9` | ring vertically centred; controls right-aligned, vertically centred | digits never exceed `MM:SS` (2+2); if user sets > 99 min, switch to `text-lg` via container query fallback |
| wide | Horizontal three-zone: large ring 128 px left, time + mode label centre column at `text-4xl`, controls right column. | Ring (left zone) | ring 128 px, time `text-4xl`, mode `text-xs uppercase` | centre column flex-1; controls fixed width right | same digit clamp as regular |

### Quick Links

| size | composition | hero | density | negative space | overflow |
|---|---|---|---|---|---|
| regular | Vertical list (`flex-col`) of pill rows, full width each, max 4 visible; row height 40 px. Leading accent dot, label, hover external glyph. | The list itself | `text-sm font-medium` | gap-1.5 between rows; no inner card | **scrolls vertically** when > 4. Implementation: parent `flex h-full min-h-0`, list `flex-1 min-h-0 overflow-y-auto`, fade mask `mask-image: linear-gradient(to bottom, black calc(100% - 16px), transparent)` |
| wide | 2-column grid of the same pill rows; up to 8 visible. | Grid | same as regular | `grid-cols-2 gap-2` | **scrolls vertically** when > 8 with same fade-mask trick |

## 3. Cross-size constraints

For each widget, what stays constant: the **hero element identity** (clock = HH:MM, date = day digit, weather = temp digits, pomodoro = ring, quickLinks = pill row), the **single accent application** (seconds bar / day digit / temp digits / ring stroke / leading dot), and the **type family** (`tabular-nums` for clock/date/weather/pomodoro digits; default sans for labels). Only typography scale, column count, and which secondary fields are visible change per size. A user resizing a widget should feel the same instrument zoom in/out, never morph.

## 4. Theme robustness sanity check

- **paper (minimal-light)**: weather gradient behind temp uses `--accent-soft` ≈ accent @ 14%; on paper this is a faint warm tint, fine. Clock/date hero digits coloured `--accent` read on paper if the curated accent isn't pastel-yellow — flag: when accent luminance > 0.85, fall back to `var(--ink)` for the digit and keep the seconds bar as the sole accent. Quick-link leading dot uses HSL rotation from accent — same luminance guard.
- **cyber (neon-dark)**: glass `--surface` on pill rows could look muddy when stacked; the redesign removes nested cards (rows are flat strips with hairline borders). Mode pill in pomodoro uses `--ink` background — on cyber, `--ink` is light, so the active state inverts correctly (already handled). No mitigation required.
- **scroll fade mask**: `mask-image` with `black/transparent` works on any theme since it operates on alpha, not colour.

## 5. Implementation hints

- **Frame already does `overflow-hidden`.** Do NOT change that. Make the body the scroll surface.
- **Scroll-safe flex chain** (the cause of the disappearing content):
  ```
  <article overflow-hidden>           // frame
    <header />                        // fixed
    <body className="flex h-full min-h-0 flex-col">   // body root
      <div className="flex-1 min-h-0 overflow-y-auto"> // scroll region
  ```
  Every flex parent between `article` and the scroll node needs `min-h-0`, otherwise the child's `overflow-y-auto` reports infinite height and the browser silently clips.
- **Quick links scrolling list**:
  ```tsx
  <ul className="flex-1 min-h-0 overflow-y-auto pr-1
                 [mask-image:linear-gradient(to_bottom,black_calc(100%-16px),transparent)]
                 grid gap-2 grid-cols-1 sm:grid-cols-2"> // wide variant
  ```
  Use `grid-cols-1` at `regular`, `grid-cols-2` at `wide`. Drop the `sm:grid-cols-4` that exists today.
- **Pomodoro regular** layout: `flex h-full items-center gap-4` with ring fixed 88 px (`shrink-0`) and controls in a `flex flex-col gap-2 min-w-0 flex-1 items-end`.
- **Pomodoro wide** layout: `grid grid-cols-[auto_1fr_auto] items-center gap-6` so ring/centre/controls each get exactly one column.
- **Clock regular** layout: `grid grid-cols-[1fr_auto_auto] items-baseline gap-4` for time / divider / right column; seconds bar lives in a second row spanning all three columns.
- **Weather regular** layout: `grid grid-cols-[auto_1fr] gap-4 items-start`; left = temp+glyph, right = stacked rows.
- **Date regular** layout: same `grid grid-cols-[auto_1fr] gap-4` pattern, with `border-l border-[color:var(--border)] pl-4` on the right column instead of an explicit hairline element.
- **Pomodoro ring scale prop**: extend `PomodoroRingScale` from `"compact" | "full"` to `"sm" | "md" | "lg"` and pass `sm` (88) for regular, `lg` (128) for wide. Rendered diameter swap is a one-line change.
- **Container queries (optional)**: wrap each body root in `@container` and gate the largest hero size on `@container (min-width: 280px)` so a misconfigured grid never explodes the digits — this is the safety net for the user's "content disappears" complaint.

## 6. References

- [MDN — `min-height: 0` and flex overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Mastering_wrapping_of_flex_items) — confirms `min-height: auto` on flex children is what hides scrollbars; the canonical fix.
- [Apple HIG — Widgets sizing](https://developer.apple.com/design/human-interface-guidelines/widgets) — "Make sure essential content fits in the smallest size and reflows in the larger ones"; matches our composition-not-stretch rule.
- [Tailwind container queries v4](https://tailwindcss.com/docs/responsive-design#container-queries) — supports the `@container` safety net suggestion.
- [CSS Tricks — fade-out scroll mask](https://css-tricks.com/almanac/properties/m/mask-image/) — the linear-gradient mask trick used for the quickLinks scroll edge.
- [Things 3 — sizing across iPad/Mac](https://culturedcode.com/things/) — same instrument, three densities; reinforces the cross-size identity rule.
