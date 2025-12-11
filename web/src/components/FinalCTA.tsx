import { ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/2 h-64 w-64 -translate-y-1/2 animate-pulse rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 -translate-y-1/2 animate-pulse rounded-full bg-accent/40 blur-3xl" style={{ animationDelay: "1s" }} />
      </div>

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex">
          <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <MessageSquare className="h-4 w-4" /> Ready to transform your messaging?
          </span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Start sending with certainty today
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Join hundreds of agencies and SMBs who trust EngageNinja for their WhatsApp and Email campaigns. Free tier available, no credit card required.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" data-testid="button-cta-start-free">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" data-testid="button-cta-talk-sales">
              Talk to Sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
