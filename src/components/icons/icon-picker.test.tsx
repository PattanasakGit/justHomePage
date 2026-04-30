import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconPicker } from "@/components/icons/icon-picker";

describe("IconPicker", () => {
  it("renders the search input and category chips", () => {
    render(<IconPicker value="letter" title="Sample" onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search icons/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Brand/i })).toBeInTheDocument();
  });

  it("filters icons by search query", async () => {
    const user = userEvent.setup();
    render(<IconPicker value="letter" title="Sample" onChange={() => {}} />);
    const search = screen.getByPlaceholderText(/search icons/i);
    await user.type(search, "github");
    expect(screen.getByLabelText(/Use GitHub icon/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Use Spotify icon/i)).not.toBeInTheDocument();
  });

  it("filters icons by category chip", async () => {
    const user = userEvent.setup();
    render(<IconPicker value="letter" title="Sample" onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /Money/i }));
    // dollar icon should appear, github should not (in current page)
    expect(screen.getByLabelText(/Use Money icon/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Use GitHub icon/i)).not.toBeInTheDocument();
  });

  it("calls onChange when an icon is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<IconPicker value="letter" title="Sample" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText(/search icons/i), "github");
    await user.click(screen.getByLabelText(/Use GitHub icon/i));
    expect(onChange).toHaveBeenCalledWith("github");
  });

  it("renders an empty state when no icons match", async () => {
    const user = userEvent.setup();
    render(<IconPicker value="letter" title="Sample" onChange={() => {}} />);
    await user.type(screen.getByPlaceholderText(/search icons/i), "zzznotaniconzzz");
    expect(screen.getByText(/no icons match/i)).toBeInTheDocument();
  });
});
