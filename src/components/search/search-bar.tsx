"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { FormEvent, useRef, useState } from "react";
import { buildSearchUrl } from "@/lib/search";

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    window.location.href = buildSearchUrl("google", trimmed);
  }

  return (
    <div className="w-full">
      <form
        role="search"
        onSubmit={onSubmit}
        className="glass-heavy relative z-40 flex min-h-[52px] w-full items-center gap-2 rounded-full border border-white/50 px-4 py-1 shadow-[var(--shadow-glass)]"
      >
        <input
          ref={inputRef}
          aria-label="Search Google"
          role="searchbox"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Google"
          className="h-11 min-w-0 flex-1 bg-transparent text-[17px] font-normal tracking-tight outline-none placeholder:text-[color:var(--muted)]"
        />

        <button
          type="submit"
          aria-label="Search"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--accent)] text-lg font-semibold text-white shadow-[0_2px_8px_color-mix(in_srgb,var(--accent)_40%,transparent)] transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        >
          <ArrowRight weight="bold" className="text-white" aria-hidden />
        </button>
      </form>
    </div>
  );
}
