"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface MetricCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  label?: string;
}

export function MetricCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2000,
  className,
  label,
}: MetricCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * value));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <div className="text-4xl font-bold tabular-nums tracking-tight">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      {label && <div className="mt-1 text-sm text-muted-foreground">{label}</div>}
    </div>
  );
}

export default MetricCounter;
