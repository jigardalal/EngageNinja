"use client";

import { ArrowRight, Send, CheckCircle, Eye, RefreshCw, TrendingUp } from "lucide-react";
import { MetricCounter } from "./MetricCounter";
import { GlassmorphicCard } from "./GlassmorphicCard";

const statusSteps = [
  { icon: Send, label: "Sent", value: 12394, color: "text-muted-foreground" },
  { icon: CheckCircle, label: "Delivered", value: 97, suffix: "%", color: "text-green-500" },
  { icon: Eye, label: "Read", value: 82, suffix: "%", color: "text-primary" },
  { icon: RefreshCw, label: "Resent", value: 1847, color: "text-amber-500" },
  { icon: TrendingUp, label: "Uplift", value: 18, prefix: "+", suffix: "%", color: "text-green-500" },
];

export function LiveStatusSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Real-Time Campaign Intelligence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Watch your campaigns perform in real-time. See exactly who received, read, and engaged with your messages.
          </p>
        </div>

        <div className="mt-16">
          <GlassmorphicCard className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-4 md:flex-nowrap md:gap-0">
              {statusSteps.map((step, index) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center px-6 py-4 md:px-10">
                    <step.icon className={`mb-3 h-8 w-8 ${step.color}`} />
                    <MetricCounter
                      value={step.value}
                      prefix={step.prefix}
                      suffix={step.suffix}
                      className={step.color}
                    />
                    <span className="mt-2 text-sm font-medium text-muted-foreground">
                      {step.label}
                    </span>
                  </div>
                  {index < statusSteps.length - 1 && (
                    <ArrowRight className="hidden h-6 w-6 text-muted-foreground/50 md:block" />
                  )}
                </div>
              ))}
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </section>
  );
}

export default LiveStatusSection;
