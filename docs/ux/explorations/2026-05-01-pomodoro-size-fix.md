# Pomodoro size fix — clamps + per-variant compositions

> Note: brief calls the smallest variant `pomo-mini`; the registry currently
> ships `pomo-compact` (3×2). Treat `pomo-compact` as "mini" throughout — same
> role, no new variant introduced.

## 1. Diagnosis

At `pomo-compact` (today: `minW=2, minH=2`), the body collapses to roughly
~150×120 px while `PomodoroRing` renders a fixed 88 px SVG plus an
`items-end` flex column holding tabs *and* a 36 px button row. Three fixed
boxes (88 + ~96 + gap) exceed 150 px wide, so tabs overlap the ring, the
buttons wrap onto the ring's bottom arc, and the centred digits sit on the
stroke. The same overflow appears anywhere `pomo-card` is dragged below
3×3 because the regular branch hard-codes the 88 px ring with no fallback.

## 2. Variant audit + clamp tightening

| variant | today min/max (w×h) | proposed min/max (w×h) | why |
|---|---|---|---|
| `pomo-compact` | 2×2 / 4×2 | **3×2 / 5×2** | Digits + bar + inline tabs/buttons need ≥ 3 cols (~210 px). Cap height at 2 — taller would invite a ring it cannot host. |
| `pomo-card` | 3×3 / 5×4 | **4×3 / 6×4** | 88 px ring + digits + tab/button column needs ≥ 4 cols (~280 px). 3 rows still the floor. |
| `pomo-wide` | 5×3 / 8×4 | **6×3 / 10×4** | 128 px ring + oversized digits + stacked controls collide below 6 cols. |

Effect: free-resize can no longer drag any variant below a size the
composition is designed for; the user picks the variant, the variant
guarantees the room.

## 3. Three compositions

### `pomo-compact` (mini, 3×2 → 5×2) — no SVG ring
```
+----------------------------------+
| FOCUS · BREAK            [25:00] |   tabs left, digits right
| ====================------------ |   2 px accent progress bar
| [ Start ]   [ Reset ]            |   inline buttons row
+----------------------------------+
```
- Digits: `text-3xl font-semibold tabular-nums tracking-tight`,
  colour `var(--accent)`.
- Bar: `h-[2px] w-full rounded-full bg-[color:var(--surface-strong)]` with
  inner `bg-[color:var(--accent)]` width = progress %.
- No `<PomodoroRing>` rendered at this variant.

### `pomo-card` (default, 4×3 → 6×4) — keep current ring left
- `flex items-center gap-4`: `<PomodoroRing size="sm">` (88 px) on the
  left **as today**, but the right column is now an explicit
  `grid-rows-[auto_auto] gap-2` so tabs sit above buttons without
  `items-end` wrap. Digits stay inside the ring as overlay (`text-base`).
- Tighten: replace the right column's `items-end` flex with the rows-grid
  above; otherwise unchanged.

### `pomo-wide` (6×3 → 10×4) — confirm the auto/1fr/auto plan
- `grid-cols-[auto_1fr_auto] items-center gap-6` from the size-redesign
  doc still applies: `<PomodoroRing size="lg">` (128 px) left, big digits
  centre (`text-4xl`), tabs above buttons right. Verified — keep.

## 4. Universal rule for `pomodoro-ring.tsx`

> The ring must always fit inside its parent's content box minus a 12 px
> safety margin on every side. If `min(parentWidth, parentHeight) − 24 <
> RING_SIZE_PX[size]`, the component renders **nothing** (returns `null`
> and the host falls back to the flat progress bar). Concretely: gate
> render behind a `ResizeObserver` measurement; below ~112 px of available
> square space, do not render the SVG.

This makes the ring self-correcting under any future free-resize.

## 5. Decision matrix

| variant | w | h | ring? | digits | tabs | buttons |
|---|---|---|---|---|---|---|
| `pomo-compact` | 3–5 | 2 | no (flat bar) | `text-3xl` right | inline left | inline below |
| `pomo-card` | 4–6 | 3–4 | `sm` 88 px left | `text-base` overlay | top-right | bottom-right |
| `pomo-wide` | 6–10 | 3–4 | `lg` 128 px left | `text-4xl` centre | top-right | bottom-right |

## 6. Cap copy

Empty / loading / error states are unchanged — `pomo-compact` reuses the
existing copy at smaller scale; no new strings.

---

**Tailwind cheatsheet for the engineer**

- Compact digits: `text-3xl font-semibold tabular-nums tracking-tight text-[color:var(--accent)]`
- Compact bar track: `h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--surface-strong)]`
- Compact bar fill: `h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-150`
- Card right column: `grid grid-rows-[auto_auto] gap-2 justify-items-end`
- Ring guard wrapper: `aspect-square shrink-0` on the ring slot
