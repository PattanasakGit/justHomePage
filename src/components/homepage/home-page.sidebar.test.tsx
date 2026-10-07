import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setLibrarySidebarOpen = vi.fn();

vi.mock("@/stores/home-store", () => ({
  useHomeStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      favorites: [
        { id: "fav-1", title: "GitHub", url: "https://github.com", icon: "github", folderId: "folder-work" },
      ],
      folders: [{ id: "folder-work", name: "Work" }],
      preferences: {
        searchProvider: "google",
        theme: "linen",
        appearance: "light",
        wallpaperImage: null,
        wallpaperLuminance: null,
        font: "system",
        accentColor: "#0071e3",
        uiOpacity: 62,
        blur: 40,
        contrast: "auto",
        contrastStrength: "normal",
        density: "cozy",
        chrome: "shown",
        favoriteScale: "cozy",
        widgetScale: "cozy",
        editMode: false,
        activeFolderId: null,
        iconSize: "md",
        librarySidebarOpen: true,
      },
      addFavorite: vi.fn(),
      updateFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      reorderFavorites: vi.fn(),
      addFolder: vi.fn(),
      setActiveFolder: vi.fn(),
      importBookmarks: vi.fn(),
      exportBookmarks: vi.fn(() => ""),
      setEditMode: vi.fn(),
      setAppearance: vi.fn(),
      setLibrarySidebarOpen,
    }),
}));

import { HomePage } from "./home-page";

describe("HomePage library sidebar", () => {
  beforeEach(() => {
    setLibrarySidebarOpen.mockClear();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("860px"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("toggles library sidebar open state on desktop", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByRole("button", { name: "Toggle library sidebar" }));
    expect(setLibrarySidebarOpen).toHaveBeenCalledWith(false);
  });
});
