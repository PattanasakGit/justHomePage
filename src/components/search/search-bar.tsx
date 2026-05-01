"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch, FiSliders } from "react-icons/fi";
import { getBrandIcon } from "@/components/icons/brand-icon";
import { buildSearchUrl, resolveSearchInput, searchProviders } from "@/lib/search";
import type { SearchProviderId } from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const providerId = useHomeStore((state) => state.preferences.searchProvider);
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
    <div>
      <form
        role="search"
        onSubmit={onSubmit}
        className="relative z-40 mx-auto flex min-h-[64px] max-w-[820px] items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-4 shadow-search backdrop-blur-xl sm:min-h-[78px] sm:gap-3 sm:px-5"
      >
        <FiSearch className="shrink-0 text-2xl text-[color:var(--muted)]" aria-hidden />
        <input
          ref={inputRef}
          aria-label="Search the web"
          role="searchbox"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the web..."
          className="h-12 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:font-normal placeholder:text-[color:var(--muted)] sm:h-16 sm:text-xl"
        />
        {/* TODO: wire FiSliders to a "search settings" sheet (saved searches,
            keyboard shortcuts). Hidden on <sm because it has no behavior yet
            and only crowds the pill on iPhone. See ux-lead spec §6 (2026-05-01). */}
        <button
          type="button"
          aria-label="Search settings"
          className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-lg text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] sm:grid"
        >
          <FiSliders />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Choose search engine"
            aria-expanded={providerMenuOpen}
            onClick={() => setProviderMenuOpen((open) => !open)}
            className="inline-flex h-11 min-h-11 shrink-0 items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] sm:h-12 sm:gap-2 sm:px-5 sm:text-base"
          >
            <ProviderIcon style={{ color: providerBrand.color }} />
            <span className="hidden max-w-[118px] truncate sm:inline">{provider.label}</span>
            <FiChevronDown className={`text-[color:var(--muted)] transition ${providerMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {providerMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[60svh] w-[min(92vw,360px)] overflow-y-auto rounded-[26px] border border-[color:var(--border)] bg-[color:var(--popup)] p-3 text-left shadow-panel sm:top-[calc(100%+12px)]">
              {(["Web", "AI", "Media"] as const).map((group) =>
                groupedProviders[group]?.length ? (
                  <div key={group} className="py-1">
                    <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
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
                            className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
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
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>
    </div>
  );
}
