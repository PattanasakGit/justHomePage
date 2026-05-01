# Widget grid layout — free placement, resize, variants

Date: 2026-05-01 • Owner: ux-lead • Branch: `feat/widget-grid-layout`
Targets: `src/components/widgets/widget-frame.tsx`, `widget-registry.ts`, `src/components/homepage/home-page.tsx`, `src/lib/types.ts`, `src/stores/home-store.ts`.

## 1. Problem & goal

Today widgets snap into a 4-column flex-grid using a fixed `WidgetSize` enum, so the user cannot resize freely or place widgets where it suits them. The user wants each widget to expose multiple variants and the workspace to behave like a fine grid where any widget can be moved, dropped, and resized to any `(x, y, w, h)`. Goal: replace the enum-driven layout with a true `(x, y, w, h)` model on a 12-column grid, with drag-to-move, edge-handle resize, and a Variants picker, while keeping non-edit-mode interactions untouched.

## 2. Grid spec

| viewport | cols | cell width | row height | gap |
|---|---|---|---|---|
| desktop ≥1024px | **12** | `(container − 11·gap)/12` ≈ 76px | **80px** | 12px |
| tablet 640–1023px | **8** | ≈ 78px | 80px | 10px |
| mobile <640px | **4** | ≈ 70px | 80px | 8px |

Container width caps at 1280px (current `max-w-[1060px]` widens to fit 12 useful cells). Justification: 76px × 80px cells let a clock fit in `2×2` (≈164×172px including gap) without feeling cramped, while letting a notes panel resize in fine increments. 12 cols is the de-facto dashboard standard (react-grid-layout, Bootstrap, Grafana) and divides cleanly into halves, thirds, quarters. Row height of 80px keeps a `2×1` widget readable for one-line content (clock-banner, weather-strip).

## 3. Per-widget variants

All sizes in grid cells. **Default in bold.** `min/max` clamp the resize handles.

### clock
| id | w×h | min | max | use |
|---|---|---|---|---|
| **clock-square** | 2×2 | 2×2 | 4×3 | glanceable time |
| clock-banner | 4×1 | 3×1 | 8×2 | top-of-page strip |
| clock-display | 4×3 | 3×2 | 6×4 | full digits + tz + seconds |

### date
| id | w×h | min | max | use |
|---|---|---|---|---|
| **date-square** | 2×2 | 2×2 | 3×3 | day + date stack |
| date-banner | 4×1 | 3×1 | 6×2 | date strip |
| date-calendar | 4×4 | 3×3 | 6×5 | mini month grid (future) |

### weather
| id | w×h | min | max | use |
|---|---|---|---|---|
| **weather-square** | 2×2 | 2×2 | 3×3 | icon + temp |
| weather-detail | 4×2 | 3×2 | 6×3 | + condition + hi/lo |
| weather-forecast | 6×3 | 4×2 | 8×4 | hourly strip (future) |

### bookmark
| id | w×h | min | max | use |
|---|---|---|---|---|
| **bookmark-tile** | 2×2 | 2×2 | 3×3 | thumb + caption |
| bookmark-card | 3×2 | 2×2 | 4×3 | bigger thumb, room for desc |
| bookmark-banner | 6×2 | 4×2 | 8×3 | hero pin |

### quickLinks
| id | w×h | min | max | use |
|---|---|---|---|---|
| **links-row** | 4×2 | 3×2 | 8×2 | 4–6 chips inline |
| links-grid | 4×3 | 3×3 | 6×4 | 8–12 chips wrap |
| links-strip | 8×1 | 4×1 | 12×2 | top bar of shortcuts |

### pomodoro
| id | w×h | min | max | use |
|---|---|---|---|---|
| **pomo-card** | 4×3 | 3×3 | 5×4 | ring + start |
| pomo-compact | 3×2 | 2×2 | 4×2 | digits only |
| pomo-wide | 6×3 | 5×3 | 8×4 | ring + focus/break controls |

### todo
| id | w×h | min | max | use |
|---|---|---|---|---|
| **todo-list** | 4×4 | 3×3 | 6×5 | ~6 rows + add |
| todo-compact | 3×3 | 3×2 | 4×4 | top-3 today |
| todo-board | 6×5 | 4×4 | 8×6 | ~12 rows + sections |

### notes
| id | w×h | min | max | use |
|---|---|---|---|---|
| **notes-pad** | 4×4 | 3×3 | 6×5 | quick scratch |
| notes-strip | 6×2 | 4×2 | 8×3 | one-liner reminder |
| notes-page | 6×6 | 4×4 | 8×8 | long-form |

## 4. Resize affordance

Two complementary surfaces; cycle button (`r` shortcut) is **removed** because arbitrary `(w, h)` can no longer cycle cleanly.

**(a) Edge & corner handles (edit mode only).** Render handles on `right`, `bottom`, `bottom-right` only — top/left would fight the drag header. Cursor: `ew-resize`, `ns-resize`, `nwse-resize`. Snap to whole cells on `pointerup`; show a translucent ghost of target cells while dragging. Clamp to the active variant's `min/max`. Handles are 16×16 visual but extend to a 24×24 hit area; show only on widget hover/focus to keep the resting state clean.

**(b) Variants submenu in `⋯` overflow.** New section "Variants" listing every variant for the type. Format: `Square 2×2 · Banner 4×1 · Display 4×3`. Active variant shows `FiCheck`. Selecting one writes `{w, h}` to layout (x, y untouched unless out of bounds → clamp). Layout shifts other widgets per the collision rule below.

The `r` key is reassigned: in edit mode with a focused widget, `r` opens the Variants submenu (announce via `aria-keyshortcuts="r"` on the overflow trigger).

## 5. Drag-to-reposition

Only the **header strip** (icon + title area, 40px tall) is the drag handle in edit mode; the body remains pointer-interactive so todo checkboxes, pomodoro buttons, notes textarea keep working. Implement by attaching `useDraggable` listeners to the header element rather than the article root.

**Collision rule: push down (vertical compaction).** When a dragged widget overlaps occupants, the occupants slide down to the next free row, then the layout re-compacts upward (react-grid-layout's `verticalCompact: true` semantic). Rationale: predictable, never destroys the user's relative ordering, matches Notion / Grafana / iOS widget gallery. Swap is too surprising for >2 widgets; forbid leaves the user fighting the cursor.

Show a 2px dashed `--accent` outline around target cells during drag. On invalid drop (out of bounds), animate back to origin in 160ms; respect `prefers-reduced-motion` (snap with no tween).

## 6. Out of edit mode

No handles, no drag listeners, no header grab cursor. Article is `tabindex="-1"`; body controls receive focus normally. Widgets render at their persisted `{x, y, w, h}` with the same CSS. This means the static reading layout is identical to the edit layout — no "settle" animation on edit-mode toggle.

## 7. Mobile

Below 640px the 12-col layout collapses to a **single-column auto-stack** sorted by `(y asc, x asc)` from the desktop layout. We do **not** introduce `mobileOrder`: it adds two layouts to maintain and the user's vertical desktop order is the right proxy. Widgets render at full container width with `h` cells preserved (so a `notes-page` at 6×6 stays tall). At 640–1023px we keep the 8-col free layout — large enough for arrangement, small enough to skip a third breakpoint. Edit-mode drag/resize is **disabled below 640px**: touch-resize on a 4-col grid is fiddly; show a banner "Open on a larger screen to rearrange."

## 8. Persistence migration (v6 → v7)

```ts
// new
export type WidgetLayout = { x: number; y: number; w: number; h: number };
export type HomeWidget = {
  id: string; type: WidgetType; title: string;
  variant: string;          // e.g. "clock-square"
  layout: WidgetLayout;
  config: Record<string, unknown>;
};
```

Migration rules (hard-cut, no fallback `size`):

1. Read legacy `size` (`compact|regular|wide|tall|hero`) per widget.
2. Map to a per-type `{variant, w, h}` via this table:

| legacy size | clock | date | weather | bookmark | quickLinks | pomodoro | todo | notes |
|---|---|---|---|---|---|---|---|---|
| compact | clock-square 2×2 | date-square 2×2 | weather-square 2×2 | bookmark-tile 2×2 | links-row 4×2 | pomo-compact 3×2 | todo-compact 3×3 | notes-pad 4×4 |
| regular | clock-square 2×2 | date-square 2×2 | weather-detail 4×2 | bookmark-card 3×2 | links-row 4×2 | pomo-card 4×3 | todo-list 4×4 | notes-pad 4×4 |
| wide | clock-banner 4×1 | date-banner 4×1 | weather-detail 4×2 | bookmark-banner 6×2 | links-grid 4×3 | pomo-wide 6×3 | todo-list 4×4 | notes-strip 6×2 |
| tall | clock-display 4×3 | date-square 2×2 | weather-square 2×2 | bookmark-tile 2×2 | links-grid 4×3 | pomo-card 4×3 | todo-list 4×4 | notes-pad 4×4 |
| hero | clock-display 4×3 | date-calendar 4×4 | weather-forecast 6×3 | bookmark-banner 6×2 | links-grid 4×3 | pomo-wide 6×3 | todo-board 6×5 | notes-page 6×6 |

3. **Auto-pack**: walk widgets in their persisted array order; for each, place at the lowest free `(x, y)` row-by-row scanning left-to-right (first-fit top-left). Guarantees no overlaps without asking the user to fix anything.

4. Bump persist `version: 7`; old `size` field is dropped on read. Tests must cover all 5 legacy sizes × 8 widget types and a corrupt-state path that falls back to defaults.

## 9. Library decision: **react-grid-layout**

Recommend [`react-grid-layout`](https://github.com/react-grid-layout/react-grid-layout) over building atop dnd-kit + CSS Grid.

- **For:** ships drag + edge-handle resize + collision/compact + responsive breakpoints out of the box; serializes to/from `{i, x, y, w, h, minW, ...}` which maps 1:1 to our `WidgetLayout`. Saves an estimated 600+ LOC.
- **Against:** known weak keyboard a11y on resize handles ([issue #936](https://github.com/react-grid-layout/react-grid-layout/issues/936)) — we patch with our own keyboard handler (Section 10). Bundle adds ~50KB gz, acceptable for a workspace surface.

dnd-kit stays for **favorites and zones** (no resize there). Two libraries on the page is a worthwhile cost; rewriting react-grid-layout's collision math on dnd-kit is not.

## 10. Accessibility

- **Drag focus:** in edit mode the article header is `role="button"` `aria-label="Move {title}. Use arrow keys."` and `tabindex="0"`. Arrow keys move 1 cell; `Shift+Arrow` moves 4 cells; `Enter`/`Space` toggles a "grabbed" state announced via live region.
- **Resize handles:** each handle is a focusable button (`tabindex="0"`, `aria-label="Resize {title} from right edge"`). Arrow keys grow/shrink 1 cell; `Shift+Arrow` 4 cells; clamped to `min/max`.
- **Variants menu:** `role="menu"`, items `role="menuitemradio"` with `aria-checked` on the active variant.
- **Targets:** handles render 16×16 visual but with 24×24 hit area; on coarse pointer (`@media (pointer: coarse)`) bump to 44×44.
- **Live region:** one polite region per widget — "Notes moved to column 5 row 3", "Notes resized to 6 by 6".
- **Reduced motion:** disable drag/resize tweens; snap.
- **Contrast:** handle indicator dot uses `--accent`; outline uses `--accent` at 60% over `--tile` (≥3:1).

## 11. Edge cases

- **First widget added:** place at `(0, 0)`; subsequent widgets first-fit top-left.
- **Removing a widget:** other widgets **stay** (do not auto-reflow). User-driven layouts are precious; surprise reflow ranks worst in dashboard usability tests. Offer an explicit "Compact" button in the workspace header during edit mode.
- **Widget exceeds viewport (e.g., a `notes-page` 6×6 imported on tablet 8-col):** clamp `x + w ≤ cols`; if `w > cols`, set `w = cols` and re-pack.
- **Legacy import collision:** auto-pack guarantees a non-overlapping layout regardless of source state.
- **320px viewport:** edit features locked; one-column read-only stack.
- **Long titles:** header drag region truncates title with `min-w-0 truncate`; controls `shrink-0`.
- **RTL/Thai:** mirror handle positions (`left` + `bottom-left` instead of `right` + `bottom-right`); arrow-key semantics swap horizontal axis.

## 12. Open questions

1. Should we expose a "Compact layout" button during edit mode, or rely on user agency? Engineer + user input.
2. Variant naming — user-facing labels ("Square / Banner / Display") vs. literal `2×2` only? Defer to **ux-explorer** for tone.
3. Tablet behavior — keep 8-col free layout or collapse to mobile stack? Recommend free; confirm.
4. Do we keep zone-level dnd-kit Sortable, or fold workspace ordering into RGL only? Recommend keeping zones on dnd-kit; RGL inside `workspace` zone only.
5. New widget added during edit mode — should the canvas auto-scroll to its drop position? UX nice-to-have.

## Cross-references / changes

- `docs/ux/ux-blueprint.md` — Workspace section: replace size-enum prose with `(x, y, w, h)` model + variants.
- `docs/ui/ui-design.md` — replace cycle-icon spec; document handle visuals + variants submenu.
- `docs/ux/specs/2026-05-01-widget-size-matrix.md` — supersedes its enum decisions; mark "Superseded by 2026-05-01-widget-grid-layout.md".
- `src/lib/types.ts` — add `WidgetLayout`, retire `WidgetSize`, persist v7.
- `src/components/widgets/widget-registry.ts` — replace `allowedSizes` / `defaultSize` with `variants` map (per the tables above) and `defaultVariant`.
- `src/components/widgets/widget-frame.tsx` — drop cycle button, drop `bodyRowSpan` table, integrate RGL handles, scope listeners to header.
- `src/components/homepage/home-page.tsx` — replace workspace `SortableContext` with RGL `<GridLayout>`; favorites/zones unchanged.
- `src/stores/home-store.ts` — `resizeWidget` becomes `setLayout(id, layout)`; `addWidget` first-fits a placement; new persist `version: 7` migration.

## References

- react-grid-layout — drag + resize + compaction primitives ship built-in. (https://github.com/react-grid-layout/react-grid-layout)
- ilert engineering, *Why React-Grid-Layout was our best choice* — collision + persistence saved months of bespoke work. (https://www.ilert.com/blog/building-interactive-dashboards-why-react-grid-layout-was-our-best-choice)
- W3C WAI APG, Menu Button — pattern for the Variants submenu inside `⋯`. (https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- Apple HIG, Widgets — "curated set of sizes that suit its content" — backs per-widget variant lists. (https://developer.apple.com/design/human-interface-guidelines/widgets)
