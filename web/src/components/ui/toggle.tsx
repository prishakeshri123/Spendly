"use client";

import { cn, focusRing } from "@/lib/cn";

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-8 w-14 rounded-full bg-surface shadow-inset disabled:opacity-60",
          focusRing,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 left-1 size-6 rounded-full shadow-raised transition-transform",
            checked ? "translate-x-6 bg-accent" : "bg-surface",
          )}
        />
      </button>
      {/* The state is also written out, so it never relies on shadow or color alone. */}
      <span className="text-sm">
        {label}: {checked ? "On" : "Off"}
      </span>
    </div>
  );
}
