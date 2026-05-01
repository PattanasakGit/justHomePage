import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { WidgetFrame } from "@/components/widgets/widget-frame";
import { useHomeStore } from "@/stores/home-store";
import { defaultWidgets } from "@/data/defaults";
import type { HomeWidget } from "@/lib/types";

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

function stubMobile(value: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => new MockMediaQueryList(media, value)),
  );
}

function withEditMode(enable: boolean) {
  act(() => {
    useHomeStore.setState((state) => ({
      preferences: { ...state.preferences, editMode: enable },
    }));
  });
}

function ensureWidget(widget: HomeWidget) {
  act(() => {
    useHomeStore.setState({ widgets: [widget] });
  });
}

function resetStore() {
  act(() => {
    useHomeStore.setState({
      widgets: defaultWidgets.map((w) => ({ ...w, layout: { ...w.layout } })),
      preferences: {
        ...useHomeStore.getState().preferences,
        editMode: false,
      },
    });
  });
}

describe("WidgetFrame variant submenu", () => {
  it("renders the overflow trigger only in edit mode", () => {
    resetStore();
    const widget = useHomeStore.getState().widgets[0];
    const { rerender } = render(<WidgetFrame widget={widget} scale="cozy" />);
    expect(screen.queryByLabelText(/More actions/i)).toBeNull();
    withEditMode(true);
    rerender(<WidgetFrame widget={widget} scale="cozy" />);
    expect(screen.getByLabelText(/More actions/i)).toBeInTheDocument();
    resetStore();
  });

  it("opens the variant submenu when the overflow trigger is clicked", () => {
    resetStore();
    withEditMode(true);
    const widget = useHomeStore.getState().widgets[0]; // clock
    render(<WidgetFrame widget={widget} scale="cozy" />);
    const trigger = screen.getByLabelText(/More actions/i);
    fireEvent.click(trigger);
    // Should list multiple variants for clock (square / banner / display)
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitemradio").length).toBeGreaterThanOrEqual(2);
    resetStore();
  });

  it("clicking a variant item updates the active variant in the store", () => {
    resetStore();
    withEditMode(true);
    const clock = useHomeStore.getState().widgets.find((w) => w.type === "clock")!;
    ensureWidget(clock);
    render(<WidgetFrame widget={clock} scale="cozy" />);
    fireEvent.click(screen.getByLabelText(/More actions/i));
    const items = screen.getAllByRole("menuitemradio");
    // Pick the first non-active variant
    const target = items.find((item) => item.getAttribute("aria-checked") !== "true");
    expect(target).toBeDefined();
    fireEvent.click(target!);
    const state = useHomeStore.getState();
    const after = state.widgets.find((w) => w.id === clock.id)!;
    expect(after.variant).not.toBe(clock.variant);
    resetStore();
  });

  it("includes a Remove menuitem", () => {
    resetStore();
    withEditMode(true);
    const widget = useHomeStore.getState().widgets[0];
    render(<WidgetFrame widget={widget} scale="cozy" />);
    fireEvent.click(screen.getByLabelText(/More actions/i));
    expect(screen.getByRole("menuitem", { name: /remove/i })).toBeInTheDocument();
    resetStore();
  });
});

describe("WidgetFrame mobile bodies", () => {
  beforeEach(() => {
    resetStore();
    stubMobile(true);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    resetStore();
  });

  function makeWidget(type: HomeWidget["type"], variant: string): HomeWidget {
    const base = defaultWidgets.find((w) => w.type === type);
    return {
      id: `mobile-${type}`,
      type,
      title: type,
      variant,
      layout: { x: 0, y: 0, w: 4, h: 2 },
      config: base ? { ...base.config } : {},
    };
  }

  it("at <sm renders weather as a single-line mobile body", () => {
    const widget = makeWidget("weather", "weather-card");
    const { container } = render(<WidgetFrame widget={widget} scale="cozy" />);
    expect(container.querySelector("[data-mobile-weather='true']")).not.toBeNull();
  });

  it("at <sm forces pomodoro to render the compact body even with another variant", () => {
    const widget = makeWidget("pomodoro", "pomo-card");
    widget.config = { focusMinutes: 25, breakMinutes: 5 };
    const { container } = render(<WidgetFrame widget={widget} scale="cozy" />);
    // Compact body has the role=progressbar from CompactBody. The card variant
    // would render an SVG ring instead.
    expect(container.querySelector("[role='progressbar']")).not.toBeNull();
    expect(container.querySelector("[data-testid='pomodoro-ring']")).toBeNull();
  });

  it("at <sm renders bookmark as a launch-row when a url is set", () => {
    const widget = makeWidget("bookmark", "bookmark-card");
    widget.config = { url: "https://example.com", caption: "Example", thumbnail: null };
    const { container } = render(<WidgetFrame widget={widget} scale="cozy" />);
    expect(container.querySelector("[data-mobile-bookmark='true']")).not.toBeNull();
  });

  it("at <sm in edit mode the header has NO inline Move up/down arrow buttons", () => {
    withEditMode(true);
    const widget = makeWidget("clock", "clock-square");
    render(<WidgetFrame widget={widget} scale="cozy" />);
    // Inline buttons (the FiArrowUp/FiArrowDown row) are no longer rendered.
    // The button-role match excludes the menu-only items added inside the
    // overflow popover.
    expect(screen.queryByRole("button", { name: /^Move .* up$/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Move .* down$/i })).toBeNull();
  });

  it("at <sm in edit mode the overflow menu lists Move up, Move down, then Remove", () => {
    withEditMode(true);
    const widget = makeWidget("clock", "clock-square");
    render(<WidgetFrame widget={widget} scale="cozy" />);
    fireEvent.click(screen.getByLabelText(/More actions/i));
    const items = screen.getAllByRole("menuitem");
    const labels = items.map((el) => el.textContent?.trim() ?? "");
    const moveUpIdx = labels.findIndex((t) => /move up/i.test(t));
    const moveDownIdx = labels.findIndex((t) => /move down/i.test(t));
    const removeIdx = labels.findIndex((t) => /remove/i.test(t));
    expect(moveUpIdx).toBeGreaterThanOrEqual(0);
    expect(moveDownIdx).toBeGreaterThan(moveUpIdx);
    expect(removeIdx).toBeGreaterThan(moveDownIdx);
  });

  it("at <sm caps todo and notes inner scroll at max-h-[40svh]", () => {
    const todo = makeWidget("todo", "todo-list");
    todo.config = { items: [] };
    const { container: todoContainer } = render(
      <WidgetFrame widget={todo} scale="cozy" />,
    );
    expect(todoContainer.querySelector("[data-mobile-cap='true']")).not.toBeNull();

    const notes = makeWidget("notes", "notes-pad");
    notes.config = { body: "" };
    const { container: notesContainer } = render(
      <WidgetFrame widget={notes} scale="cozy" />,
    );
    expect(notesContainer.querySelector("[data-mobile-cap='true']")).not.toBeNull();
  });
});
