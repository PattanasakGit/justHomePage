# Team Flow

The project uses a 6-agent team defined under [.claude/agents](../../.claude/agents). Every user request flows through `project-owner`, which dispatches specialists in the right order.

## Cast

```
                         ┌──────────────────┐
       user request ───▶ │  project-owner   │ ──▶ summary back to user
                         └──────────────────┘
                                  │
       ┌──────────┬──────────────┼─────────────┬──────────┐
       ▼          ▼              ▼             ▼          ▼
   ux-lead   ux-explorer    frontend-     backend-     qa-
                            engineer      engineer     engineer
```

## Recipes

### New feature

1. `project-owner` reads the request, opens a feature branch.
2. Dispatches `ux-lead` and `ux-explorer` **in parallel**.
3. Reads both outputs, merges into a single direction.
4. Dispatches `frontend-engineer` (and `backend-engineer` if APIs are involved).
5. Dispatches `qa-engineer` to verify and sign off.
6. Reports back with diff summary, doc updates, and screenshots.

### Bug fix

1. `project-owner` opens a fix branch.
2. Dispatches `qa-engineer` to reproduce with a failing test.
3. Dispatches `frontend-engineer` or `backend-engineer` to fix.
4. Dispatches `qa-engineer` again to verify the fix and run regression.
5. Reports back.

### Pure visual polish

1. `project-owner` dispatches `ux-explorer` only.
2. `frontend-engineer` implements.
3. `qa-engineer` verifies the screenshots match the brief.

### Backend / data change

1. `project-owner` dispatches `backend-engineer` first (schema, route, tests).
2. `frontend-engineer` consumes the new contract.
3. `qa-engineer` verifies.

## Hand-off contracts

Every dispatch must include:

- **Goal** — one sentence
- **Files / paths** — where to look or change
- **Acceptance criteria** — how the project owner will judge it
- **Length cap** — e.g. "report in under 200 words"

Agents have no access to the originating conversation — every prompt must be self-contained.

## Iron rules every agent enforces

- TDD: failing test first, then implementation.
- Theme tokens (`--ink`, `--ink-inverse`, `--muted`, `--surface`, `--surface-strong`, `--panel`, `--popup`, `--tile`, `--accent`) — never hardcoded white/dark.
- Bun for all scripts.
- Update the relevant doc in the same commit as the code change.
- Components must not import database code.
- Branch off `main` (`feat/*` or `fix/*`); never commit directly to `main`.
