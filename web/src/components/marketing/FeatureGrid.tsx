import {
  MessageSquare,
  Mail,
  Sparkles,
  RefreshCw,
  BarChart3,
  Code,
  Shield,
  Users,
  Gauge,
} from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp Campaigns",
    description: "Template approvals, delivery tracking, and read receipts in one place.",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    description: "Beautiful emails that complement your WhatsApp strategy.",
  },
  {
    icon: Sparkles,
    title: "AI Copy Generation",
    description: "Generate compelling messages with AI that understands your brand.",
  },
  {
    icon: RefreshCw,
    title: "Resend & Uplift",
    description: "Automatically resend to non-readers and prove the incremental value.",
  },
  {
    icon: BarChart3,
    title: "Advanced Dashboards",
    description: "Real-time analytics with delivery, read, and conversion tracking.",
  },
  {
    icon: Code,
    title: "API & Webhooks",
    description: "Developer-friendly APIs for custom integrations and automations.",
  },
  {
    icon: Shield,
    title: "Audit & Compliance",
    description: "Complete audit trails, consent management, and GDPR compliance.",
  },
  {
    icon: Users,
    title: "Multi-Tenant Access",
    description: "Manage multiple clients with role-based access and impersonation.",
  },
  {
    icon: Gauge,
    title: "Quotas & Controls",
    description: "Set limits, monitor usage, and control costs across all accounts.",
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Platform Features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Everything you need to run successful WhatsApp and Email campaigns at scale.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <GlassmorphicCard key={feature.title} hover>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </GlassmorphicCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
