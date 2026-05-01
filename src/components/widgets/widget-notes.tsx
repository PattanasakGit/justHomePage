"use client";

import { useState } from "react";
import type { WidgetSize } from "@/lib/types";

const heightBySize: Record<WidgetSize, string> = {
  compact: "min-h-[88px]",
  regular: "min-h-[110px]",
  wide: "min-h-[110px]",
  tall: "min-h-[210px]",
  hero: "min-h-[260px]",
};

export function WidgetNotes({
  body,
  size = "tall",
  onChange,
}: {
  body: string;
  size?: WidgetSize;
  onChange: (next: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-full transition ${
          focused ? "bg-[color:var(--accent)]" : "bg-[color:var(--accent-soft)]"
        }`}
      />
      <textarea
        aria-label="Note"
        value={body}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Drop a thought. Autosaves locally."
        className={`${heightBySize[size]} mt-2 w-full flex-1 resize-none bg-transparent p-1 text-sm leading-6 text-[color:var(--ink)] placeholder:text-[color:var(--muted)] outline-none`}
      />
    </div>
  );
}
