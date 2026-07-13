import { Slot } from "@radix-ui/react-slot";
import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant = "primary", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex min-h-10 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-green-700 disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-neutral-950 text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] hover:bg-black",
          variant === "secondary" &&
            "border border-neutral-200 bg-white text-neutral-950 hover:border-neutral-300 hover:bg-neutral-50",
          variant === "ghost" && "bg-transparent text-neutral-700 hover:bg-neutral-100",
          variant === "danger" && "bg-red-900 text-white hover:bg-red-950",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
