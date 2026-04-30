"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { LETTER_ICON } from "@/components/icons/brand-icon";
import { IconPicker } from "@/components/icons/icon-picker";
import type { Favorite, FavoriteInput } from "@/lib/types";
import { inferTitleFromUrl, normalizeUrl } from "@/lib/url";

type FavoriteEditorProps = {
  favorite: Favorite | null;
  open: boolean;
  onClose: () => void;
  onSave: (favorite: FavoriteInput) => void;
};

export function FavoriteEditor({ favorite, open, onClose, onSave }: FavoriteEditorProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<string>(LETTER_ICON);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [metadataStatus, setMetadataStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const normalizedUrl = useMemo(() => normalizeUrl(url), [url]);
  const inferredTitle = useMemo(() => inferTitleFromUrl(url), [url]);

  useEffect(() => {
    if (!open) return;
    setTitle(favorite?.title ?? "");
    setUrl(favorite?.url ?? "");
    setIcon(favorite?.icon ?? LETTER_ICON);
    setIconUrl(favorite?.iconUrl ?? null);
    setMetadataStatus("idle");
  }, [favorite, open]);

  useEffect(() => {
    if (!open || favorite || !normalizedUrl) return;
    if (inferredTitle) setTitle((current) => (current.trim() ? current : inferredTitle));

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setMetadataStatus("loading");
      try {
        const response = await fetch(`/api/site-metadata?url=${encodeURIComponent(normalizedUrl)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("metadata failed");
        const metadata = (await response.json()) as { title?: string | null; iconUrl?: string | null };
        if (metadata.title && metadata.title.length < 80 && !/unicorn/i.test(metadata.title)) {
          setTitle((current) => (current.trim() ? current : metadata.title ?? current));
        }
        if (metadata.iconUrl) setIconUrl(metadata.iconUrl);
        setMetadataStatus("ready");
      } catch {
        if (!controller.signal.aborted) setMetadataStatus("error");
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [favorite, inferredTitle, normalizedUrl, open]);

  if (!open) return null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !normalizedUrl) return;
    onSave({ title: title.trim(), url: normalizedUrl, icon, iconUrl });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/25 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Favorite editor"
    >
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[28px] border border-[color:var(--border)] bg-[color:var(--popup)] p-5 shadow-panel">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{favorite ? "Edit favorite" : "Add favorite"}</h2>
          <button
            type="button"
            aria-label="Close favorite editor"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            <FiX />
          </button>
        </header>

        <label className="mt-5 block text-sm font-semibold text-[color:var(--muted)]">
          Name
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            placeholder="GitHub"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-[color:var(--muted)]">
          URL
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            placeholder="https://github.com"
          />
        </label>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--muted)]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/85 shadow-inner">
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl} alt="" className="h-6 w-6 rounded-md object-contain" />
              ) : (
                <FiRefreshCw className={metadataStatus === "loading" ? "animate-spin" : ""} />
              )}
            </span>
            <span className="truncate">
              {metadataStatus === "loading"
                ? "Reading website metadata..."
                : iconUrl
                  ? "Default logo from website metadata"
                  : "Website logo will auto-fill from URL"}
            </span>
          </div>
          {iconUrl ? (
            <button
              type="button"
              onClick={() => setIconUrl(null)}
              className="shrink-0 rounded-full px-3 py-1 font-semibold hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              Custom
            </button>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold text-[color:var(--muted)]">Custom logo</div>
          <div className="mt-2">
            <IconPicker
              value={icon}
              title={title}
              onChange={(next) => {
                setIcon(next);
                setIconUrl(null);
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 h-12 w-full rounded-2xl bg-[color:var(--accent)] text-sm font-semibold text-white shadow-soft transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        >
          Save favorite
        </button>
      </form>
    </div>
  );
}
