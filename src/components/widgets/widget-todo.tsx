"use client";

import { FormEvent, useState } from "react";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import { addTodo, clearDone, removeTodo, toggleTodo } from "@/components/widgets/todo-engine";
import type { TodoItem, WidgetSize } from "@/lib/types";

export function WidgetTodo({
  items,
  size = "regular",
  onChange,
}: {
  items: TodoItem[];
  size?: WidgetSize;
  onChange: (next: TodoItem[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const remaining = items.filter((item) => !item.done).length;
  const listMaxClass = size === "tall" || size === "hero" ? "max-h-none" : "max-h-[140px]";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    onChange(addTodo(items, draft));
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a task"
          aria-label="Add a task"
          className="h-9 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        />
        <button
          type="submit"
          aria-label="Add task"
          className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--accent)] text-[color:var(--ink-inverse)] shadow-soft transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        >
          <FiPlus />
        </button>
      </form>
      <ul className={`mt-3 flex-1 space-y-1 overflow-y-auto ${listMaxClass}`}>
        {items.length === 0 ? (
          <li className="grid place-items-center rounded-2xl border border-dashed border-[color:var(--border)] py-4 text-xs text-[color:var(--muted)]">
            Nothing on the list — add a task above.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="group relative flex items-center gap-2 rounded-xl pl-3 pr-2 py-1.5 transition hover:bg-[color:var(--surface)]"
            >
              <span
                aria-hidden
                className={`absolute inset-y-1 left-0 w-[2px] rounded-full transition ${
                  item.done ? "bg-[color:var(--accent)]" : "bg-[color:var(--accent-soft)]"
                }`}
              />
              <button
                type="button"
                aria-label={item.done ? `Mark "${item.text}" not done` : `Mark "${item.text}" done`}
                onClick={() => onChange(toggleTodo(items, item.id))}
                className={`grid h-6 w-6 place-items-center rounded-md border text-[10px] transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                  item.done
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--ink-inverse)]"
                    : "border-[color:var(--border)] bg-[color:var(--surface-strong)]"
                }`}
              >
                {item.done ? <FiCheck /> : null}
              </button>
              <span
                className={`flex-1 text-sm ${item.done ? "text-[color:var(--muted)] line-through" : "text-[color:var(--ink)]"}`}
              >
                {item.text}
              </span>
              <button
                type="button"
                aria-label={`Remove "${item.text}"`}
                onClick={() => onChange(removeTodo(items, item.id))}
                className="grid h-6 w-6 place-items-center rounded-full text-[color:var(--muted)] opacity-0 transition hover:bg-[color:var(--surface-strong)] focus:opacity-100 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <FiX />
              </button>
            </li>
          ))
        )}
      </ul>
      {items.length > 0 ? (
        <div className="mt-2 flex items-center justify-between text-[11px] text-[color:var(--muted)]">
          <span>{remaining} remaining</span>
          {items.some((item) => item.done) ? (
            <button
              type="button"
              onClick={() => onChange(clearDone(items))}
              className="rounded-full px-2 py-0.5 font-semibold transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              clear done
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
