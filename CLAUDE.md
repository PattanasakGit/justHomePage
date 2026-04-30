# Working with Claude on justHomePage

This project uses a small team of specialist subagents under `.claude/agents/`. The user's preferred workflow:

> "When I throw a requirement or bug, project-owner is in charge — it dispatches the other subagents so the work stays fast, correct, and well-organized."

## Default delegation

When the user describes a feature, bug, polish task, or anything non-trivial, **delegate to `project-owner` via the `Task` tool first** instead of doing the work directly. The project-owner will plan and dispatch the rest of the team. Only handle the request inline if it is a tiny one-off (e.g. "what does this file do?", "show me git status").

## The team

| Agent | Use for |
|-------|---------|
| `project-owner` | Orchestrator — receives the request, plans, and dispatches the others |
| `ux-lead` | Structural UX, accessibility, interaction states |
| `ux-explorer` | Visual direction, mood, palettes, web references |
| `frontend-engineer` | React / Next.js / Tailwind / Zustand implementation |
| `backend-engineer` | Next.js API routes, libSQL schema, server logic |
| `qa-engineer` | Test plans, Vitest + Playwright, browser verification |

## Project guardrails (apply to every agent)

- Bun for all scripts (`bun run dev`, `bun run test`, `bun run typecheck`).
- Theme tokens: `--ink`, `--ink-inverse`, `--muted`, `--surface`, `--surface-strong`, `--panel`, `--popup`, `--tile`, `--accent`. Never hardcode `bg-white/*` or `text-white` (brand icon plates are the documented exception).
- Theme catalog lives in `src/data/themes.ts` — Light/Dark categories and soft/minimal/vibrant/neon styles.
- Components must NOT import database code; the libSQL/SQLite scaffold in `src/lib/db` is for future promotion.
- TDD is mandatory for code changes — failing test first, then implementation.
- Every behavior change must update related docs (`docs/requirements`, `docs/ux`, `docs/ui`, `docs/systemdesign`, `docs/testing`, `docs/agents/knowledge-rules.md`) so a fresh AI session or a different AI tool can pick up where the last one left off.
- Work on a feature or fix branch (`feat/<slug>` or `fix/<slug>`), never on `main`.

## Memory & continuity

The user keeps personal preferences and feedback for future sessions in `~/.claude/projects/-Users-pattanasak-Desktop-justHomePage/memory/`. Read that index at the start of any session so behavior carries across.
