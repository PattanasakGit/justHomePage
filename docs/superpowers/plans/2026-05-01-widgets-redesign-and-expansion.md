# Widgets Redesign and Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make widgets visually richer and more useful by (a) refreshing the visual treatment of every existing widget and (b) adding 2–4 new widget types selected by the user.

**Architecture:** Keep widgets client-only where possible; reuse the existing `HomeWidget` shape, `WidgetSize` (small/middle/max) and `widgetScale` settings. New widget types are added to the `WidgetType` union, the Zustand `addWidget` factory, and a single dispatch in `widget-frame.tsx`. Each widget is a small focused component file under `src/components/widgets/`. Visual refresh applies tokenised tile styling consistent with `--tile`, `--surface`, `--accent` and the `ui-glass` shadow language already used in `WidgetFrame`.

**Tech Stack:** React (client components), Zustand persist, dnd-kit/sortable (already wired), Tailwind with project theme tokens, react-icons/fi, Vitest + Playwright. Any data-fetching widgets reuse existing `/api/site-metadata` pattern under `src/app/api/*` with `route.ts`.

**Status:** PLANNING ONLY — not yet executed. Several decisions are blocked on user input (see Open Questions).

---

## Open Questions (block execution)

- [ ] **Q1 — Which new widgets to ship in this iteration?** Candidates ranked by complexity:
  - Low risk, client-only: `pomodoro` (focus timer), `todo` (checklist), `dailyQuote` (static rotating list), `bookmark` (single visual link with thumbnail), `countdown` (target date).
  - Medium: `weather` (needs the existing geolocation hook + a free API such as Open-Meteo, which is already free/no-key).
  - Higher: `rss` (needs server route to bypass CORS), `calendarPeek` (would need OAuth — likely defer), `currencyTicker`/`stocks` (requires a paid or rate-limited API).
  - Recommendation: **pomodoro + todo + weather + bookmark**. Asks for explicit confirmation.
- [ ] **Q2 — Visual direction.** Should the refresh push toward (a) "soft glass" (current language, more polish), (b) "flat minimal" (less shadow, sharper type), or (c) "expressive" (per-widget accent tints)? UX-explorer should mood-board this before we touch code.
- [ ] **Q3 — Per-widget settings UX.** Today every widget config lives in `widget.config: Record<string, string>`. New widgets need richer config (todo items, pomodoro durations). Do we (a) keep stringly-typed map and serialise JSON, or (b) introduce typed configs per widget type? Recommendation: (b), with a discriminated union on `HomeWidget`.
- [ ] **Q4 — Sizing rules.** Should todo/pomodoro support all three sizes or restrict to middle/max? Default size when added?

## File Structure

- Create: `src/components/widgets/widget-clock.tsx`
- Create: `src/components/widgets/widget-date.tsx`
- Create: `src/components/widgets/widget-notes.tsx`
- Create: `src/components/widgets/widget-quick-links.tsx`
- Create: `src/components/widgets/widget-pomodoro.tsx`  *(if Q1 keeps pomodoro)*
- Create: `src/components/widgets/widget-todo.tsx` *(if Q1 keeps todo)*
- Create: `src/components/widgets/widget-weather.tsx` *(if Q1 keeps weather)*
- Create: `src/components/widgets/widget-bookmark.tsx` *(if Q1 keeps bookmark)*
- Create: `src/components/widgets/widget-registry.ts` (icon, label, default size, default config per type)
- Modify: `src/components/widgets/widget-frame.tsx` — slim it down to chrome + dispatch by type via the registry
- Modify: `src/lib/types.ts` — extend `WidgetType`; introduce typed config union if Q3 = b
- Modify: `src/stores/home-store.ts` — `addWidget` reads defaults from registry; migration version bump
- Modify: `src/components/homepage/home-page.tsx` — `widgetOptions` reads from registry
- Modify: `src/data/defaults.ts` — adjust `defaultWidgets` if visual examples change
- Create: `tests/unit/widgets/widget-registry.test.ts`
- Create: `tests/unit/widgets/widget-pomodoro.test.tsx` (etc., one per new widget)
- Create: `tests/e2e/widgets.spec.ts` — add new widget, configure it, persist after reload
- Modify: `docs/requirements/widgets.md`, `docs/ux/widgets.md`, `docs/ui/ui-design.md`, `docs/systemdesign/widgets.md`, `docs/testing/widgets.md`, `docs/agents/knowledge-rules.md`

## Specialist Sequencing (recommended)

1. `ux-explorer` — answer Q2 with a mood board referencing 2–3 sources; produce token recipe.
2. `ux-lead` — accessibility + interaction states for new widgets (focus rings, keyboard for pomodoro/todo, reduced motion).
3. `frontend-engineer` — registry refactor, then per-widget TDD.
4. `qa-engineer` — Vitest for logic (timers, todo reducer), Playwright for add/config/persist flow, browser smoke for visuals.

UX-explorer + UX-lead can run in **parallel** after Q1 is locked.

---

## Task 1 — Widget registry refactor (pre-requisite for everything else)

**Files:**
- Create: `src/components/widgets/widget-registry.ts`
- Modify: `src/components/widgets/widget-frame.tsx`
- Modify: `src/stores/home-store.ts`
- Test: `tests/unit/widgets/widget-registry.test.ts`

- [ ] **Step 1: Write the failing test** for `getWidgetMeta(type)` returning `{ label, icon, defaultSize, defaultConfig }` for every existing type.
- [ ] **Step 2: Run test, expect failure** (`bun run test -- widget-registry`).
- [ ] **Step 3: Implement `widget-registry.ts`** as a const map keyed by `WidgetType`.
- [ ] **Step 4: Refactor `widget-frame.tsx`** to import the icon and label from the registry. No behavior change.
- [ ] **Step 5: Refactor `home-store.ts`** `addWidget` to use registry defaults.
- [ ] **Step 6: Run `bun run typecheck && bun run test`** — all green.
- [ ] **Step 7: Commit** `refactor(widgets): introduce widget registry`.

## Task 2 — Visual refresh of the four existing widgets

**Files:**
- Create: `src/components/widgets/widget-clock.tsx`, `widget-date.tsx`, `widget-notes.tsx`, `widget-quick-links.tsx`
- Modify: `src/components/widgets/widget-frame.tsx` (remove inline implementations, dispatch by type)

- [ ] **Step 1:** Move each existing widget body to its own file with no logic change. Snapshot test each.
- [ ] **Step 2:** Apply UX-explorer's token recipe (Q2). Each file gets a single visual diff commit so we can revert independently.
- [ ] **Step 3:** Run `bun run test && bun run typecheck`.
- [ ] **Step 4:** Commit `style(widgets): refresh clock/date/notes/quick-links`.

## Task 3..N — One task per new widget (gated by Q1)

For each chosen new widget, follow this template (TDD strict):

- [ ] **Step 1: Failing unit test for the widget's pure logic** (e.g., pomodoro tick reducer, todo add/toggle, weather fetch parser).
- [ ] **Step 2: Implement the logic.**
- [ ] **Step 3: Render test** (React Testing Library) for the visual states (idle/running/empty).
- [ ] **Step 4: Wire into registry; extend `WidgetType`.**
- [ ] **Step 5: Add Playwright e2e** for add → configure → reload → still configured.
- [ ] **Step 6: Update docs** in `docs/requirements/widgets.md`, `docs/ux/widgets.md`, `docs/testing/widgets.md`, `docs/agents/knowledge-rules.md`.
- [ ] **Step 7: Commit** `feat(widgets): add <name> widget`.

## Task Final — Migration + smoke

- [ ] Bump persisted store `version` and add migration leaving existing widgets untouched.
- [ ] Manual smoke: add every new widget, resize each, reorder via DnD, reload — widgets and order persist.
- [ ] Update `docs/requirements`, `docs/ux`, `docs/ui`, `docs/systemdesign`, `docs/testing`, and `docs/agents/knowledge-rules.md`.
- [ ] Run `bun run typecheck && bun run test && bun run test:e2e`.
- [ ] Commit `feat(widgets): redesign + expansion`.

## Risks

- New widget types interact with persisted store; missing migration = lost widgets. Mitigation: explicit migration test that loads a v4 snapshot.
- Weather widget could be flaky in CI. Mitigation: mock fetch in unit test; skip live call in e2e.
- Visual refresh can collide with theme tokens. Mitigation: enforce theme tokens, never raw `bg-white/*`.
