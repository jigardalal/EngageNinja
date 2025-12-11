import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassmorphicCard({ children, className, hover = false }: GlassmorphicCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-xl",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export default GlassmorphicCard;
