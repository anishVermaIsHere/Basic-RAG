import * as React from "react";
import { cn } from "./lib";
import { Slot } from "@radix-ui/react-slot";

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild,
  ...p
}: any) {
  const C = asChild ? Slot : "button";
  return (
    <C
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/30",
        variant === "default"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : variant === "outline"
            ? "border bg-background hover:bg-accent"
            : variant === "ghost"
              ? "hover:bg-accent"
              : "bg-secondary",
        size === "icon" ? "size-10" : size === "sm" ? "h-9 px-3" : "h-10 px-4",
        className,
      )}
      {...p}
    />
  );
}
export const Input = (p: any) => (
  <input
    {...p}
    className={cn(
      "h-10 w-full rounded-sm border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30",
      p.className,
    )}
  />
);
export const Textarea = (p: any) => (
  <textarea
    {...p}
    className={cn(
      "min-h-24 w-full rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30",
      p.className,
    )}
  />
);
export const Card = ({ className, ...p }: any) => (
  <div
    {...p}
    className={cn("rounded-2xl border bg-card shadow-sm", className)}
  />
);
export const Badge = ({ children, className }: any) => (
  <span
    className={cn(
      "inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
      className,
    )}
  >
    {children}
  </span>
);


export const Spinner = () => (
    <div role="status" className="flex flex-col items-center mt-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="size-8 animate-[spin_0.8s_linear_infinite] fill-primary dark:fill-primary" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z" data-original="#000000" />
        </svg>
        <span className="sr-only">Loading…</span>
    </div>
);