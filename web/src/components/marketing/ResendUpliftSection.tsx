import { RefreshCw, TrendingUp, ArrowRight, Clock, Users } from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";
import { MetricCounter } from "./MetricCounter";
import { Button } from "@/components/ui/button";

export function ResendUpliftSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex">
            <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" /> Proven ROI
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Resend & Prove Uplift
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Don't let unread messages go to waste. Our intelligent resend engine automatically targets non-readers and proves the incremental value.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <GlassmorphicCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Original Campaign</h3>
              <span className="text-sm text-muted-foreground">Day 1</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">10,000</div>
                <div className="text-sm text-muted-foreground">Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">9,700</div>
                <div className="text-sm text-muted-foreground">Delivered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">7,200</div>
                <div className="text-sm text-muted-foreground">Read</div>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unread contacts</span>
                <span className="font-semibold text-amber-500">2,500</span>
              </div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="border-primary/30">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <RefreshCw className="h-4 w-4 text-primary" /> After Resend
              </h3>
              <span className="text-sm text-muted-foreground">Day 2</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">2,500</div>
                <div className="text-sm text-muted-foreground">Resent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">2,425</div>
                <div className="text-sm text-muted-foreground">Delivered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">1,820</div>
                <div className="text-sm text-muted-foreground">Read</div>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Uplift</span>
                <span className="text-xl font-bold text-green-500">+18.2%</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                1,820 additional readers from a single resend
              </p>
            </div>
          </GlassmorphicCard>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-lg font-semibold">Smart Timing</div>
              <div className="text-sm text-muted-foreground">Optimal resend windows</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-lg font-semibold">Non-Readers Only</div>
              <div className="text-sm text-muted-foreground">Never spam engaged users</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-lg font-semibold">Proven ROI</div>
              <div className="text-sm text-muted-foreground">Measure every resend</div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" data-testid="button-see-resend-demo">
            See Resend in Action <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ResendUpliftSection;
