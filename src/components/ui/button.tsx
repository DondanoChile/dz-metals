import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium font-sans",
    "border border-transparent",
    "transition-all duration-200 ease-in-out",
    "cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
    "disabled:pointer-events-none disabled:opacity-40",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[#C9A84C] text-black border-[#C9A84C]",
          "hover:bg-[#A07830] hover:border-[#A07830]",
          "active:bg-[#8A6420]",
          "focus-visible:ring-[#C9A84C]",
          "shadow-sm",
        ],
        outline: [
          "bg-transparent text-[#C9A84C] border-[#C9A84C]",
          "hover:bg-[#C9A84C]/10",
          "active:bg-[#C9A84C]/20",
          "focus-visible:ring-[#C9A84C]",
        ],
        ghost: [
          "bg-transparent text-[#F5F0E8] border-transparent",
          "hover:bg-[#1E1E1E] hover:text-[#C9A84C]",
          "active:bg-[#2A2A2A]",
          "focus-visible:ring-[#C9A84C]",
        ],
        destructive: [
          "bg-[#C0392B] text-white border-[#C0392B]",
          "hover:bg-[#A93226] hover:border-[#A93226]",
          "active:bg-[#922B21]",
          "focus-visible:ring-[#C0392B]",
        ],
        secondary: [
          "bg-[#1E1E1E] text-[#F5F0E8] border-[#2A2A2A]",
          "hover:bg-[#2A2A2A] hover:border-[#3A3A3A]",
          "active:bg-[#333333]",
          "focus-visible:ring-[#C9A84C]",
        ],
        link: [
          "bg-transparent text-[#C9A84C] border-transparent",
          "underline-offset-4 hover:underline",
          "focus-visible:ring-[#C9A84C]",
          "p-0 h-auto",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-[2px]",
        md: "h-10 px-4 text-sm rounded-[2px]",
        lg: "h-12 px-6 text-base rounded-[2px]",
        xl: "h-14 px-8 text-lg rounded-[2px]",
        icon: "h-10 w-10 rounded-[2px]",
        "icon-sm": "h-8 w-8 rounded-[2px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
