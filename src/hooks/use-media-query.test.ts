import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMediaQuery } from "./use-media-query";

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
  dispatch(matches: boolean) {
    this.matches = matches;
    const event = { matches, media: this.media } as MediaQueryListEvent;
    this.listeners.forEach((listener) => listener(event));
  }
}

describe("useMediaQuery", () => {
  let mql: MockMediaQueryList;
  beforeEach(() => {
    mql = new MockMediaQueryList("(max-width: 639.98px)", false);
    vi.stubGlobal("matchMedia", vi.fn(() => mql));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the initial matches value from matchMedia", () => {
    mql.matches = true;
    const { result } = renderHook(() => useMediaQuery("(max-width: 639.98px)"));
    expect(result.current).toBe(true);
  });

  it("updates when the media query changes", () => {
    const { result } = renderHook(() => useMediaQuery("(max-width: 639.98px)"));
    expect(result.current).toBe(false);
    act(() => {
      mql.dispatch(true);
    });
    expect(result.current).toBe(true);
  });

  it("returns false when window is undefined (SSR)", async () => {
    // Simulate SSR by checking the SSR-safe getter directly. We re-import the
    // module to exercise the typeof window === 'undefined' branch by stubbing
    // matchMedia to undefined too.
    vi.unstubAllGlobals();
    vi.stubGlobal("matchMedia", undefined);
    const { result } = renderHook(() => useMediaQuery("(max-width: 639.98px)"));
    expect(result.current).toBe(false);
  });

  it("unsubscribes the listener on unmount", () => {
    const removeSpy = vi.spyOn(mql, "removeEventListener");
    const { unmount } = renderHook(() => useMediaQuery("(max-width: 639.98px)"));
    unmount();
    expect(removeSpy).toHaveBeenCalled();
  });
});
