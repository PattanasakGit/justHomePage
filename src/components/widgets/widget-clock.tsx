"use client";

import { useEffect, useState } from "react";
import { formatClock } from "@/lib/date";
import type { UIScale } from "@/lib/types";

const clockScaleClass: Record<UIScale, string> = {
  compact: "text-4xl",
  cozy: "text-5xl",
  large: "text-6xl",
};

export function WidgetClock({ scale }: { scale: UIScale }) {
  const [now, setNow] = useState(() => new Date());
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div>
      <div className={`${clockScaleClass[scale]} font-semibold leading-none tracking-tight`}>{formatClock(now)}</div>
      <div className="mt-3 text-sm text-[color:var(--muted)]">{timezone}</div>
    </div>
  );
}
