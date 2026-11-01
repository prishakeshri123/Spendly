import type { ButtonHTMLAttributes } from "react";
import { cn, focusRing } from "@/lib/cn";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function Chip({
  selected = false,
  type = "button",
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-surface px-4 text-sm",
        selected
          ? "font-semibold shadow-inset"
          : "border border-divider shadow-flat",
        focusRing,
        className,
      )}
      {...props}
    >
      {/* Checkmark so the selected state is not shown by the inset shadow alone. */}
      {selected && <span aria-hidden="true">✓</span>}
      {children}
    </button>
  );
}
