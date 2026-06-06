"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "orange" | "gray" | "success" | "warning" | "error" | "info";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  green:   "bg-green-100 text-green-800",
  orange:  "bg-orange-100 text-orange-900",
  gray:    "bg-brand-light text-brand-muted",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error:   "bg-red-100 text-red-800",
  info:    "bg-blue-100 text-blue-800",
};

export function Badge({ children, variant = "gray" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-btn text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
