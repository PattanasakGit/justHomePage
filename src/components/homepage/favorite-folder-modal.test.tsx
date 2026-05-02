import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavoriteFolderModal } from "@/components/homepage/favorite-folder-modal";
import { FavoriteTile } from "@/components/homepage/favorite-tile";
import type { FavoriteFolder, FavoriteItem } from "@/lib/types";

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>();
  return {
    ...actual,
    useDroppable: () => ({ isOver: false, setNodeRef: vi.fn() }),
  };
});

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  rectSortingStrategy: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

const folder: FavoriteFolder = {
  type: "folder",
  id: "folder-work",
  title: "Work",
  icon: "fi-folder",
  children: [
    {
      type: "folder",
      id: "folder-ai",
      title: "AI",
      icon: "fi-folder",
      children: [{ type: "link", id: "fav-openai", title: "OpenAI", url: "https://openai.com", icon: "openai" }],
    },
  ],
};

describe("favorite folders", () => {
  it("folder tile opens a folder instead of navigating", async () => {
    const user = userEvent.setup();
    const openFolder = vi.fn();
    const location = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...location, href: "http://localhost/" },
    });

    render(
      <FavoriteTile
        favorite={folder}
        editMode={false}
        scale="cozy"
        onEdit={() => {}}
        onRemove={() => {}}
        onOpenFolder={openFolder}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open folder Work" }));
    expect(openFolder).toHaveBeenCalledWith(folder.id);
    expect(window.location.href).toBe("http://localhost/");
    expect(document.querySelector("[data-folder-tile='true']")).not.toBeNull();

    Object.defineProperty(window, "location", { configurable: true, value: location });
  });

  it("renders breadcrumbs and drills into child folders", async () => {
    const user = userEvent.setup();
    render(
      <FavoriteFolderModal
        open
        rootItems={[folder]}
        folderId={folder.id}
        editMode={false}
        scale="cozy"
        onClose={() => {}}
        onOpenFolder={() => {}}
        onEditItem={() => {}}
        onRemoveItem={() => {}}
        onAddLink={() => {}}
        onAddFolder={() => {}}
      />,
    );

    expect(screen.getByRole("dialog", { name: /favorite folder/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move here: Favorites" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move here: Work" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open folder AI" }));
    expect(screen.getByRole("button", { name: "Move here: AI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OpenAI" })).toBeInTheDocument();
  });

  it("empty folders show add website and add folder actions", () => {
    const empty: FavoriteItem[] = [{ type: "folder", id: "folder-empty", title: "Empty", icon: "fi-folder", children: [] }];
    render(
      <FavoriteFolderModal
        open
        rootItems={empty}
        folderId="folder-empty"
        editMode={false}
        scale="cozy"
        onClose={() => {}}
        onOpenFolder={() => {}}
        onEditItem={() => {}}
        onRemoveItem={() => {}}
        onAddLink={() => {}}
        onAddFolder={() => {}}
      />,
    );

    expect(screen.getByText("This folder is empty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add website/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add folder/i })).toBeInTheDocument();
  });
});
