import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./search-bar";

vi.mock("@/stores/home-store", () => ({
  useHomeStore: (selector: (state: { preferences: { chrome: string } }) => unknown) =>
    selector({ preferences: { chrome: "shown" } }),
}));

describe("SearchBar", () => {
  it("renders Google-only search without provider picker", () => {
    render(<SearchBar />);
    expect(screen.getByRole("searchbox", { name: "Search Google" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /choose search engine/i })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search Google")).toBeInTheDocument();
  });
});
