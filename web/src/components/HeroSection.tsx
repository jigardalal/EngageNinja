import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Send, CheckCircle, Eye, RefreshCw, TrendingUp } from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";
import { IconBadge } from "./IconBadge";

const dashboardImage = "/assets/generated_images/whatsapp_campaign_dashboard_mockup.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-accent/30 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 animate-pulse rounded-full bg-chart-2/20 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                WhatsApp-First Customer Engagement
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Send with certainty.{" "}
              <span className="text-primary">Resend with intelligence.</span>{" "}
              Prove uplift.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              AI-powered WhatsApp & Email marketing with built-in resend intelligence and real ROI visibility. Built for agencies and SMBs who demand results.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" data-testid="button-hero-start-free">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" data-testid="button-hero-book-demo">
                  <Play className="mr-2 h-4 w-4" /> Book a Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> 1,000 free messages/month
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <GlassmorphicCard className="w-full max-w-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Live Campaign Status</h3>
                <span className="flex items-center gap-1.5 text-xs text-green-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Live
                </span>
              </div>
              <img
                src={dashboardImage}
                alt="WhatsApp Campaign Dashboard"
                className="mb-4 rounded-lg border border-border/50"
              />
              <div className="flex flex-wrap gap-2">
                <IconBadge icon={Send} label="Sent" value="12,394" />
                <IconBadge icon={CheckCircle} label="Delivered" value="97%" variant="success" />
                <IconBadge icon={Eye} label="Read" value="82%" variant="primary" />
                <IconBadge icon={RefreshCw} label="Resent" value="1,847" variant="warning" />
                <IconBadge icon={TrendingUp} label="Uplift" value="+18%" variant="success" />
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
