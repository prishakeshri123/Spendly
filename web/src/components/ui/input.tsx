import { useId, type InputHTMLAttributes } from "react";
import { cn, focusRing } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Visible label; every input is labelled. */
  label: string;
  /** Error text, shown under the field and linked for screen readers. */
  error?: string;
};

export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "min-h-11 rounded-xl bg-surface px-4 text-foreground shadow-inset",
          "placeholder:text-muted",
          error && "border border-danger",
          focusRing,
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
