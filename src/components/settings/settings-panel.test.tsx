import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsPanel } from "@/components/settings/settings-panel";

type Listener = (event: MediaQueryListEvent) => void;

class MockMediaQueryList {
  matches: boolean;
  media: string;
  private listeners: Set<Listener> = new Set();
  constructor(media: string, matches: boolean) {
    this.media = media;
    this.matches = matches;
  }
  addEventListener(_t: "change", l: Listener) {
    this.listeners.add(l);
  }
  removeEventListener(_t: "change", l: Listener) {
    this.listeners.delete(l);
  }
}

function stubMatchMedia(mobile: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => new MockMediaQueryList(media, mobile)),
  );
}

describe("SettingsPanel responsive", () => {
  beforeEach(() => stubMatchMedia(false));
  afterEach(() => vi.unstubAllGlobals());

  it("at ≥sm renders a right-anchored drawer with m-3 gap", () => {
    stubMatchMedia(false);
    render(<SettingsPanel open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /settings/i });
    const panel = dialog.querySelector("[data-settings-panel='true']") as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.className).toMatch(/m-3/);
    expect(panel.className).toMatch(/rounded-\[28px\]/);
    // Not a bottom sheet
    expect(panel.className).not.toMatch(/rounded-t-\[28px\]/);
  });

  it("at <sm renders a bottom sheet with rounded-t-[28px] anchored to the bottom", () => {
    stubMatchMedia(true);
    render(<SettingsPanel open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /settings/i });
    const panel = dialog.querySelector("[data-settings-panel='true']") as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.className).toMatch(/rounded-t-\[28px\]/);
    expect(panel.className).toMatch(/inset-x-0/);
    expect(panel.className).toMatch(/bottom-0/);
    expect(panel.className).toMatch(/max-h-\[88svh\]/);
    // Drag indicator
    const handle = dialog.querySelector("[data-sheet-handle='true']");
    expect(handle).not.toBeNull();
  });
});
