"use client";

import {
  BookOpen,
  BookmarksSimple,
  Briefcase,
  DownloadSimple,
  FolderPlus,
  Smiley,
  SquaresFour,
  UploadSimple,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { ChromeVisibility, Folder } from "@/lib/types";

type LibrarySidebarProps = {
  folders: Folder[];
  activeFolderId: string | null;
  favoriteCounts: { all: number; byFolder: Record<string, number> };
  chrome: ChromeVisibility;
  onSelectFolder: (folderId: string | null) => void;
  onNewBookmark: () => void;
  onNewFolder: () => void;
  onImport: () => void;
  onExport: () => void;
  variant: "desktop" | "mobile";
  onCloseMobile?: () => void;
};

const folderIcons: Record<string, ReactNode> = {
  "folder-work": <Briefcase weight="light" className="h-[18px] w-[18px]" aria-hidden />,
  "folder-learn": <BookOpen weight="light" className="h-[18px] w-[18px]" aria-hidden />,
  "folder-fun": <Smiley weight="light" className="h-[18px] w-[18px]" aria-hidden />,
};

export function LibrarySidebar({
  folders,
  activeFolderId,
  favoriteCounts,
  chrome,
  onSelectFolder,
  onNewBookmark,
  onNewFolder,
  onImport,
  onExport,
  variant,
}: LibrarySidebarProps) {
  const isMobile = variant === "mobile";

  return (
    <nav
      aria-label="Library"
      className={`flex h-full flex-col gap-1 ${isMobile ? "px-1" : ""}`}
    >
      {!isMobile ? (
        <div className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[color:var(--muted)]">
          Library
        </div>
      ) : null}

      <NavItem
        selected={!activeFolderId}
        label="All"
        count={favoriteCounts.all}
        icon={<SquaresFour weight="light" className="h-[18px] w-[18px]" aria-hidden />}
        onClick={() => onSelectFolder(null)}
      />
      {folders.map((folder) => (
        <NavItem
          key={folder.id}
          selected={activeFolderId === folder.id}
          label={folder.name}
          count={favoriteCounts.byFolder[folder.id] ?? 0}
          icon={folderIcons[folder.id] ?? <Briefcase weight="light" className="h-[18px] w-[18px]" aria-hidden />}
          onClick={() => onSelectFolder(folder.id)}
        />
      ))}

      <div className="mt-auto flex flex-col gap-0.5 pt-3">
        <NavItem
          quiet
          label="New Bookmark"
          icon={<BookmarksSimple weight="light" className="h-[18px] w-[18px]" aria-hidden />}
          onClick={onNewBookmark}
        />
        <NavItem
          quiet
          label="New Folder"
          icon={<FolderPlus weight="light" className="h-[18px] w-[18px]" aria-hidden />}
          onClick={onNewFolder}
        />
        {chrome === "shown" ? (
          <>
            <NavItem
              quiet
              label="Import"
              icon={<DownloadSimple weight="light" className="h-[18px] w-[18px]" aria-hidden />}
              onClick={onImport}
            />
            <NavItem
              quiet
              label="Export"
              icon={<UploadSimple weight="light" className="h-[18px] w-[18px]" aria-hidden />}
              onClick={onExport}
            />
          </>
        ) : null}
      </div>
    </nav>
  );
}

function NavItem({
  label,
  count,
  icon,
  selected,
  quiet,
  onClick,
}: {
  label: string;
  count?: number;
  icon: ReactNode;
  selected?: boolean;
  quiet?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-selected={selected ?? false}
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-2.5 rounded-[10px] px-3 text-left text-[14px] font-medium tracking-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
        selected
          ? "bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] font-semibold text-[color:var(--ink)]"
          : quiet
            ? "text-[color:var(--muted)] hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
            : "text-[color:var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
      }`}
    >
      <span className={selected ? "text-[color:var(--accent-text)]" : "text-[color:var(--muted)]"}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {typeof count === "number" ? (
        <span className="text-[12px] font-medium tabular-nums text-[color:var(--muted)]">{count}</span>
      ) : null}
    </button>
  );
}
