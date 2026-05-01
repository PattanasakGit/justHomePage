import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { SortableZone } from "@/components/homepage/sortable-zone";

function renderZone(props: Parameters<typeof SortableZone>[0]) {
  return render(
    <DndContext>
      <SortableContext items={[`zone-${props.zoneId}`]}>
        <SortableZone {...props} />
      </SortableContext>
    </DndContext>,
  );
}

describe("SortableZone", () => {
  it("renders only children when not in edit mode", () => {
    renderZone({
      zoneId: "favorites",
      label: "Favorites",
      editMode: false,
      visible: true,
      onToggleVisible: () => {},
      children: <div>child-content</div>,
    });
    expect(screen.getByText("child-content")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Reorder favorites/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Hide favorites/i)).not.toBeInTheDocument();
  });

  it("renders drag handle and visibility toggle in edit mode", () => {
    renderZone({
      zoneId: "favorites",
      label: "Favorites",
      editMode: true,
      visible: true,
      onToggleVisible: () => {},
      children: <div>child</div>,
    });
    expect(screen.getByLabelText(/Reorder favorites/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hide favorites zone/i)).toBeInTheDocument();
  });

  it("calls onToggleVisible when the eye button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderZone({
      zoneId: "search",
      label: "Search",
      editMode: true,
      visible: true,
      onToggleVisible: onToggle,
      children: <div>child</div>,
    });
    await user.click(screen.getByLabelText(/Hide search zone/i));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("uses 'Show' label when zone is hidden", () => {
    renderZone({
      zoneId: "search",
      label: "Search",
      editMode: true,
      visible: false,
      onToggleVisible: () => {},
      children: <div>child</div>,
    });
    expect(screen.getByLabelText(/Show search zone/i)).toBeInTheDocument();
  });
});
