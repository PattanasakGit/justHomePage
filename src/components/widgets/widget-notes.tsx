"use client";

import type { UIScale } from "@/lib/types";

const textareaScale: Record<UIScale, string> = {
  compact: "h-[74px]",
  cozy: "h-[92px]",
  large: "h-[116px]",
};

export function WidgetNotes({
  body,
  scale,
  onChange,
}: {
  body: string;
  scale: UIScale;
  onChange: (next: string) => void;
}) {
  return (
    <textarea
      aria-label="Note"
      value={body}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Drop thoughts here. It autosaves locally."
      className={`${textareaScale[scale]} w-full resize-none rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-sm leading-6 text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]`}
    />
  );
}
