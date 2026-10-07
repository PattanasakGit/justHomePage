"use client";

import { FormEvent, useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import type { Folder } from "@/lib/types";

type FolderManagerProps = {
  open: boolean;
  folders: Folder[];
  onClose: () => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

export function FolderManager({ open, folders, onClose, onCreate, onRename, onDelete }: FolderManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!open) return;
    setNewName("");
    setEditingId(null);
    setEditName("");
  }, [open]);

  if (!open) return null;

  function onCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setNewName("");
  }

  function startRename(folder: Folder) {
    setEditingId(folder.id);
    setEditName(folder.name);
  }

  function commitRename() {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (trimmed) onRename(editingId, trimmed);
    setEditingId(null);
    setEditName("");
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/25 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Manage folders"
    >
      <div className="w-full max-w-md rounded-[28px] border border-[color:var(--border)] bg-[color:var(--popup)] p-5 shadow-panel">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Folders</h2>
          <button
            type="button"
            aria-label="Close folder manager"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            <FiX />
          </button>
        </header>

        <form onSubmit={onCreateSubmit} className="mt-5 flex gap-2">
          <label className="sr-only" htmlFor="new-folder-name">
            New folder name
          </label>
          <input
            id="new-folder-name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="New folder name"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-2xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            Create
          </button>
        </form>

        <ul className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {folders.length === 0 ? (
            <li className="rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--muted)]">
              No folders yet. Create one above.
            </li>
          ) : (
            folders.map((folder) => (
              <li
                key={folder.id}
                className="flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
              >
                {editingId === folder.id ? (
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitRename();
                      }
                      if (event.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    autoFocus
                    aria-label={`Rename ${folder.name}`}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--popup)] px-3 outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate px-1 text-[15px] font-medium">{folder.name}</span>
                )}
                {editingId === folder.id ? (
                  <button
                    type="button"
                    onClick={commitRename}
                    className="inline-flex h-11 items-center rounded-full bg-[color:var(--accent)] px-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label={`Rename ${folder.name}`}
                    onClick={() => startRename(folder)}
                    className="grid h-11 w-11 place-items-center rounded-full text-[color:var(--accent-text)] hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  >
                    <FiEdit2 />
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Delete ${folder.name}`}
                  onClick={() => onDelete(folder.id)}
                  className="grid h-11 w-11 place-items-center rounded-full text-[#b42318] hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                >
                  <FiTrash2 />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
