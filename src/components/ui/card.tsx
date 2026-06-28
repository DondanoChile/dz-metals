import * as React from "react";
import { cn } from "./cn";

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds a gold glow box-shadow to the card */
  goldGlow?: boolean;
  /** Use the elevated surface color (#1E1E1E) instead of default (#141414) */
  elevated?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, goldGlow, elevated, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border",
        elevated
          ? "bg-[#1E1E1E] border-[#2A2A2A]"
          : "bg-[#141414] border-[#2A2A2A]",
        goldGlow && "shadow-[0_0_20px_rgba(201,168,76,0.15)]",
        "transition-shadow duration-200",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// ─── CardHeader ───────────────────────────────────────────────────────────────

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ─── CardTitle ────────────────────────────────────────────────────────────────

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-cormorant text-xl font-semibold leading-tight text-[#F5F0E8]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ─── CardDescription ──────────────────────────────────────────────────────────

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#9A9A8A] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ─── CardContent ──────────────────────────────────────────────────────────────

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ─── CardFooter ───────────────────────────────────────────────────────────────

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      "border-t border-[#2A2A2A] mt-2",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// ─── CardDivider ──────────────────────────────────────────────────────────────

const CardDivider = ({ className }: { className?: string }) => (
  <hr className={cn("border-t border-[#2A2A2A] mx-6", className)} />
);
CardDivider.displayName = "CardDivider";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardDivider,
};
