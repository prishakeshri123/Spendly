import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  max: number;
  /** Accessible name, e.g. "Groceries budget". */
  label: string;
  /** Status color for the fill. Always pair it with status text next to the bar. */
  tone?: "accent" | "success" | "warning" | "danger";
};

const tones = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  max,
  label,
  tone = "accent",
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="h-3 w-full overflow-hidden rounded-full bg-surface shadow-inset"
    >
      <div
        className={cn("h-full rounded-full", tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
