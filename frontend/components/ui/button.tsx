import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--abyss)] disabled:pointer-events-none disabled:opacity-45 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--chart-cyan)] text-[var(--abyss)] hover:bg-[color-mix(in_srgb,var(--chart-cyan)_86%,var(--foam))]",
        outline: "border border-[var(--line)] bg-transparent text-[var(--foam)] hover:border-[var(--chart-cyan)] hover:bg-[var(--cyan-wash)]",
        ghost: "text-[var(--muted)] hover:bg-[var(--panel-raised)] hover:text-[var(--foam)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
