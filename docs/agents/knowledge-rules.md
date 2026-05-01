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
- Persisted store schema lives at version 5; bumping it requires a migration that backfills new fields with defaults so older snapshots still load.

## Working Style

- Prefer small files with clear ownership.
- Keep UI code-native; do not ship screenshot mockups as UI.
- Keep local startup fast and resilient without network dependencies.
- Document Vercel deployment caveats when touching persistence.
- The icon catalog is the single source of truth for picker entries (`src/components/icons/icon-catalog.ts`). When adding a brand icon, also add a matching `iconMap` entry in `brand-icon.tsx`. When adding a neutral icon, register the renderer in `neutralEntries`.
- Neutral icons must render in `var(--ink)`, never a brand color.
