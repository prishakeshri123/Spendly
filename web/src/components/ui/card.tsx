import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** "inset" is for selected or recessed areas; "flat" for minor items. */
  variant?: "raised" | "inset" | "flat";
};

const variants = {
  raised: "shadow-raised",
  inset: "shadow-inset",
  flat: "shadow-flat border border-divider",
};

export function Card({ variant = "raised", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl bg-surface p-5", variants[variant], className)}
      {...props}
    />
  );
}
