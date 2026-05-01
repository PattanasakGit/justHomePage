# Widget Redesign — Per-Widget Visual Brief

_2026-05-01 · ux-explorer · scope: clock, date, notes, quickLinks, pomodoro, todo, weather, bookmark_

## 1. Brief

The widget set should feel like a **calm panel of personal instruments**: each tile honest about its single job, each one wearing the active theme like cloth instead of paint. Today every widget body shares the same flat 14-px grey-on-grey vocabulary, so the dashboard reads as one repeated card. The redesign gives each widget a distinct silhouette — a hero element, a confident scale, and one disciplined accent touch — while staying inside the existing token system so all 28 themes still light up correctly.

## 2. Cross-cutting visual language

- **Type scale, three steps only.** Hero (`text-5xl/6xl`, `font-semibold`, `tracking-tight`), label (`text-xs uppercase tracking-[0.18em] text-muted`), body (`text-sm leading-6`). No size between 16 and 36 px.
- **One accent per tile.** `--accent` lights exactly one element: a pulse dot, a fill bar, a checked box, an active ring. Soft fields use `--accent-soft` (already defined as `accent @ 14%`); never two saturated accents in the same widget.
- **Inner tile = `--surface`, divider = `--border @ 60%`.** Never nest a second card; use a 1-px hairline + 12-px gutter to subdivide a tile. This protects glass widgets on `vibrant`/`neon` themes where double-glass goes muddy.
- **Motion 120-180 ms, `cubic-bezier(0.2, 0.7, 0.1, 1)`.** Progress arcs animate `stroke-dashoffset` only (cheap). No widget animates during drag — `pointer-events-none` while `isDragging`.
- **Theme acknowledgement.** Each widget exposes one accent-tinted element so swapping theme is instantly legible: clock colon, date day-number, notes caret line, pomodoro ring, todo checkbox, weather temp glyph, bookmark plate ring, quick-link active dot.

## 3. Per-widget direction

### Clock — "Station Clock"
- **Hero.** Time at `text-6xl`/`6xl`, `tabular-nums`, weight 600. Seconds become a slim accent-coloured line that sweeps under the hour:minute, 1-px tall, animating width every second.
- **Hierarchy.** time → small AM/PM tag (`text-[11px]` muted) → timezone in label-case at the bottom.
- **Accent.** Blinking colon (1 s opacity 1↔0.4) and the seconds bar.
- **Texture / motion.** No gradient. Colon blink and seconds line are the only animations.
- **Empty/loading.** Show `--:--` with the colon static; reveals at first tick.
- **Theme robustness.** Reads on all 4 styles; on neon themes the seconds line glows naturally via accent.

### Date — "Today Card"
- **Hero.** Big day number (e.g. `01`) at `text-6xl`, weight 700, accent-tinted. Right column stacks weekday and month.
- **Hierarchy.** day-number → weekday (`uppercase tracking-[0.2em]`) → month + year (muted) → micro-quote.
- **Accent.** The day-number digit is `color: var(--accent)`; everything else is ink/muted.
- **Texture.** Vertical hairline divider between number and stack.
- **Empty.** Never empty; always today.
- **Theme robustness.** On `minimal` light themes the accent number is the only colour — keeps the brief honoured.

### Notes — "Pocket Paper"
- **Hero.** A single textarea, but framed as a sheet: top edge has a 2-px accent bar that becomes solid only on focus (otherwise `--accent-soft`).
- **Hierarchy.** label "Note" (small, top-right) → body → bottom-right autosave dot ("saved" pulses then fades).
- **Accent.** The focus bar and the save dot.
- **Texture.** Subtle ruled lines via `background-image: linear-gradient(transparent calc(1.5em - 1px), var(--border) 1.5em)` so the sheet looks lined without nested cards.
- **Empty.** Placeholder "Drop a thought. Autosaves locally."
- **Theme robustness.** Ruled lines disappear gracefully on neon (border alpha low) — acceptable.

### Quick Links — "Pad of Pills"
- **Hero.** A 2×2 (or 2×3 at `middle`) grid of pill buttons; each pill carries a 6-px leading dot in a deterministic accent-derived hue (rotate hue 30°/60°/90° from `--accent`, derived in JS, not hardcoded).
- **Hierarchy.** label dot → name (`text-sm font-medium`) → external-link glyph appears on hover only.
- **Accent.** Dots cycle around `--accent`; hover lifts background to `--surface-strong`.
- **Texture/motion.** Hover: 1-px translate-y. Focus ring uses `--accent`.
- **Empty.** "Add links in settings — they appear as launch pills."
- **Theme robustness.** Hue rotation can clash on saturated neon themes — clamp saturation when contrast is dark.

### Pomodoro — "Quiet Ring"
- **Hero.** Replace the linear bar with a **circular progress ring** (SVG, 140-px diameter, 6-px stroke). Ring stroke is `--accent`; track is `--surface-strong`. Time sits centred inside.
- **Hierarchy.** ring + time → mode pill (focus/break) below → play/reset row at the bottom.
- **Accent.** The ring stroke. Focus mode = solid ring; break mode = dashed ring (`stroke-dasharray: 4 6`).
- **Motion.** Ring animates `stroke-dashoffset` linearly per second; play button scales 0.96 on press.
- **Empty/idle.** Ring at 0 %, time shows the configured focus minutes.
- **Theme robustness.** Strong on every style; on `minimal` light themes the dashed-break treatment is the only differentiator and works.

### Todo — "Stacked Receipts"
- **Hero.** The list itself, but each row is a flat strip with a 2-px leading edge in `--accent-soft` that fills to `--accent` while the checkbox is checked.
- **Hierarchy.** add input → list rows → footer (`{n} remaining · clear done`).
- **Accent.** Leading edge + checked box. Done text strikes through and dims to muted.
- **Motion.** Check toggle: 140 ms scale-in of the `FiCheck`; row collapses (`grid-template-rows`) on remove.
- **Empty.** Dashed strip "Nothing on the list — add a task above."
- **Theme robustness.** Strips remove the nested-card problem on glass themes.

### Weather — "Sky Slab"
- **Hero.** Temperature at `text-6xl`, accent-tinted; a condition glyph (cloud/sun/rain) sits to its right at 32 px in `--ink`.
- **Hierarchy.** label "Local Weather" → temp + glyph → high/low strip → location footer with `FiMapPin`.
- **Accent.** Temperature digits.
- **Texture.** A faint top-to-bottom gradient `from var(--accent-soft) to transparent` sitting behind the temp — only visible on `vibrant` and `neon`, harmless on `soft`/`minimal` because of low alpha.
- **Empty / blocked / error.** Blocked: "Allow location to see weather" with a `FiMapPin` outline. Loading: shimmer on the temp slot only. Error: "Couldn't reach the sky right now."
- **Theme robustness.** Gradient uses `--accent-soft` so it auto-adapts; works everywhere.

### Bookmark — "Launch Tile"
- **Hero.** A 44-px rounded plate with the favicon (kept light per brand-icon rule), centred over a one-line title.
- **Hierarchy.** plate → caption (`text-sm font-semibold`) → host (`text-[11px] muted`). External-link glyph top-right, only visible on hover/focus.
- **Accent.** A 1-px ring around the plate that lights `--accent` on hover/focus.
- **Motion.** Hover: plate scales 1.03; ring fades in 140 ms.
- **Empty (no URL).** Dashed plate with `FiBookmark`, caption "Add a bookmark — paste a URL in edit mode."
- **Loading metadata.** Plate shows shimmer; caption shows the host derived from URL.
- **Theme robustness.** Plate stays light by convention, so contrast is guaranteed on every theme.

## 4. Two divergent directions for the SET

- **A. "Quiet OS" (recommended).** Each widget is calm, monochrome with one accent touch, type-led. Trade-off: less Instagrammable, more daily-driver.
- **B. "Lively Dashboard".** Bigger gradients per widget, multiple accent-tinted micro-elements, weather and pomodoro carry their own scenic backgrounds. Trade-off: spectacular on `vibrant`/`neon` themes, noisy on `minimal` themes and competes with the wallpaper.

**Recommendation: Quiet OS.** justHomePage already lets the user pick the wallpaper and one of 28 themes — the widgets must be the instrument panel, not the show. Quiet OS gives every widget a distinct silhouette through type scale and one hero element, while a single disciplined accent ensures theme swaps remain visible without the widgets fighting each other or the wallpaper.

## 5. References

- [Things 3 — restructured hierarchy & calibrated density](https://culturedcode.com/things/features/) — "delicate balance between too sparse and too dense" maps directly to our type scale.
- [iOS 26 Liquid Glass widgets, 9to5Mac](https://9to5mac.com/2025/09/26/these-30-apps-feature-a-new-liquid-glass-design-for-ios-26/) — confirms the trend: charts shine through subtle transparency layers; matches our token-driven glass.
- [Forest Focus Timer — animated drain ring](https://www.forestfocustimer.com/pomodoro-timer/) — supports the circular ring choice over the current linear bar.
- [Study Timer — colour-per-mode ring](https://toolv.com/en/app/study-timer) — validates dashed/solid stroke as a cheap mode signal.
- [Modern dashboard UI/UX 2025 principles](https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795) — reinforces the 8-pt grid and "show only what matters" rule we are applying.

## 6. New tokens

**None required.** The existing palette covers every direction:
- accent fills → `--accent`
- accent washes → `--accent-soft` (already `accent @ 14 %`)
- glass surfaces → `--surface` / `--surface-strong` / `--tile`
- dividers → `--border`
- ink pair → `--ink` / `--ink-inverse` / `--muted`

If quick-links pursues hue-rotated dots, they should be derived in JS from `--accent` (HSL rotate) at render time, not added as theme tokens. If pomodoro break-mode wants a second tint, reuse `--muted` for the dashed track instead of inventing `--accent-2`.
