# Favorite Folders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add nested folders to the Favorites section using a persisted favorite tree, folder modal navigation, and same-level add/edit/remove/reorder.

**Architecture:** Favorites become a discriminated union (`link` or `folder`) stored in the existing Zustand persisted state. Store helpers perform recursive tree updates by parent/id, while UI keeps the homepage root grid and opens folder contents in an overlay with breadcrumbs.

**Tech Stack:** Next.js 15 App Router, React 19 client components, TypeScript, Zustand persist, dnd-kit sortable, Vitest/RTL, Playwright.

---

## File Map

- Modify `src/lib/types.ts`: add `FavoriteLink`, `FavoriteFolder`, `FavoriteItem`, and folder input types while preserving compatibility aliases.
- Modify `src/data/defaults.ts`: mark default favorites as `type: "link"`.
- Modify `src/stores/home-store.ts`: bump persist version to 8; migrate flat favorites to link items; add recursive folder actions.
- Modify `src/stores/home-store.test.ts`: add red/green coverage for migration and tree actions.
- Modify `src/components/homepage/favorite-tile.tsx`: render link or folder tiles; folder opens modal instead of URL.
- Create `src/components/homepage/favorite-folder-editor.tsx`: small folder name/icon modal.
- Create `src/components/homepage/favorite-folder-modal.tsx`: breadcrumb overlay for nested folder contents.
- Modify `src/components/homepage/home-page.tsx`: wire root add website/add folder, folder modal, folder editor, and same-level actions.
- Modify `src/components/homepage/favorite-editor.tsx`: keep link editor, accept a `titleOverride` for nested add copy if needed.
- Modify docs: requirements, UX, UI, system design, testing, and knowledge rules if needed.

## Task 1: Favorite Tree Store

- [x] **Step 1: Write failing store tests**

Add tests in `src/stores/home-store.test.ts` for:

```ts
it("migrates flat favorites into root link items with stable ids", () => {
  const next = migrateHomeState({
    favorites: [{ id: "fav-docs", title: "Docs", url: "https://docs.example.com", icon: "fi-bookmark" }],
  }, 7);
  expect(next.favorites[0]).toMatchObject({
    type: "link",
    id: "fav-docs",
    title: "Docs",
    url: "https://docs.example.com",
  });
});

it("adds folders and nested links by parent folder id", () => {
  const store = createHomeStore();
  store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
  const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work");
  expect(folder).toMatchObject({ type: "folder", children: [] });

  store.getState().addFavoriteToFolder(folder!.id, {
    title: "Docs",
    url: "https://docs.example.com",
    icon: "fi-bookmark",
  });

  const updated = store.getState().favorites.find((item) => item.id === folder!.id);
  expect(updated).toMatchObject({
    type: "folder",
    children: [expect.objectContaining({ type: "link", title: "Docs" })],
  });
});

it("removes folders with nested children", () => {
  const store = createHomeStore();
  store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
  const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work")!;
  store.getState().addFavoriteToFolder(folder.id, { title: "Docs", url: "https://docs.example.com", icon: "fi-bookmark" });
  store.getState().removeFavorite(folder.id);
  expect(store.getState().favorites.some((item) => item.id === folder.id)).toBe(false);
});

it("reorders favorites only within the same parent", () => {
  const store = createHomeStore();
  store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
  const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work")!;
  store.getState().addFavoriteToFolder(folder.id, { title: "A", url: "https://a.example.com", icon: "fi-bookmark" });
  store.getState().addFavoriteToFolder(folder.id, { title: "B", url: "https://b.example.com", icon: "fi-bookmark" });
  const nested = (store.getState().favorites.find((item) => item.id === folder.id) as FavoriteFolder).children;
  store.getState().reorderFavorites(nested[1].id, nested[0].id, folder.id);
  const after = (store.getState().favorites.find((item) => item.id === folder.id) as FavoriteFolder).children;
  expect(after.map((item) => item.title)).toEqual(["B", "A"]);
});
```

- [x] **Step 2: Run red**

Run: `bun run test -- src/stores/home-store.test.ts`

Expected: FAIL because `type`, `FavoriteFolder`, `addFavoriteFolder`, `addFavoriteToFolder`, and the parent-aware `reorderFavorites` signature do not exist yet.

- [x] **Step 3: Implement minimal store tree**

Add discriminated favorite types, recursive helpers, v8 migration, and folder actions. Keep `addFavorite` as root-level link add for existing callers. Bump persist version from 7 to 8.

- [x] **Step 4: Run green**

Run: `bun run test -- src/stores/home-store.test.ts`

Expected: PASS.

- [x] **Step 5: Add cross-folder move behavior**

Added `moveFavoriteItem(id, targetParentId)` with tests for root → folder, folder → root, and rejecting folder → descendant moves.

## Task 2: Folder UI

- [x] **Step 1: Write failing component tests**

Add focused RTL tests for `FavoriteTile` and `FavoriteFolderModal`:

- folder tile calls `onOpenFolder` and does not navigate.
- folder modal renders breadcrumb and drills into a child folder.
- empty folder shows add website/add folder actions.

- [x] **Step 2: Run red**

Run: `bun run test -- src/components/homepage`

Expected: FAIL because folder UI components are not implemented.

- [x] **Step 3: Implement UI**

Update `FavoriteTile` for folder/link branching. Add `FavoriteFolderEditor` and `FavoriteFolderModal`. Wire `home-page.tsx` with root/current-folder add flows, folder path state, edit/remove handlers, and parent-aware reorder. Use theme tokens and full-screen mobile modal treatment.

- [x] **Step 4: Run green**

Run: `bun run test -- src/components/homepage`

Expected: PASS.

- [x] **Step 5: Wire file-manager drag/drop semantics**

Folder tiles use a distinct tabbed folder plate. Dropping onto a folder tile moves the dragged item into that folder. Dropping onto a breadcrumb target in the folder modal moves the item out to root or that ancestor folder.

## Task 3: Docs And Verification

- [x] **Step 1: Update docs**

Update requirements, UX, UI, system design, and testing docs to describe nested folders, migration to persist v8, modal breadcrumbs, and test coverage.

- [x] **Step 2: Run full verification**

Run:

```bash
bun run typecheck
bun run test
bun run build
```

Expected: all exit 0.

- [x] **Step 3: Browser smoke**

Start `bun run dev`, verify homepage loads, add a folder, open it, add a website inside it, drill into a subfolder, and confirm no console errors.
