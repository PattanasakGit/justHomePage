import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddLibrarySheet } from "./add-library-sheet";

const folders = [{ id: "folder-work", name: "Work" }];

describe("AddLibrarySheet", () => {
  it("prefills folder select from defaultFolderId", () => {
    render(
      <AddLibrarySheet
        open
        mode="bookmark"
        folders={folders}
        defaultFolderId="folder-work"
        onClose={vi.fn()}
        onSaveBookmark={vi.fn()}
        onSaveFolder={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Folder")).toHaveValue("folder-work");
  });

  it("creates a folder from folder mode", async () => {
    const user = userEvent.setup();
    const onSaveFolder = vi.fn();
    render(
      <AddLibrarySheet
        open
        mode="folder"
        folders={folders}
        defaultFolderId={null}
        onClose={vi.fn()}
        onSaveBookmark={vi.fn()}
        onSaveFolder={onSaveFolder}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Folder" }));
    await user.type(screen.getByPlaceholderText("Projects"), "Ideas");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onSaveFolder).toHaveBeenCalledWith("Ideas");
  });
});
