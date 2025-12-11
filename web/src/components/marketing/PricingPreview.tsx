import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassmorphicCard } from "./GlassmorphicCard";
import Link from "next/link";

// todo: remove mock functionality
const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with WhatsApp marketing",
    features: ["1,000 messages/month", "1 user", "Basic dashboard"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$79",
    description: "For growing businesses",
    features: ["100K messages/month", "AI campaigns", "Resend & uplift"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$199",
    description: "Multi-tenant for agencies",
    features: ["Multi-client ops", "Impersonation", "Cross-tenant ROI"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function PricingPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <GlassmorphicCard
              key={tier.name}
              className={tier.highlighted ? "border-primary/50 ring-2 ring-primary/20" : ""}
            >
              {tier.highlighted && (
                <div className="mb-4 inline-flex">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price !== "$0" && <span className="text-muted-foreground">/mo</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={tier.highlighted ? "default" : "outline"}
                data-testid={`button-pricing-${tier.name.toLowerCase()}`}
              >
                {tier.cta}
              </Button>
            </GlassmorphicCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/pricing" className="inline-flex items-center text-sm font-medium text-primary hover:underline" data-testid="link-view-full-pricing">
            View full pricing & compare all features <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PricingPreview;
