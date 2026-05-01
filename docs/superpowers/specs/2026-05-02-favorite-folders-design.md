# Favorite Folders Design

## Goal

Add nested folders to the Favorites section so users can group favorite websites into folders and subfolders (`folder / sub / sub / sub`) while keeping the homepage calm and fast. The first version should support unlimited nesting in the data model, with a simple modal/grid interaction for navigation.

## Chosen Approach

Use a nested favorites tree in the existing persisted home store.

Favorites become a discriminated union:

- `FavoriteLink` — the current website favorite shape: `id`, `title`, `url`, `icon`, optional `iconUrl`.
- `FavoriteFolder` — a folder item: `id`, `title`, `icon`, optional `iconUrl`, and `children: FavoriteItem[]`.
- `FavoriteItem = FavoriteLink | FavoriteFolder`.

The root Favorites grid renders only top-level items. Folder tiles look like favorite tiles but use a folder visual and open the folder instead of navigating away. Clicking a folder opens a modal that shows that folder's children in the same grid language, with breadcrumb navigation such as `Favorites / Work / AI`.

## UX Model

The default homepage stays familiar: search, root favorites, workspace. Folder navigation happens in an overlay so deep organization does not crowd the first viewport.

Interactions:

- Click a website tile: open its URL, same as today.
- Click a folder tile: open folder modal.
- In the modal, click a subfolder: drill deeper in the same modal.
- Use breadcrumb chips to jump back to any ancestor.
- Use close or Escape to return to the homepage.
- In edit mode, folder and link tiles expose edit/remove actions.
- Add actions should allow creating either a website favorite or a folder at the current folder level.

States:

- Empty folder: show a quiet empty state with actions to add a website or folder.
- Deep folder path: breadcrumb scrolls horizontally instead of wrapping over content.
- Mobile: modal becomes full-screen, matching the existing favorite editor treatment.
- Long folder names: tiles truncate labels, breadcrumb uses truncation per segment.

## Data And Migration

Persisted favorites are currently a flat `Favorite[]`. Migration should wrap old items as `FavoriteLink` entries at the root. Existing IDs should stay stable so current shortcuts and reorder behavior do not churn.

Store actions should support tree operations by item id:

- add website to root or folder
- add folder to root or folder
- update link/folder
- remove link/folder and all nested children
- reorder within the same parent

Moving items between folders can be deferred unless it falls out naturally from the implementation. The first useful version only needs add/edit/remove/reorder within the currently viewed level.

## Components

Likely component split:

- `FavoriteTile` remains the shared tile renderer for links and folders, or is split into `FavoriteLinkTile` and `FavoriteFolderTile` if the branching gets noisy.
- `FavoriteFolderModal` owns folder path, breadcrumb, current children grid, and current-level add buttons.
- `FavoriteEditor` can stay focused on website links.
- A small `FavoriteFolderEditor` handles folder title/icon.

All UI must continue to use theme tokens. Brand/icon plates may keep the documented light plate exception; folder plates should use theme tokens unless a specific icon requires the exception.

## Testing

Use TDD before implementation.

Unit/store tests:

- legacy flat favorites migrate to root `FavoriteLink` items.
- adding a folder creates a `FavoriteFolder` with empty children.
- adding a website inside a folder appends to that folder's children.
- removing a folder removes nested children.
- reorder only affects siblings in the same folder.

Component/e2e tests:

- root folder tile opens the folder modal.
- breadcrumb drills into and back out of nested folders.
- empty folder state offers add website and add folder actions.
- existing website favorite click behavior still navigates outside edit mode.

## Documentation Updates

Implementation must update:

- `docs/requirements/requirements.md` for favorite folder behavior.
- `docs/ux/ux-blueprint.md` for folder modal, breadcrumbs, empty states, and mobile behavior.
- `docs/ui/ui-design.md` for folder tile/modal component rules.
- `docs/systemdesign/system-design.md` for the nested favorite data model and migration.
- `docs/testing/test-plan.md` for folder unit/component/e2e coverage.
- `docs/agents/knowledge-rules.md` if a new cross-cutting rule emerges.

## Out Of Scope For First Version

- Cross-folder drag-and-drop.
- Bulk import/export of bookmark folders.
- Browser bookmark sync.
- Permissions or shared folders.
- Server persistence beyond the existing libSQL scaffold.
