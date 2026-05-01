# Widget size matrix + minimal resize control

Date: 2026-05-01 • Owner: ux-lead • Targets: `src/components/widgets/widget-frame.tsx`, `src/components/widgets/widget-registry.ts`, `src/lib/types.ts`, `src/components/homepage/home-page.tsx`

## 1. Problem

Today every widget shares one global enum `small | middle | max`. Result: clock at `max` looks empty, notes at `small` clips, weather at `max` wastes space, pomodoro digits crop at `small`. Sizes must be **per-widget**, picked from a shared vocabulary so the grid stays predictable. Separately, the edit-mode header (three pill buttons + trash) is visually noisy — it should reduce to a single, minimal control.

## 2. Per-widget size matrix

Shared vocabulary (col-span on `lg:` 4-col workspace; mobile is always `col-span-1` on `grid-cols-1`, tablet `sm:col-span-1` unless noted):

| id | sm span | lg span | row span | min content height | typical use |
|----|---------|---------|----------|---------------------|-------------|
| `compact` | 1 | 1 | 1 | 132px | single metric / glanceable |
| `regular` | 2 | 2 | 1 | 156px | label + body |
| `wide` | 2 | 4 | 1 | 156px | timeline / horizontal list |
| `tall` | 1 | 2 | 2 | 312px | editor / scroll list |
| `hero` | 2 | 4 | 2 | 312px | rich panel |

Per-widget allowed sizes (default in **bold**):

| widget | allowed | rationale |
|--------|---------|-----------|
| clock | **`compact`**, `regular` | Time + meridiem fits 1 col; `regular` adds seconds + tz. No `max` — clock never needs a hero. |
| date | **`compact`** | Static day/date; one size only. Resize control hides. |
| weather | **`compact`**, `regular` | Icon + temp at compact; `regular` adds high/low + condition line. Cap there — forecast lives elsewhere. |
| bookmark | **`compact`**, `regular` | Thumbnail + caption. `regular` lets caption breathe. |
| quickLinks | **`regular`**, `wide` | Needs ≥3 chips on one row; `wide` fits 6–8 chips. |
| pomodoro | **`regular`**, `wide` | Digits need horizontal room — `compact` cropped them. `wide` adds focus/break controls inline. |
| todo | **`regular`**, `tall`, `hero` | List grows; `tall` shows ~6 rows, `hero` ~12 + inline add. |
| notes | **`tall`**, `hero` | Editor needs height; never `compact`. `hero` for long-form. |

Tailwind class map (engineer reference):

```
compact: ""                        // base 1-col, 1 row
regular: "lg:col-span-2"
wide:    "sm:col-span-2 lg:col-span-4"
tall:    "lg:col-span-2 row-span-2"
hero:    "sm:col-span-2 lg:col-span-4 row-span-2"
```

## 3. Default size per widget

See bolded column above. Picked so a fresh install feels balanced: clock/date/weather/bookmark stay light; quickLinks/pomodoro/todo land at `regular`; notes opens at `tall`.

## 4. Minimal resize control — pick (a) cycle button

**Decision:** single icon-only **cycle button** in the header that rotates through the widget's allowed sizes, plus a separate overflow menu (`…`) that holds **delete** and any per-widget settings.

Why not the others:
- *(b) dropdown* — adds a chevron + popover; more chrome than a cycle for ≤3 options.
- *(c) corner drag handle* — discoverable on desktop but invisible on touch and incompatible with `@dnd-kit` card drag (steal conflict).
- *(d) keyboard-only popover* — fails discoverability for the median user.

Cycle is one tap, exposes intent through its icon swap, and degrades to nothing when only one size is allowed.

### Header layout (edit mode)

```
[icon] Title …………………………………… [resize] [⋯]
```

Both trailing controls render only in `editMode`. Order: title → resize → overflow.

### Resize button

```tsx
<button
  type="button"
  aria-label={`Resize ${title}, currently ${currentSize}`}
  aria-keyshortcuts="r"
  onClick={cycleSize}
  className="grid h-11 w-11 place-items-center rounded-full text-[color:var(--muted)]
             hover:bg-[color:var(--surface-strong)] focus-visible:ring-2
             focus-visible:ring-[color:var(--accent)]"
>
  <SizeIcon size={currentSize} />
</button>
```

Icon mapping: `compact → FiSquare`, `regular → FiColumns`, `wide → FiMinus` (rotated), `tall → FiBookOpen`, `hero → FiMaximize2`. The icon **is** the state indicator — no badge needed.

State transitions: click advances `allowed[(i+1) % allowed.length]`. If `allowed.length === 1` the button is not rendered. `r` keypress on a focused widget cycles forward; `shift+r` cycles backward.

### Overflow `⋯` menu (Radix-style popover, theme tokens)

Items: `Settings…` (only if widget has config — pomodoro minutes, quickLinks list, bookmark url/caption, notes is in-place so omitted), then a danger `Remove`. This pulls "settings" out of the body — pomodoro and notes currently mix edit chrome with content.

## 5. Migration

**Pick:** keep `WidgetSize` as a **string union expanded to the new vocabulary** + a one-shot migration in the Zustand persist `migrate`. Do not branch the type per widget — a global union keeps `HomeWidget.size` portable and the registry validates membership at runtime.

```ts
export type WidgetSize = "compact" | "regular" | "wide" | "tall" | "hero";

const legacyMap: Record<string, WidgetSize> = {
  small: "compact",
  middle: "regular",
  max: "wide",
};
```

Migration step (persist version bump → `2`):
1. Map old id via `legacyMap`.
2. Clamp against `widgetRegistry[type].allowedSizes`; if the mapped id is not allowed, fall back to `defaultSize`.
3. Persist.

`widgetRegistry` gains `allowedSizes: WidgetSize[]` and `defaultSize` continues to exist. `resizeWidget(id, size)` rejects sizes outside `allowedSizes` (silent no-op + console.warn in dev).

## 6. Accessibility

- Focus order in header: drag handle (implicit, whole article) → resize → overflow.
- Resize: `role="button"`, `aria-label` includes current size, `aria-keyshortcuts="r"`. Announce size change with a polite live region scoped to the widget (`aria-live="polite"` on the title row; updates as "Notes resized to tall").
- Overflow: `aria-haspopup="menu"`, `aria-expanded`, popover items get `role="menuitem"`. Esc closes, focus returns to trigger.
- Targets: 44×44 (`h-11 w-11`) on touch; current 32px is below WCAG 2.5.5 AAA.
- Reduced motion: respect `prefers-reduced-motion` — skip the size-change scale tween, snap.
- Contrast: trailing icons use `--muted`; on hover/focus elevate to `--ink`. Verified ≥4.5:1 against `--tile` on all themes.

## 7. Edge cases

- **Long titles:** title row uses `min-w-0 truncate`; controls live in a non-shrinking flex group (`shrink-0`).
- **Single allowed size:** resize button **not rendered** — never shown as a disabled pill (avoids dead affordance).
- **Edit mode off:** entire trailing cluster hidden; header collapses to icon + title only.
- **RTL/Thai:** controls swap to start side via `[dir=rtl]:flex-row-reverse`; Thai titles avoid letter-spacing on the title.
- **320px viewport:** all widgets collapse to `col-span-1`; `wide`/`hero` lose horizontal advantage but keep row-span. Acceptable — single-column scroll is the right mobile model.
- **Drag conflict:** resize/overflow buttons add `onPointerDown={(e) => e.stopPropagation()}` so they don't initiate `@dnd-kit` drag.

## 8. Open questions

1. Should `pomodoro` get a `compact` size for users who only want a running timer glance? (Engineer: needs digit shrink; designer prefers no.)
2. `bookmark` at `regular` — show thumbnail bigger or add description? Defer to **ux-explorer**.
3. Do we expose the resize keyboard shortcut (`r`) anywhere visible, or rely on `aria-keyshortcuts` only? Suggest a one-time edit-mode coachmark.
4. Does notes need a `regular` size for short reminders, or is `tall` minimum acceptable? Confirm with user.
5. Settings popover — confirm we want it lifted out of widget body for `pomodoro` and `quickLinks` now, or stage that as a follow-up?

## Cross-references / changes

- `docs/ux/ux-blueprint.md` — update the Workspace section: sizes are per-widget; controls reduced to cycle + overflow.
- `docs/ui/ui-design.md` — replace the three-pill spec with the cycle-icon spec; add the size-icon mapping table.
- `src/lib/types.ts` — `WidgetSize` union expanded; bump persist version.
- `src/components/widgets/widget-registry.ts` — add `allowedSizes`, keep `defaultSize`.
- `src/components/widgets/widget-frame.tsx` — replace pill row with cycle + overflow; add stopPropagation; live region on title.

## References

- Apple HIG, Widgets — "Each widget supports a curated set of sizes that suit its content." (https://developer.apple.com/design/human-interface-guidelines/widgets) — backs per-widget allow-list.
- Nielsen Norman, *Icon Usability* — icon-only controls need a textual label or tooltip; we use `aria-label` + hover tooltip. (https://www.nngroup.com/articles/icon-usability/)
- W3C WAI APG, Menu Button pattern — overflow menu follows this pattern. (https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
