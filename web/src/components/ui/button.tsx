import type { ButtonHTMLAttributes } from "react";
import { cn, focusRing } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** "primary" is a solid accent fill, used for actions like "Add transaction". */
  variant?: "primary" | "secondary";
};

const variants = {
  primary: "bg-accent text-accent-foreground shadow-raised",
  secondary: "bg-surface text-foreground shadow-raised",
};

export function Button({
  variant = "secondary",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold",
        "active:shadow-inset disabled:cursor-not-allowed disabled:opacity-60",
        focusRing,
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
