import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FavoriteEditor } from "@/components/homepage/favorite-editor";

type Listener = (event: MediaQueryListEvent) => void;

class MockMediaQueryList {
  matches: boolean;
  media: string;
  private listeners: Set<Listener> = new Set();
  constructor(media: string, matches: boolean) {
    this.media = media;
    this.matches = matches;
  }
  addEventListener(_type: "change", listener: Listener) {
    this.listeners.add(listener);
  }
  removeEventListener(_type: "change", listener: Listener) {
    this.listeners.delete(listener);
  }
}

function stubMatchMedia(matchMobile: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => new MockMediaQueryList(media, matchMobile)),
  );
}

describe("FavoriteEditor responsive", () => {
  beforeEach(() => {
    // Default: not mobile.
    stubMatchMedia(false);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("at sm and above renders a centred card with max-w-md", () => {
    stubMatchMedia(false);
    render(<FavoriteEditor open favorite={null} onClose={() => {}} onSave={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /favorite editor/i });
    const form = dialog.querySelector("form")!;
    expect(form.className).toMatch(/max-w-md/);
    // No full-screen height marker.
    expect(form.className).not.toMatch(/h-\[100svh\]/);
  });

  it("at <sm renders a full-screen modal with h-[100svh]", () => {
    stubMatchMedia(true);
    render(<FavoriteEditor open favorite={null} onClose={() => {}} onSave={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /favorite editor/i });
    const form = dialog.querySelector("form")!;
    expect(form.className).toMatch(/h-\[100svh\]/);
    // Save button container reserves safe-area-inset-bottom padding.
    const save = screen.getByRole("button", { name: /save favorite/i });
    const stickyFooter = save.closest("[data-sticky-footer='true']");
    expect(stickyFooter).not.toBeNull();
    expect((stickyFooter as HTMLElement).className).toMatch(/env\(safe-area-inset-bottom\)/);
  });
});
