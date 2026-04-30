# Zone Drag-and-Drop and Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In edit mode, let the user reorder the three top-level zones (Search, Favorites, Workspace) vertically and toggle each one's visibility. Persist both pieces of state.

**Architecture:** Introduce a `ZoneId = "search" | "favorites" | "workspace"` and store `zoneOrder: ZoneId[]` and `zoneVisibility: Record<ZoneId, boolean>` in `Preferences`. Wrap each zone in a `SortableZone` component. The existing `DndContext` in `home-page.tsx` already handles favorites and widgets — extend it to also handle zone-level sorting, distinguishing by id prefix (`zone-…`). Each zone gets a small `ZoneChrome` shown only in edit mode with a drag handle and a visibility toggle.

**Tech Stack:** React, Zustand persist (migration v5), dnd-kit/core + dnd-kit/sortable (already installed), Tailwind tokens.

**Status:** PLANNING ONLY — blocked on Q1, Q2.

---

## Open Questions (block execution)

- [ ] **Q1 — Search zone hide behaviour.** Hiding the search bar removes the most-used surface. Options:
  - (a) Allow hiding it like the others.
  - (b) Disallow hiding search; only allow reorder.
  - (c) Allow hiding, but restore via a small floating chip when hidden.
  - Recommendation: **(a)** for symmetry, with a clear "Show search" affordance in edit mode header.
- [ ] **Q2 — Drag affordance.** Options:
  - (a) Drag handle icon at the top-left of each zone, only visible in edit mode.
  - (b) Whole-zone drag in edit mode (risk: clashes with inner DnD for favorites/widgets).
  - Recommendation: **(a)**. The existing favorite/widget DnD must stay independent of the zone DnD.
- [ ] **Q3 — Reset/Default.** Should "Reset zones" appear in Settings? Recommendation: yes, in the existing Layout/Theme tab; one-click restore to `["search","favorites","workspace"]` all visible.

## File Structure

- Modify: `src/lib/types.ts` — add `ZoneId`, extend `Preferences` with `zoneOrder` and `zoneVisibility`
- Modify: `src/data/defaults.ts` — defaults for the two new fields
- Modify: `src/stores/home-store.ts` — actions `setZoneOrder`, `setZoneVisible`, `resetZones`; migration v5
- Create: `src/components/homepage/sortable-zone.tsx` — wrapper using `useSortable` keyed by zone id, with edit-mode chrome (drag handle + eye toggle)
- Modify: `src/components/homepage/home-page.tsx` — render zones from `zoneOrder.filter(visible)`, register zone DnD inside the existing `DndContext`, route drag events by id prefix
- Test: `tests/unit/stores/home-store-zones.test.ts`
- Test: `tests/unit/homepage/sortable-zone.test.tsx`
- Test: `tests/e2e/zone-dnd.spec.ts` — reorder, toggle, persist after reload, reset
- Modify: `docs/requirements/edit-mode.md`, `docs/ux/edit-mode.md`, `docs/systemdesign/preferences.md`, `docs/testing/edit-mode.md`, `docs/agents/knowledge-rules.md`

## Specialist Sequencing (recommended)

1. `ux-lead` — interaction model: drag handle position, focus order, keyboard reorder (Space to lift, arrows to move, Space to drop — dnd-kit default), screen-reader announcements, "hidden zone" affordance.
2. `frontend-engineer` — store + migration TDD, then component TDD, then integration.
3. `qa-engineer` — unit + Playwright e2e covering reorder, toggle, persistence, reset, and that inner DnD (favorites, widgets) still works.

`ux-explorer` is **not needed** here — this is structural, not visual.

---

## Task 1 — Types + defaults + store

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/data/defaults.ts`
- Modify: `src/stores/home-store.ts`
- Test: `tests/unit/stores/home-store-zones.test.ts`

- [ ] **Step 1:** Failing tests:
  - default `zoneOrder` is `["search","favorites","workspace"]`
  - default `zoneVisibility` all true
  - `setZoneOrder` updates state
  - `setZoneVisible("search", false)` updates state
  - `resetZones` restores defaults
  - persisted v4 snapshot migrates to v5 with the two new fields populated.
- [ ] **Step 2:** Implement `ZoneId`, extend `Preferences`, add actions. Bump persist `version` to 5; add migration that returns defaults for missing fields.
- [ ] **Step 3:** `bun run test && bun run typecheck`.
- [ ] **Step 4:** Commit `feat(store): zone order + visibility preferences`.

## Task 2 — SortableZone wrapper

**Files:**
- Create: `src/components/homepage/sortable-zone.tsx`
- Test: `tests/unit/homepage/sortable-zone.test.tsx`

- [ ] **Step 1:** Failing tests: in edit mode the wrapper renders a drag handle and a visibility toggle; non-edit mode renders only children; toggle calls `onToggleVisible`; handle has `aria-label="Reorder <zone>"`.
- [ ] **Step 2:** Implement using `useSortable({ id: \`zone-\${zoneId}\` })`. Apply transform/transition like the existing widget frame. Drag handle uses `FiMove`; visibility toggle uses `FiEye`/`FiEyeOff`.
- [ ] **Step 3:** Use only theme tokens.
- [ ] **Step 4:** `bun run test && bun run typecheck`.
- [ ] **Step 5:** Commit `feat(homepage): sortable zone wrapper`.

## Task 3 — Wire into HomePage

**Files:**
- Modify: `src/components/homepage/home-page.tsx`

- [ ] **Step 1:** Map `preferences.zoneOrder.filter((z) => preferences.zoneVisibility[z])` to a `<SortableZone>` containing the matching JSX block. Hidden zones do not render.
- [ ] **Step 2:** Extend `onDragEnd` to also handle zone drags by id prefix `zone-`. Existing `fav-` and `widget-` branches stay untouched.
- [ ] **Step 3:** Wrap the zone list in its own `SortableContext` with `verticalListSortingStrategy`. Inner sortable contexts (favorites grid, widgets grid) remain nested and independent.
- [ ] **Step 4:** Add a small "Hidden zones" cluster in the header (edit mode only) showing chips for any hidden zone with a "Show" button. Skip if Q1 = b.
- [ ] **Step 5:** Verify inner DnD still works: drag a favorite, drag a widget, drag a zone — all three independent.
- [ ] **Step 6:** `bun run test && bun run typecheck`.
- [ ] **Step 7:** Commit `feat(homepage): drag-and-drop zone reorder + per-zone visibility`.

## Task 4 — Settings reset entry

**Files:**
- Modify: `src/components/settings/settings-panel.tsx`

- [ ] **Step 1:** Failing test: clicking "Reset zone layout" calls `resetZones`.
- [ ] **Step 2:** Add a row in the existing Layout section. Uses tokens, secondary button style.
- [ ] **Step 3:** Commit `feat(settings): reset zone layout action`.

## Task 5 — E2E + docs

**Files:**
- Test: `tests/e2e/zone-dnd.spec.ts`
- Modify: `docs/requirements/edit-mode.md`, `docs/ux/edit-mode.md`, `docs/systemdesign/preferences.md`, `docs/testing/edit-mode.md`, `docs/agents/knowledge-rules.md`

- [ ] **Step 1:** E2E covers: enable edit mode → drag Workspace above Favorites → reload → order persists. Hide search → reload → search hidden, "Show search" chip visible → click → search restored. Reset zones → defaults restored.
- [ ] **Step 2:** Run `bun run test:e2e -- zone-dnd`.
- [ ] **Step 3:** Update docs as listed.
- [ ] **Step 4:** Commit `docs(edit-mode): zone reorder and visibility`.

## Risks

- Nested DnD can interfere — `closestCenter` collision plus distinct id prefixes mitigates this. Add a debug log during dev to verify only one drop target per drag.
- Migration risk for users on v4. Mitigation: explicit migration unit test loading a v4 snapshot.
- Hiding the search zone is destructive UX. Mitigation: persistent "Show search" chip in edit mode header (Q1 = a or c).
