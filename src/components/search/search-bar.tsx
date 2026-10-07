"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiArrowRight } from "react-icons/fi";
import { getBrandIcon } from "@/components/icons/brand-icon";
import { buildSearchUrl, resolveSearchInput, searchProviders } from "@/lib/search";
import type { SearchProviderId } from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const providerId = useHomeStore((state) => state.preferences.searchProvider);
  const chrome = useHomeStore((state) => state.preferences.chrome);
  const setSearchProvider = useHomeStore((state) => state.setSearchProvider);
  const provider = useMemo(() => searchProviders.find((item) => item.id === providerId) ?? searchProviders[0], [providerId]);
  const providerBrand = getBrandIcon(provider.id);
  const ProviderIcon = providerBrand.icon;
  const groupedProviders = useMemo(
    () =>
      searchProviders.reduce<Record<string, typeof searchProviders>>((groups, item) => {
        groups[item.group] = [...(groups[item.group] ?? []), item];
        return groups;
      }, {}),
    [],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resolved = resolveSearchInput(providerId, query);
    if (!resolved.query) {
      inputRef.current?.focus();
      return;
    }
    setSearchProvider(resolved.providerId as SearchProviderId);
    window.location.href = buildSearchUrl(resolved.providerId, resolved.query);
  }

  return (
    <div className="w-full">
      <form
        role="search"
        onSubmit={onSubmit}
        className="glass-heavy relative z-40 flex min-h-[52px] w-full items-center gap-1.5 rounded-full border border-white/50 px-3 py-1 shadow-[var(--shadow-glass)]"
      >
        <div className="relative">
          <button
            type="button"
            aria-label="Choose search engine"
            aria-expanded={providerMenuOpen}
            onClick={() => setProviderMenuOpen((open) => !open)}
            className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full px-2.5 text-[15px] font-medium tracking-tight text-[color:var(--muted)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          >
            <ProviderIcon style={{ color: providerBrand.color }} aria-hidden />
            <span className="hidden max-w-[100px] truncate sm:inline">{provider.label}</span>
            <FiChevronDown className={`opacity-70 transition ${providerMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {providerMenuOpen ? (
            <div className="glass-heavy absolute left-0 top-[calc(100%+10px)] z-50 max-h-[420px] w-[min(82vw,360px)] overflow-y-auto rounded-[22px] border border-[color:var(--separator)] p-3 text-left shadow-[var(--shadow-float)]">
              {(["Web", "AI", "Media"] as const).map((group) =>
                groupedProviders[group]?.length ? (
                  <div key={group} className="py-1">
                    <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                      {group}
                    </div>
                    <div className="grid gap-1">
                      {groupedProviders[group].map((item) => {
                        const brand = getBrandIcon(item.id);
                        const Icon = brand.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={`Use ${item.label}`}
                            onClick={() => {
                              setSearchProvider(item.id);
                              setProviderMenuOpen(false);
                              inputRef.current?.focus();
                            }}
                            className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
                              item.id === providerId
                                ? "bg-[color:var(--ink)] text-[color:var(--ink-inverse)]"
                                : "text-[color:var(--ink)] hover:bg-[color:var(--surface)]"
                            }`}
                          >
                            <span className="inline-flex items-center gap-3">
                              <Icon style={{ color: item.id === providerId ? "currentColor" : brand.color }} />
                              {item.label}
                            </span>
                            <span className="text-xs font-bold text-[color:var(--muted)]">/{item.shortcut}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          ) : null}
        </div>

        <input
          ref={inputRef}
          aria-label="Search the web"
          role="searchbox"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search or type g cats…"
          className="h-11 min-w-0 flex-1 bg-transparent text-[17px] font-normal tracking-tight outline-none placeholder:text-[color:var(--muted)]"
        />

        <button
          type="submit"
          aria-label="Search"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--accent)] text-lg font-semibold text-white shadow-[0_2px_8px_color-mix(in_srgb,var(--accent)_40%,transparent)] transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        >
          <FiArrowRight />
        </button>
      </form>
      {chrome === "shown" ? (
        <p className="mt-2.5 pl-3.5 text-[13px] font-normal text-[color:var(--muted)]">
          Shortcuts <code className="rounded-md bg-[color:var(--surface)] px-1.5 py-0.5 font-mono text-[12px]">g</code> ·{" "}
          <code className="rounded-md bg-[color:var(--surface)] px-1.5 py-0.5 font-mono text-[12px]">yt</code> ·{" "}
          <code className="rounded-md bg-[color:var(--surface)] px-1.5 py-0.5 font-mono text-[12px]">ai</code>
        </p>
      ) : null}
    </div>
  );
}
