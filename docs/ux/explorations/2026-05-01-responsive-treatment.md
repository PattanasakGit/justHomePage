# Responsive Treatment — Visual Direction Across iPhone / iPad / MacBook

_2026-05-01 · ux-explorer · branch `feat/responsive-polish` · partners with `docs/ux/specs/2026-05-01-responsive-polish.md` (ux-lead, in-flight)_

> **Coordination note.** ux-lead's structural spec was not on disk at write
> time. Visual choices below stay agnostic to layout primitives (zone count,
> nav shape) and only describe **what shifts** between viewports. Flag any
> conflict on integration.

## 1. Brief

On **iPhone**, justHomePage is the first thing the user opens between tasks — held one-handed, glanced at. The page should feel like a calm Lock Screen page, not a shrunken desktop: type-led, edges close to the device frame, motion short and quiet. On **iPad**, it becomes a tactile launcher — favorites blossom into a fuller grid, widgets gain headroom, and the wallpaper has room to breathe behind glass. On **MacBook**, it is a workstation home — the full Quiet OS palette, deeper shadows, free-placement workspace, hover states, and keyboard affordances. Same instrument, three densities — never three different products.

## 2. Cross-viewport visual rules

- **Type scale.** Greeting `text-2xl` on iPhone → `text-3xl` iPad → `text-4xl` MacBook. Search placeholder `text-base` mobile → `text-lg` desktop. Widget hero digits scale with their card (already container-driven), but **labels** drop one step on mobile (`text-[10px]` vs `text-xs`).
- **Density.** Outer page padding `px-4` mobile / `px-8` iPad / `px-12` MacBook. Grid gap `8 → 10 → 12` (already in RGL config — keep). Inner widget padding `p-3` mobile / `p-4` desktop.
- **Accent intensity.** Mobile reduces decoration to keep content dominant: weather's `--accent-soft` background gradient drops to ~60 % alpha, pomodoro break dashes thicken from 4-6 to 5-8, quick-link hover rings are suppressed entirely (no hover on touch). Desktop carries the full Quiet OS accent vocabulary.
- **Motion duration.** Mobile `120 ms`, iPad `140 ms`, MacBook `160 ms` (within the 120–180 envelope). Easing stays `cubic-bezier(0.2, 0.7, 0.1, 1)`. Drag during widget reorder is desktop-only — no expensive transforms on mobile per RGL spec.
- **Surface depth.** Shadows lighten on smaller surfaces: tile shadow `0 1px 2px rgba(0,0,0,.06)` mobile → `0 4px 16px rgba(0,0,0,.10)` MacBook. Settings drawer drops its blur radius from 24 px (desktop) to 12 px (mobile sheet) — cheaper to scroll over.
- **Shape rounding.** Cards `rounded-2xl` (16 px) mobile, `rounded-[18px]` desktop (existing token). Drawers/modals stay 28 px on desktop; mobile sheets use `rounded-t-3xl` only (top corners) so the bottom melts into the device edge.
- **Focus & hover.** Mobile suppresses hover-only chrome (external-link glyphs, plate rings, drag handles). Replace with **press-state** scaling: `active:scale-[0.98]` on tappable surfaces, 100 ms decay.

## 3. Per-surface treatment

**Header / greeting.** Desktop: greeting + weather/location strip share one row, hairline divider between them. iPad: same row, slightly tighter. iPhone: **stack** — greeting on line 1 (`text-2xl`), weather strip becomes a single muted line below (`text-xs`, `MapPin · 28°C · Bangkok`). The `LOCAL` glyph hides; only the temp + city remain.

**Search pill.** Desktop: full pill, `h-12`, `px-6`, dropdown `max-h-[420px]`. iPhone: compact bar `h-11`, `px-4`, `rounded-2xl` (not full pill — tightens against the page), dropdown becomes a bottom-anchored sheet `max-h-[60vh]` so the keyboard never covers it. Loupe glyph stays left; clear-x stays right; engine chips collapse into a single trailing `⋯` on mobile (tapped → bottom-sheet picker).

**Favorites grid.** Desktop 6 cols, iPad 5 cols, iPhone **4 cols** (not 3 — keeps tile size reasonable for thumb-flick scanning). Tile size: 64 px mobile → 80 px desktop. **Labels** stay visible on all viewports for first-run readability; in **edit mode** mobile shows a small reorder grip overlay instead of drag — see Edit-mode below.

**Workspace.** Mobile is single-column auto-stacked (already in RGL `sm` breakpoint). Each widget renders its **smallest variant body** automatically:
- clock → `compact` (HH:MM + seconds bar, no AM/PM column)
- date → `compact` (day digit + short weekday)
- weather → mobile-special: single horizontal line `[glyph] 28° · Bangkok` at `text-3xl` glyph + temp, no gradient, no hi/lo
- pomodoro → `pomo-compact` (no ring, single-row tabs · digits · controls; the 2 px progress bar pinned bottom)
- todo / notes → full width, max-height `40vh` then internal scroll
- quickLinks → single column, mask-fade, max 6 visible
- bookmark → full-width strip (icon plate left, caption + host inline right) — the launch-tile becomes a launch-row on mobile

**Settings drawer.** Desktop: right-anchored 380 px panel, 28 px radius, deep shadow. Mobile: full-screen **sheet** — `rounded-t-3xl`, 4 px × 36 px **drag-handle bar** centered at the top in `--muted` at 50 % alpha, content scrolls under a sticky header that carries Done/Close. Sheet snaps at 92 vh; swipe-down dismisses.

**Modals (favorite editor, icon picker).** Desktop: centered card, max-w 480 px, backdrop blur. Mobile: bottom sheet with the same handle bar treatment. Icon picker grid stays `grid-cols-7` desktop but becomes `grid-cols-6` on mobile so 11×11 px tiles get touch-comfortable.

**Edit-mode affordances.** Drag/resize are RGL-disabled on `sm`; the resize handle and drag-shadow chrome therefore never render on mobile. Replace them with: (a) a muted footnote pinned above the workspace `Workspace layout is set on a larger screen`; (b) per-widget inline buttons row in the header — `↑ ↓ ⋯` (manual reorder + variants/remove popover). The grid-paper background is suppressed entirely on mobile (no value, costs paint).

```
iPhone widget edit chrome
+--------------------------------+
| Pomodoro          ↑  ↓   ⋯    |   header strip; no drag dots
+--------------------------------+
| FOCUS · BREAK         25:00    |   pomo-compact body
| ============------------------ |
| [ Start ]   [ Reset ]          |
+--------------------------------+
```

## 4. Two divergent directions

- **A. "Native Calm" (recommended).** iOS-feel restraint on mobile, full Quiet OS on desktop. Mobile strips decoration (no hover rings, no gradient washes, lighter shadows, suppressed grid-paper); desktop carries the whole instrument panel. Trade-off: mobile is plainer than the desktop "show", but reads instantly under sun and lives within thumb reach.
- **B. "Touch-First".** Chunkier targets and bigger accents everywhere, denser desktop with the same mobile chrome scaled up. Trade-off: spectacular thumbnail on the App Store, but desktop feels juvenile and competes with the user's wallpaper — the exact failure Quiet OS was created to avoid.

**Pick: Native Calm.** justHomePage's premise is that the user picked a wallpaper and a theme; the chrome must defer. Native Calm preserves Quiet OS on the workstation while making mobile feel like it belongs next to Apple's own Lock Screen widgets — same tonal restraint, same single-accent rule, just smaller and quieter.

## 5. References

- [Material 3 — Window size classes (compact/medium/expanded)](https://m3.material.io/foundations/layout/applying-layout/window-size-classes) — confirms three-class model maps cleanly to our `sm/md/lg` RGL breakpoints.
- [iOS 18 Lock Screen widgets — sizes & resize](https://medium.com/@bhumibhuva18/ios-app-widgets-appclips-interactive-experiences-in-ios-18-0f0ea8ac53d9) — "small, medium, or large" sizes; validates per-widget mobile body fallback strategy.
- [NN/g — Bottom sheets UX guidelines](https://www.nngroup.com/articles/bottom-sheet/) — "drag handles may allow resizing to different heights or snap points"; supports settings-sheet snap behavior.
- [iPadOS 26 — Stage Manager & rounded corners](https://www.creativebloq.com/web-design/ux-ui/of-course-designers-are-losing-it-over-apples-corner-radiuses-in-macos-tahoe) — newer Apple radii are bigger; we keep 16/18 px and resist the trend (Quiet OS reads as adult).
- [Apple HIG — Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets) — "essential content fits in the smallest size and reflows in the larger ones"; codifies our auto-variant rule on `sm`.

## 6. Visual tokens

**None added.** Every shift above is achievable with existing tokens (`--ink`, `--muted`, `--surface`, `--surface-strong`, `--accent`, `--accent-soft`, `--border`, `--popup`) plus Tailwind responsive prefixes (`sm:` / `md:` / `lg:`). Two near-misses considered and rejected:

- `--radius-mobile` — rejected. `rounded-2xl` (mobile) vs `rounded-[18px]` (desktop) is a 2 px delta best handled inline; theming has no opinion.
- `--shadow-tile-mobile` — rejected. Encode in a single Tailwind utility class pair (`shadow-sm md:shadow-md`); shadow is structural, not thematic.

If a future direction wants per-viewport accent intensity (e.g. mobile pulls saturation), introduce a single derived var `--accent-quiet` computed via `color-mix(--accent, --surface 30%)` rather than a token-per-breakpoint matrix.
