import { Lightbulb, FileText, Eye, Sparkles, ArrowRight } from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";
import { Button } from "@/components/ui/button";

export function AICampaignSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex">
              <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" /> AI-Powered
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Campaign Builder
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Generate compelling WhatsApp and Email campaigns in seconds. Our AI understands your brand voice and crafts messages that convert.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Generate multiple message variations instantly",
                "Optimize for deliverability and engagement",
                "A/B test different approaches automatically",
                "Learn from past campaign performance",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <ArrowRight className="h-3 w-3 text-primary" />
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button data-testid="button-try-ai-builder">
                Try AI Builder <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <GlassmorphicCard>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="h-4 w-4" /> Your Prompt
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/50 p-4">
                <p className="text-sm">
                  "Create a WhatsApp message for our holiday sale. 30% off all items. Urgency needed. Friendly tone."
                </p>
              </div>

              <div className="my-6 flex items-center justify-center">
                <div className="h-px flex-1 bg-border/50" />
                <Sparkles className="mx-4 h-5 w-5 animate-pulse text-primary" />
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-4 w-4 text-primary" />
                  <div className="flex-1 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-medium">Variation A</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Hey! Our biggest sale of the year is HERE! Get 30% off everything - but hurry, it ends soon!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm font-medium">Variation B</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Don't miss out! 30% off EVERYTHING for the holidays. Limited time only - shop now!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" /> Preview in device mockup
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AICampaignSection;
