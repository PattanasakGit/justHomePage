"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { FavoriteInput, Folder } from "@/lib/types";
import { inferTitleFromUrl, normalizeUrl } from "@/lib/url";

export type AddLibraryMode = "bookmark" | "folder";

type AddLibrarySheetProps = {
  open: boolean;
  mode: AddLibraryMode;
  folders: Folder[];
  defaultFolderId: string | null;
  onClose: () => void;
  onSaveBookmark: (favorite: FavoriteInput) => void;
  onSaveFolder: (name: string) => void;
};

export function AddLibrarySheet({
  open,
  mode: initialMode,
  folders,
  defaultFolderId,
  onClose,
  onSaveBookmark,
  onSaveFolder,
}: AddLibrarySheetProps) {
  const [mode, setMode] = useState<AddLibraryMode>(initialMode);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId);
  const [folderName, setFolderName] = useState("");
  const normalizedUrl = useMemo(() => normalizeUrl(url), [url]);
  const inferredTitle = useMemo(() => inferTitleFromUrl(url), [url]);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setTitle("");
    setUrl("");
    setFolderId(defaultFolderId);
    setFolderName("");
  }, [defaultFolderId, initialMode, open]);

  useEffect(() => {
    if (!open || mode !== "bookmark" || !normalizedUrl) return;
    if (inferredTitle) setTitle((current) => (current.trim() ? current : inferredTitle));
  }, [inferredTitle, mode, normalizedUrl, open]);

  if (!open) return null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode === "folder") {
      const name = folderName.trim();
      if (!name) return;
      onSaveFolder(name);
      onClose();
      return;
    }
    if (!title.trim() || !normalizedUrl) return;
    onSaveBookmark({
      title: title.trim(),
      url: normalizedUrl,
      icon: "letter",
      iconUrl: null,
      folderId,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/36 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "folder" ? "New folder" : "New bookmark"}
    >
      <form
        onSubmit={onSubmit}
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[22px] bg-[#f2f2f7] sm:max-h-[86vh] sm:max-w-[420px] sm:rounded-[18px] dark:bg-[#1c1c1e]"
      >
        <header className="sticky top-0 z-[1] flex items-center justify-between bg-inherit px-5 pb-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-14 text-left text-[16px] font-medium text-[color:var(--muted)]"
          >
            Cancel
          </button>
          <h2 className="flex-1 text-center text-[17px] font-semibold tracking-tight text-[color:var(--ink)]">
            {mode === "folder" ? "New Folder" : "New Bookmark"}
          </h2>
          <button
            type="submit"
            className="min-h-11 min-w-14 text-right text-[16px] font-medium text-[color:var(--accent-text)]"
          >
            Add
          </button>
        </header>

        <div className="overflow-y-auto px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-2">
          <div
            className="mb-5 flex gap-1 rounded-[10px] bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] p-1"
            role="tablist"
            aria-label="Add type"
          >
            <SegTab active={mode === "bookmark"} onClick={() => setMode("bookmark")}>Bookmark</SegTab>
            <SegTab active={mode === "folder"} onClick={() => setMode("folder")}>Folder</SegTab>
          </div>

          {mode === "bookmark" ? (
            <>
              <Field label="Name">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Linear"
                  className="w-full min-h-12 rounded-xl border-0 bg-white px-3.5 py-3 text-[16px] text-[color:var(--ink)] outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:bg-[#2c2c2e]"
                />
              </Field>
              <Field label="URL">
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://linear.app"
                  className="w-full min-h-12 rounded-xl border-0 bg-white px-3.5 py-3 text-[16px] text-[color:var(--ink)] outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:bg-[#2c2c2e]"
                  inputMode="url"
                />
              </Field>
              <Field label="Folder">
                <select
                  value={folderId ?? ""}
                  onChange={(event) => setFolderId(event.target.value || null)}
                  aria-label="Folder"
                  className="w-full min-h-12 rounded-xl border-0 bg-white px-3.5 py-3 text-[16px] text-[color:var(--ink)] outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:bg-[#2c2c2e]"
                >
                  <option value="">None — root library</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="mt-2 px-1 text-[12px] leading-snug text-[color:var(--muted)]">
                Leave as None for a plain bookmark outside any folder.
              </p>
            </>
          ) : (
            <>
              <Field label="Folder name">
                <input
                  value={folderName}
                  onChange={(event) => setFolderName(event.target.value)}
                  placeholder="Projects"
                  className="w-full min-h-12 rounded-xl border-0 bg-white px-3.5 py-3 text-[16px] text-[color:var(--ink)] outline-none focus:shadow-[0_0_0_3px_var(--accent-soft)] dark:bg-[#2c2c2e]"
                />
              </Field>
              <p className="mt-2 px-1 text-[12px] leading-snug text-[color:var(--muted)]">
                Folders appear in the Library sidebar. Bookmarks can move into them later.
              </p>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function SegTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-9 flex-1 rounded-lg text-[14px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
        active
          ? "bg-white text-[color:var(--ink)] shadow-sm dark:bg-[#2c2c2e]"
          : "bg-transparent text-[color:var(--muted)]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-2 block px-1 text-[12px] font-medium uppercase tracking-[0.03em] text-[color:var(--muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
