import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1",
    "rounded-[4px] px-2.5 py-0.5",
    "text-xs font-medium font-sans",
    "border",
    "transition-colors duration-150",
    "select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/30",
        ],
        success: [
          "bg-[#4CAF7C]/15 text-[#4CAF7C] border-[#4CAF7C]/30",
        ],
        warning: [
          "bg-[#D4A017]/15 text-[#D4A017] border-[#D4A017]/30",
        ],
        destructive: [
          "bg-[#C0392B]/15 text-[#C0392B] border-[#C0392B]/30",
        ],
        outline: [
          "bg-transparent text-[#F5F0E8] border-[#2A2A2A]",
        ],
        muted: [
          "bg-[#1E1E1E] text-[#9A9A8A] border-[#2A2A2A]",
        ],
        copper: [
          "bg-[#B87333]/15 text-[#B87333] border-[#B87333]/30",
        ],
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn("inline-block w-1.5 h-1.5 rounded-full shrink-0", {
            "bg-[#C9A84C]": variant === "default" || !variant,
            "bg-[#4CAF7C]": variant === "success",
            "bg-[#D4A017]": variant === "warning",
            "bg-[#C0392B]": variant === "destructive",
            "bg-[#9A9A8A]": variant === "outline" || variant === "muted",
            "bg-[#B87333]": variant === "copper",
          })}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// Convenience components for common operation statuses
export function OperationStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config: Record<
    string,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    new: { label: "Nueva", variant: "muted" },
    contacted: { label: "Contactado", variant: "default" },
    nda: { label: "NDA Firmado", variant: "copper" },
    negotiating: { label: "Negociando", variant: "warning" },
    closed: { label: "Cerrada", variant: "success" },
    cancelled: { label: "Cancelada", variant: "destructive" },
  };

  const { label, variant } = config[status] ?? {
    label: status,
    variant: "muted" as const,
  };

  return (
    <Badge variant={variant} dot className={className}>
      {label}
    </Badge>
  );
}

export { Badge, badgeVariants };
