import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { WidgetFrame } from "@/components/widgets/widget-frame";
import { useHomeStore } from "@/stores/home-store";
import { defaultWidgets } from "@/data/defaults";
import type { HomeWidget } from "@/lib/types";

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
