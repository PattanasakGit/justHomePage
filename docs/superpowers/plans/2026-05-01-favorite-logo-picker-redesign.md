# Favorite Logo Picker Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cluttered 32-tile brand-only "Custom logo" grid in `FavoriteEditor` with a calm, scalable picker that mixes brand icons and neutral general-purpose icons, organised so the user can find an icon quickly.

**Architecture:** Split the picker into a separate `IconPicker` component with its own state (search, category, page). Extend `iconChoices` from a flat array into a structured catalog: `{ id, label, category, keywords[] }`. Render with a search input on top, a category chip row, and a paginated grid below. Letter-avatar stays as a permanent first option.

**Tech Stack:** React, Tailwind tokens, react-icons/fi (neutral) + react-icons/si (brand) already installed, Vitest + Playwright.

**Status:** PLANNING ONLY — blocked on Q1, Q2.

---

## Open Questions (block execution)

- [ ] **Q1 — Organisation pattern.** Three viable approaches:
  - **(a) Search + categories** (recommended): single text input filters by label/keyword; chip row "All / Brand / General / Productivity / Social / Media / Money / Travel". Page size 28 (4×7). Works well even at 100+ icons.
  - **(b) Pagination only:** simplest, but 100+ icons on numbered pages is still rough.
  - **(c) Search only:** elegant when the user already knows what they want, weak for browsing.
  - Recommendation: **(a)**. Confirm.
- [ ] **Q2 — Catalog size and source.** How many neutral icons total? `react-icons/fi` (Feather) gives ~280 clean line icons that look consistent with the existing UI. Recommendation: keep all 32 brand icons + curate ~60 neutral icons (work, tools, media, travel, food, weather, communication, finance, generic shapes). Confirm or trim.
- [ ] **Q3 — Default selected category** when picker opens? Recommendation: "All" with the search input focused.
- [ ] **Q4 — Behaviour when user picks a neutral icon.** Today neutral icons inherit theme `--ink`. Should we (a) always render neutral icons in `--ink`, or (b) allow per-icon color choice? Recommendation: (a) for v1; defer color customisation.

## File Structure

- Create: `src/components/icons/icon-catalog.ts` — typed catalog with categories + keywords
- Create: `src/components/icons/icon-picker.tsx` — search + chips + paginated grid (own state)
- Modify: `src/components/icons/brand-icon.tsx` — keep `getBrandIcon`/`LETTER_ICON`; remove `iconChoices` (moved to catalog)
- Modify: `src/components/homepage/favorite-editor.tsx` — replace inline grid with `<IconPicker value={icon} onChange={setIcon} />`
- Test: `tests/unit/icons/icon-catalog.test.ts` (catalog integrity)
- Test: `tests/unit/icons/icon-picker.test.tsx` (search filter, category filter, pagination, keyboard nav)
- Test: `tests/e2e/favorite-editor.spec.ts` (open editor → search "mail" → select → save → verify tile icon)
- Modify: `docs/requirements/favorites.md`, `docs/ux/favorites.md`, `docs/ui/ui-design.md`, `docs/testing/favorites.md`, `docs/agents/knowledge-rules.md`

## Specialist Sequencing (recommended)

1. `ux-explorer` — pull 2–3 reference pickers (Notion, Linear, Raycast) and propose layout density + chip styling.
2. `ux-lead` — keyboard model (Tab into search, arrow keys across grid, Enter to select), screen-reader labels, focus ring.
3. `frontend-engineer` — TDD: catalog → picker logic → integration into favorite-editor.
4. `qa-engineer` — unit (filter/page math), e2e (full flow with persistence), screenshot diff if available.

UX-explorer + UX-lead can run in **parallel** after Q1, Q2 are answered.

---

## Task 1 — Catalog data model

**Files:**
- Create: `src/components/icons/icon-catalog.ts`
- Modify: `src/components/icons/brand-icon.tsx`
- Test: `tests/unit/icons/icon-catalog.test.ts`

- [ ] **Step 1:** Write failing test asserting (a) every entry has unique id, (b) every entry has at least one keyword, (c) `LETTER_ICON` is the first entry, (d) `getBrandIcon(id)` returns a renderer for every catalog entry.
- [ ] **Step 2:** Run test → fail.
- [ ] **Step 3:** Implement catalog as typed array; categories = const tuple; export `getCatalogByCategory`, `searchCatalog(query)` pure helpers.
- [ ] **Step 4:** Move existing brand icons + add curated neutral icons (locked by Q2).
- [ ] **Step 5:** `bun run test && bun run typecheck`.
- [ ] **Step 6:** Commit `feat(icons): structured icon catalog with categories`.

## Task 2 — IconPicker component

**Files:**
- Create: `src/components/icons/icon-picker.tsx`
- Test: `tests/unit/icons/icon-picker.test.tsx`

- [ ] **Step 1:** Failing tests for: search filters by label and keyword; category chip narrows results; pagination clamps to result count; "no results" empty state renders.
- [ ] **Step 2:** Implement component. Layout: search input (h-10, rounded-2xl, `--surface`), chip row scroll on overflow, grid `grid-cols-7 gap-2`, page size constant (28). Footer shows `Page X of Y` with prev/next ghost buttons. Letter avatar always visible as first tile regardless of filter, with a divider.
- [ ] **Step 3:** Use only theme tokens. No `bg-white/*`, no `text-white` (except inside the existing letter-avatar span which is documented exception).
- [ ] **Step 4:** Add keyboard support: ArrowLeft/Right/Up/Down across grid, Enter selects, `/` focuses search.
- [ ] **Step 5:** `bun run test && bun run typecheck`.
- [ ] **Step 6:** Commit `feat(icons): icon picker with search, categories, pagination`.

## Task 3 — Integrate into FavoriteEditor

**Files:**
- Modify: `src/components/homepage/favorite-editor.tsx`
- Test: `tests/e2e/favorite-editor.spec.ts`

- [ ] **Step 1:** Failing e2e: open editor for new favorite → search "mail" → click first result → save → tile shows mail icon.
- [ ] **Step 2:** Replace inline `<div className="mt-2 grid grid-cols-7 gap-2">…</div>` block with `<IconPicker value={icon} onChange={(next) => { setIcon(next); setIconUrl(null); }} />`.
- [ ] **Step 3:** Verify modal scrolls correctly when picker has many rows; cap picker height with internal scroll, never let it push the Save button off-screen.
- [ ] **Step 4:** `bun run test:e2e -- favorite-editor`.
- [ ] **Step 5:** Commit `feat(favorites): swap brand-only grid for unified icon picker`.

## Task 4 — Docs + smoke

- [ ] Update `docs/requirements/favorites.md` (new picker behaviour).
- [ ] Update `docs/ux/favorites.md` (interaction model + keyboard map).
- [ ] Update `docs/ui/ui-design.md` (token use, density).
- [ ] Update `docs/testing/favorites.md` and `docs/agents/knowledge-rules.md`.
- [ ] Manual smoke in browser at every theme (light + dark) and both UI scales.
- [ ] Commit `docs(favorites): document icon picker redesign`.

## Risks

- Picker grows the editor modal taller; mobile viewports could break. Mitigation: cap inner grid at `max-h-[280px] overflow-y-auto`.
- Mixing brand and neutral icons in the same grid can look inconsistent. Mitigation: brand icons use their brand color, neutral icons use `--ink` (Q4 = a).
- Catalog drift with `react-icons` upgrades. Mitigation: catalog test pins names; CI fails if a referenced icon is missing.
