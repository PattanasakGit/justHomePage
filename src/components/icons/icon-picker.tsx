"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { getBrandIcon } from "@/components/icons/brand-icon";
import {
  iconCategories,
  iconCatalog,
  searchCatalog,
  LETTER_ICON,
  type IconCategory,
} from "@/components/icons/icon-catalog";
import { getLetterAvatar } from "@/lib/letter-avatar";

const PAGE_SIZE = 28;

const categoryLabels: Record<IconCategory | "all", string> = {
  all: "All",
  brand: "Brand",
  productivity: "Productivity",
  communication: "Communication",
  media: "Media",
  money: "Money",
  travel: "Travel",
  general: "General",
};

const chipOrder: Array<IconCategory | "all"> = ["all", "brand", "productivity", "communication", "media", "money", "travel", "general"];

type IconPickerProps = {
  value: string;
  title: string;
  onChange: (next: string) => void;
  /** When true, switches to a 6-col grid and a viewport-relative scroll cap
   *  (`max-h-[40svh]`) sized for the mobile full-screen favorite editor. */
  mobileScrollCap?: boolean;
};

export function IconPicker({ value, title, onChange, mobileScrollCap = false }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | "all">("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const base = query.trim() ? searchCatalog(query) : iconCatalog;
    const byCategory =
      category === "all" ? base : base.filter((entry) => entry.category === category);
    // Letter avatar always shown first when no specific search hides it.
    return byCategory.filter((entry) => entry.id !== LETTER_ICON);
  }, [query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const showLetter = category === "all" && (query.trim() === "" || "letter avatar".includes(query.trim().toLowerCase()));

  function handleSelect(id: string) {
    onChange(id);
  }

  function resetPage() {
    setPage(0);
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            resetPage();
          }}
          placeholder="Search icons"
          aria-label="Search icons"
          className="h-10 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] pl-9 pr-3 text-sm text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        />
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {chipOrder.map((id) => {
          const isAll = id === "all";
          const active = category === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setCategory(isAll ? "all" : (id as IconCategory));
                resetPage();
              }}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                active
                  ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--ink-inverse)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-[color:var(--surface-strong)]"
              }`}
            >
              {categoryLabels[id]}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-3 overflow-y-auto ${
          mobileScrollCap ? "max-h-[40svh]" : "max-h-[260px]"
        }`}
      >
        {showLetter ? (
          <>
            <div className="mb-2 grid grid-cols-6 gap-2 sm:grid-cols-7">
              <IconButton
                key={LETTER_ICON}
                id={LETTER_ICON}
                label="Letter avatar"
                selected={value === LETTER_ICON}
                onSelect={handleSelect}
                title={title}
              />
            </div>
            <div className="my-2 h-px bg-[color:var(--border)]" aria-hidden />
          </>
        ) : null}

        {pageItems.length === 0 && !showLetter ? (
          <div className="grid place-items-center px-4 py-8 text-center text-sm text-[color:var(--muted)]">
            No icons match your search.
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-7">
            {pageItems.map((entry) => (
              <IconButton
                key={entry.id}
                id={entry.id}
                label={entry.label}
                selected={value === entry.id}
                onSelect={handleSelect}
                title={title}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--muted)]">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="rounded-full px-3 py-1 font-semibold transition hover:bg-[color:var(--surface-strong)] disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            Prev
          </button>
          <span>
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
            disabled={safePage >= totalPages - 1}
            className="rounded-full px-3 py-1 font-semibold transition hover:bg-[color:var(--surface-strong)] disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  id,
  label,
  selected,
  onSelect,
  title,
}: {
  id: string;
  label: string;
  selected: boolean;
  onSelect: (id: string) => void;
  title: string;
}) {
  const isLetter = id === LETTER_ICON;
  const brand = getBrandIcon(id);
  const Icon = brand.icon;
  const letterAvatar = isLetter ? getLetterAvatar(title || "Aa") : null;
  const useBrandColor = brand.color !== "currentColor";
  return (
    <button
      type="button"
      aria-label={isLetter ? "Use letter avatar" : `Use ${label} icon`}
      onClick={() => onSelect(id)}
      className={`grid h-11 w-11 place-items-center rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
        selected
          ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
          : "border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-strong)]"
      }`}
    >
      {letterAvatar ? (
        <span
          className="grid h-7 w-7 place-items-center rounded-xl text-xs font-bold uppercase text-white"
          style={{ backgroundColor: letterAvatar.color }}
        >
          {letterAvatar.letter}
        </span>
      ) : (
        <Icon style={useBrandColor ? { color: brand.color } : { color: "var(--ink)" }} />
      )}
    </button>
  );
}
