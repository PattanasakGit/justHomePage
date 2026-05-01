"use client";

import { ChangeEvent, useEffect, useRef } from "react";
import { FiBookmark, FiExternalLink } from "react-icons/fi";
import type { BookmarkConfig, WidgetSize } from "@/lib/types";
import { normalizeUrl } from "@/lib/url";

export function WidgetBookmark({
  config,
  editing,
  size = "compact",
  onChange,
}: {
  config: Partial<BookmarkConfig>;
  editing: boolean;
  size?: WidgetSize;
  onChange: (next: Partial<BookmarkConfig>) => void;
}) {
  const url = config.url ?? "";
  const caption = config.caption ?? "";
  const thumbnail = config.thumbnail ?? null;
  const fetchedFor = useRef<string>("");

  useEffect(() => {
    const normalized = normalizeUrl(url);
    if (!normalized || fetchedFor.current === normalized) return;
    fetchedFor.current = normalized;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/site-metadata?url=${encodeURIComponent(normalized)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const metadata = (await response.json()) as {
          title?: string | null;
          iconUrl?: string | null;
        };
        if (metadata.iconUrl) onChange({ thumbnail: metadata.iconUrl });
        if (metadata.title && !caption) onChange({ caption: metadata.title });
      } catch {
        // ignore
      }
    }, 400);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (editing) {
    return (
      <div className="flex h-full flex-col gap-2">
        <input
          type="text"
          value={url}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange({ url: event.target.value })}
          placeholder="https://example.com"
          aria-label="Bookmark URL"
          className="h-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-xs text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        />
        <input
          type="text"
          value={caption}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange({ caption: event.target.value })}
          placeholder="Caption"
          aria-label="Bookmark caption"
          className="h-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-xs text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        />
        <p className="text-[11px] text-[color:var(--muted)]">Leave edit mode to use it as a launch tile.</p>
      </div>
    );
  }

  const safeUrl = normalizeUrl(url);
  const host = safeUrl ? safeUrl.replace(/^https?:\/\//, "").split("/")[0] : "";
  const isRegular = size === "regular";

  if (!safeUrl) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-dashed border-[color:var(--border)] p-3 text-center">
        {/* Icon plate exception: the bookmark plate stays bg-white per brand-icon rule. */}
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-[color:var(--muted)] ring-1 ring-[color:var(--border)]">
          <FiBookmark />
        </span>
        <span className="mt-2 text-xs text-[color:var(--muted)]">Add a bookmark — paste a URL in edit mode.</span>
      </div>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl p-2 transition hover:bg-[color:var(--surface)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
    >
      <span className="relative">
        {/* Icon plate exception: bg-white plate is the documented brand-icon affordance. */}
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/95 ring-1 ring-[color:var(--border)] transition group-hover:scale-[1.03] group-hover:ring-[color:var(--accent)] group-focus:ring-[color:var(--accent)]">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt="" className="h-7 w-7 rounded-md object-contain" />
          ) : (
            <FiBookmark className="text-[color:var(--muted)]" />
          )}
        </span>
        <FiExternalLink className="absolute -right-2 -top-2 hidden text-[color:var(--muted)] group-hover:block group-focus:block" />
      </span>
      <div className="text-center">
        <div className={`truncate ${isRegular ? "text-base" : "text-sm"} font-semibold text-[color:var(--ink)]`}>
          {caption || host}
        </div>
        {host ? <div className="truncate text-[11px] text-[color:var(--muted)]">{host}</div> : null}
      </div>
    </a>
  );
}
