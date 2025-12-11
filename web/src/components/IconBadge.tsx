import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconBadgeProps {
  icon: LucideIcon;
  label: string;
  value?: string | number;
  variant?: "default" | "success" | "warning" | "primary";
  className?: string;
}

const variantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  primary: "bg-primary/10 text-primary",
};

export function IconBadge({ icon: Icon, label, value, variant = "default", className }: IconBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", variantStyles[variant], className)}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
      {value !== undefined && (
        <span className="text-sm font-bold tabular-nums">{value}</span>
      )}
    </div>
  );
}

export default IconBadge;
