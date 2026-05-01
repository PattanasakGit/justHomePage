"use client";

export function WidgetQuickLinks({ value }: { value: string }) {
  const links = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return (
    <div className="grid grid-cols-2 gap-2">
      {links.map((link) => (
        <button
          key={link}
          type="button"
          className="min-h-11 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-left text-sm font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        >
          {link}
        </button>
      ))}
    </div>
  );
}
