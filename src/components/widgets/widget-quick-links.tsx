"use client";

import { FiExternalLink } from "react-icons/fi";
import type { WidgetSize } from "@/lib/types";
import { normalizeUrl } from "@/lib/url";

export function WidgetQuickLinks({ value, size = "regular" }: { value: string; size?: WidgetSize }) {
  const links = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (links.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="grid h-full place-items-center rounded-2xl border border-dashed border-[color:var(--border)] p-3 text-center text-xs text-[color:var(--muted)]">
          Add links in settings — they appear as launch pills.
        </div>
      </div>
    );
  }

  // `wide` → 2-col grid, scrolls past 8 visible. `regular` → 1-col list, scrolls past 4 visible.
  const gridCols = size === "wide" ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ul
        data-testid="quick-links-scroll"
        className={`grid ${gridCols} min-h-0 flex-1 gap-2 overflow-y-auto pr-1 [mask-image:linear-gradient(to_bottom,black_calc(100%-16px),transparent)]`}
      >
        {links.map((link, index) => {
          const safe = normalizeUrl(link);
          const hue = (index * 32) % 360;
          return (
            <li key={`${link}-${index}`}>
              <a
                href={safe || "#"}
                target={safe ? "_blank" : undefined}
                rel={safe ? "noopener noreferrer" : undefined}
                className="group flex h-10 items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-left text-sm font-medium text-[color:var(--ink)] transition hover:-translate-y-px hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: `hsl(from var(--accent) calc(h + ${hue}) s l)` }}
                />
                <span className="truncate">{link}</span>
                <FiExternalLink className="ml-auto opacity-0 transition group-hover:opacity-100 group-focus:opacity-100 text-[color:var(--muted)]" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
