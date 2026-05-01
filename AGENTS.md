# Working with Codex on justHomePage

This project uses the same small team of specialist subagents documented for Claude under `.claude/agents/`. Treat those files as the source of truth for role definitions and keep Codex behavior aligned with them instead of maintaining a separate `.Codex/agents/` copy.

> "When I throw a requirement or bug, project-owner is in charge — it dispatches the other subagents so the work stays fast, correct, and well-organized."

## Default delegation

When the user describes a feature, bug, polish task, or anything non-trivial, **route the work through the `project-owner` workflow first** instead of jumping directly into implementation. In Claude Code this means using the `Task` tool with the `.claude/agents/project-owner.md` agent. In Codex, use the closest available equivalent: run the project-owner intake/plan/dispatch/verify loop yourself, and use Codex subagents only when the platform exposes suitable workers. Only handle the request inline if it is a tiny one-off (e.g. "what does this file do?", "show me git status").

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

The user keeps personal preferences and feedback for future sessions in `~/.claude/projects/-Users-pattanasak-Desktop-justHomePage/memory/`. Read that index at the start of any session so behavior carries across. If a Codex-specific memory directory is later added, mirror only stable preferences there and keep project rules in versioned docs.
