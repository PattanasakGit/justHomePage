# Agent Knowledge Rules

> The team workflow lives at [team-flow.md](team-flow.md). Every user request goes through `project-owner` which dispatches the rest of the team.

## Iron Rules

- Any feature or behavior change must update related docs in `docs/`.
- Any schema or persistence change must update `docs/systemdesign/system-design.md`.
- Any UX interaction change must update `docs/ux/ux-blueprint.md`.
- Any visual token or component rule change must update `docs/ui/ui-design.md`.
- Any new behavior needs either a unit, component, or e2e test.
- Use Bun for install, scripts, test, and dev server commands.
- Components must not import database code.
- Zustand stores must stay focused by interaction domain as the app grows.
- Never hardcode `bg-white/*`, `text-white`, or hex text colors in components — use `--surface`, `--surface-strong`, `--panel`, `--tile`, `--ink`, `--ink-inverse`, `--muted` tokens so dark/light contrast stays readable. Brand icon plates are the documented exception (always light).
- DnD ids are namespaced by domain: `zone-…`, `fav…`, `widget…`. The single `DndContext` in `home-page.tsx` routes drag events by prefix; never reuse a prefix for a different domain.
- Persisted store schema lives at version 6; bumping it requires a migration that backfills new fields with defaults so older snapshots still load.
- Widget sizes are per-type via `allowedSizes`; never assume the global `WidgetSize` enum exhaustively applies to every widget. Always clamp through the registry (e.g. via `resolveWidgetSize`) before persisting or applying a size.

## Working Style

- Prefer small files with clear ownership.
- Keep UI code-native; do not ship screenshot mockups as UI.
- Keep local startup fast and resilient without network dependencies.
- Document Vercel deployment caveats when touching persistence.
- The icon catalog is the single source of truth for picker entries (`src/components/icons/icon-catalog.ts`). When adding a brand icon, also add a matching `iconMap` entry in `brand-icon.tsx`. When adding a neutral icon, register the renderer in `neutralEntries`.
- Neutral icons must render in `var(--ink)`, never a brand color.
- The widget registry (`src/components/widgets/widget-registry.ts`) is the single source of truth for widget metadata. Adding a new widget requires: (1) extend `WidgetType`, (2) add a config interface to `WidgetConfigByType`, (3) add a registry entry with `defaultConfig`, `defaultSize`, and `allowedSizes`, (4) add a body component file under `src/components/widgets/`, (5) extend the dispatch in `widget-frame.tsx`.
- Pomodoro and todo logic live in `pomodoro-engine.ts` / `todo-engine.ts` so they can be unit tested without React.
- Any widget body that scrolls must use the `flex h-full min-h-0 flex-col` + `flex-1 min-h-0 overflow-y-auto` pattern; without `min-h-0` the parent's `overflow-hidden` clips children silently.
- Every widget body's outermost wrapper is `flex h-full min-h-0 flex-col overflow-hidden` (or the equivalent for grid roots). Even bodies that do not scroll keep `min-h-0` so the chain stays consistent — that's how the article's `overflow-hidden` stops silently eating overflow.
- Per-(widget, size) row-span exceptions live in `widget-frame.tsx` (the `rowSpanOverride` table consumed by `bodyRowSpan(type, size)`); do not bake them into individual widget bodies. Add a row to that table when a (type, size) pair needs a taller card; reflect the change in `docs/ui/ui-design.md` Size vocabulary.
- Hero numerals that paint with `--accent` (clock, date, weather temp, pomodoro digits) must pipe through `useAccentTextColor()` so they fall back to `var(--ink)` when `accentReadsOnLight(color)` is `false` — saturated yellow / near-white accents otherwise vanish on the `paper` theme.
