"use client";

import { ChangeEvent, useEffect, useRef } from "react";
import { FiBookmark, FiExternalLink } from "react-icons/fi";
import type { BookmarkConfig } from "@/lib/types";
import { normalizeUrl } from "@/lib/url";

export function WidgetBookmark({
  config,
  editing,
  onChange,
}: {
  config: Partial<BookmarkConfig>;
  editing: boolean;
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

  return (
    <a
      href={safeUrl || "#"}
      target={safeUrl ? "_blank" : undefined}
      rel={safeUrl ? "noopener noreferrer" : undefined}
      className={`flex h-full flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
        safeUrl ? "" : "pointer-events-none opacity-60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--surface-strong)] text-[color:var(--muted)]">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt="" className="h-6 w-6 rounded-md object-contain" />
          ) : (
            <FiBookmark />
          )}
        </span>
        <FiExternalLink className="ml-auto text-[color:var(--muted)]" />
      </div>
      <div className="mt-auto">
        <div className="truncate text-sm font-semibold">
          {caption || safeUrl || "Add a bookmark"}
        </div>
        {safeUrl ? (
          <div className="truncate text-[11px] text-[color:var(--muted)]">{safeUrl.replace(/^https?:\/\//, "")}</div>
        ) : null}
      </div>
    </a>
  );
}
