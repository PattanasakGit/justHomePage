"use client";

import { FormEvent, useEffect, useState } from "react";
import { FiFolder, FiX } from "react-icons/fi";
import { IconPicker } from "@/components/icons/icon-picker";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { FavoriteFolder, FavoriteFolderInput } from "@/lib/types";

type FavoriteFolderEditorProps = {
  folder: FavoriteFolder | null;
  open: boolean;
  onClose: () => void;
  onSave: (folder: FavoriteFolderInput) => void;
};

export function FavoriteFolderEditor({ folder, open, onClose, onSave }: FavoriteFolderEditorProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("fi-folder");
  const isMobile = useMediaQuery("(max-width: 639.98px)");

  useEffect(() => {
    if (!open) return;
    setTitle(folder?.title ?? "");
    setIcon(folder?.icon ?? "fi-folder");
  }, [folder, open]);

  if (!open) return null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), icon, iconUrl: null });
    onClose();
  }

  const containerClass = isMobile
    ? "fixed inset-0 z-[70] bg-[color:var(--popup)] backdrop-blur-sm"
    : "fixed inset-0 z-[70] grid place-items-center bg-black/25 p-4 backdrop-blur-sm";
  const formClass = isMobile
    ? "flex h-[100svh] w-full flex-col bg-[color:var(--popup)]"
    : "w-full max-w-md rounded-[28px] border border-[color:var(--border)] bg-[color:var(--popup)] p-5 shadow-panel";

  return (
    <div className={containerClass} role="dialog" aria-modal="true" aria-label="Folder editor">
      <form onSubmit={onSubmit} className={formClass}>
        <header
          className={
            isMobile
              ? "sticky top-0 z-10 flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--popup)] px-4 py-3"
              : "flex items-center justify-between"
          }
        >
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
            <FiFolder />
            {folder ? "Edit folder" : "Add folder"}
          </h2>
          <button
            type="button"
            aria-label="Close folder editor"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            <FiX />
          </button>
        </header>

        <div className={isMobile ? "min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2" : ""}>
          <label className="mt-5 block text-sm font-semibold text-[color:var(--muted)]">
            Folder name
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              placeholder="Work"
            />
          </label>

          <div className="mt-5">
            <div className="text-sm font-semibold text-[color:var(--muted)]">Folder icon</div>
            <div className="mt-2">
              <IconPicker value={icon} title={title || "Folder"} onChange={setIcon} mobileScrollCap={isMobile} />
            </div>
          </div>
        </div>

        <div
          data-sticky-footer="true"
          className={
            isMobile
              ? "sticky bottom-0 border-t border-[color:var(--border)] bg-[color:var(--popup)] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]"
              : ""
          }
        >
          <button
            type="submit"
            className={`${isMobile ? "" : "mt-6"} h-12 w-full rounded-2xl bg-[color:var(--accent)] text-sm font-semibold text-white shadow-soft transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]`}
          >
            Save folder
          </button>
        </div>
      </form>
    </div>
  );
}
