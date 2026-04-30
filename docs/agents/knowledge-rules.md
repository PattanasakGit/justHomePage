# Agent Knowledge Rules

## Iron Rules

- Any feature or behavior change must update related docs in `docs/`.
- Any schema or persistence change must update `docs/systemdesign/system-design.md`.
- Any UX interaction change must update `docs/ux/ux-blueprint.md`.
- Any visual token or component rule change must update `docs/ui/ui-design.md`.
- Any new behavior needs either a unit, component, or e2e test.
- Use Bun for install, scripts, test, and dev server commands.
- Components must not import database code.
- Zustand stores must stay focused by interaction domain as the app grows.

## Working Style

- Prefer small files with clear ownership.
- Keep UI code-native; do not ship screenshot mockups as UI.
- Keep local startup fast and resilient without network dependencies.
- Document Vercel deployment caveats when touching persistence.
