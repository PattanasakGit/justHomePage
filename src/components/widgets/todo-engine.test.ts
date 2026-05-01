import { describe, expect, it } from "vitest";
import { addTodo, clearDone, removeTodo, toggleTodo } from "@/components/widgets/todo-engine";
import type { TodoItem } from "@/lib/types";

describe("todo engine", () => {
  it("addTodo trims and ignores empty input", () => {
    expect(addTodo([], "  ")).toEqual([]);
    const items = addTodo([], "  Read book  ");
    expect(items).toHaveLength(1);
    expect(items[0]?.text).toBe("Read book");
    expect(items[0]?.done).toBe(false);
  });

  it("toggleTodo flips done flag for the matched id", () => {
    const items: TodoItem[] = [
      { id: "a", text: "A", done: false },
      { id: "b", text: "B", done: false },
    ];
    const next = toggleTodo(items, "a");
    expect(next[0]?.done).toBe(true);
    expect(next[1]?.done).toBe(false);
  });

  it("removeTodo strips the matched item", () => {
    const items: TodoItem[] = [
      { id: "a", text: "A", done: false },
      { id: "b", text: "B", done: true },
    ];
    expect(removeTodo(items, "a")).toEqual([{ id: "b", text: "B", done: true }]);
  });

  it("clearDone keeps only undone items", () => {
    const items: TodoItem[] = [
      { id: "a", text: "A", done: true },
      { id: "b", text: "B", done: false },
    ];
    expect(clearDone(items)).toEqual([{ id: "b", text: "B", done: false }]);
  });
});
