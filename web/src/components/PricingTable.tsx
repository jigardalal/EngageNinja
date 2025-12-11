import { useState } from "react";
import { Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GlassmorphicCard } from "./GlassmorphicCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// todo: remove mock functionality
const pricingTiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Get started with WhatsApp marketing",
    features: {
      channels: "WhatsApp only",
      messages: "1,000/month",
      users: "1 user",
      dashboard: "Basic",
      resend: false,
      aiCampaigns: false,
      api: false,
      multiTenant: false,
      support: "Community",
    },
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 24,
    description: "For small teams getting started",
    features: {
      channels: "WhatsApp only",
      messages: "10,000/month",
      users: "3 users",
      dashboard: "Basic",
      resend: "Simple",
      aiCampaigns: false,
      api: false,
      multiTenant: false,
      support: "Email",
    },
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    monthlyPrice: 79,
    yearlyPrice: 66,
    description: "For growing businesses",
    features: {
      channels: "WhatsApp + Email",
      messages: "100,000/month",
      users: "10 users",
      dashboard: "Advanced",
      resend: "Advanced + Uplift",
      aiCampaigns: true,
      api: true,
      multiTenant: false,
      support: "Priority",
    },
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    monthlyPrice: 199,
    yearlyPrice: 166,
    description: "Multi-tenant for agencies",
    features: {
      channels: "WhatsApp + Email",
      messages: "500,000/month",
      users: "Unlimited",
      dashboard: "Cross-tenant",
      resend: "Advanced + Uplift",
      aiCampaigns: true,
      api: true,
      multiTenant: true,
      support: "Priority",
    },
    cta: "Contact Sales",
    highlighted: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: null,
    yearlyPrice: null,
    description: "Custom solutions for large orgs",
    features: {
      channels: "All channels",
      messages: "Custom",
      users: "Unlimited",
      dashboard: "Custom",
      resend: "Advanced + Uplift",
      aiCampaigns: true,
      api: true,
      multiTenant: true,
      support: "Dedicated CSM",
    },
    cta: "Contact Sales",
    highlighted: false,
  },
];

const featureLabels = {
  channels: "Channels",
  messages: "Messages",
  users: "Team Members",
  dashboard: "Dashboard",
  resend: "Resend & Uplift",
  aiCampaigns: "AI Campaigns",
  api: "API & Webhooks",
  multiTenant: "Multi-Tenant",
  support: "Support",
};

export function PricingTable() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          data-testid="switch-billing-period"
        />
        <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
          <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
            Save 17%
          </span>
        </span>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
          {pricingTiers.map((tier) => (
            <GlassmorphicCard
              key={tier.name}
              className={`w-64 flex-shrink-0 lg:w-auto ${
                tier.highlighted ? "border-primary/50 ring-2 ring-primary/20" : ""
              }`}
            >
              {tier.highlighted && (
                <div className="mb-4 inline-flex">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <div className="mt-2 h-16">
                {tier.monthlyPrice !== null ? (
                  <>
                    <span className="text-4xl font-bold transition-all duration-300">
                      ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/mo</span>
                    {isYearly && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Billed annually
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold">Custom</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

              <Button
                className="mt-6 w-full"
                variant={tier.highlighted ? "default" : "outline"}
                data-testid={`button-tier-${tier.name.toLowerCase()}`}
              >
                {tier.cta}
              </Button>

              <div className="mt-6 space-y-3 border-t border-border/50 pt-6">
                {Object.entries(tier.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      {featureLabels[key as keyof typeof featureLabels]}
                      {key === "resend" && (
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Automatically resend to non-readers
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                    <span className="font-medium">
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50" />
                        )
                      ) : (
                        value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PricingTable;
