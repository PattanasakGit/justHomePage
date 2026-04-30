import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function IconButton({ className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "grid h-11 w-11 place-items-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-lg backdrop-blur transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
