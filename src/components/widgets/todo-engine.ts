import type { TodoItem } from "@/lib/types";

const makeId = () =>
  `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function addTodo(items: TodoItem[], text: string): TodoItem[] {
  const trimmed = text.trim();
  if (!trimmed) return items;
  return [...items, { id: makeId(), text: trimmed, done: false }];
}

export function toggleTodo(items: TodoItem[], id: string): TodoItem[] {
  return items.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
}

export function removeTodo(items: TodoItem[], id: string): TodoItem[] {
  return items.filter((item) => item.id !== id);
}

export function clearDone(items: TodoItem[]): TodoItem[] {
  return items.filter((item) => !item.done);
}
