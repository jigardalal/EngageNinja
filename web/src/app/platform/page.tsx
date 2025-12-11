"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GlassmorphicCard } from "@/components/marketing/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mail,
  Sparkles,
  RefreshCw,
  BarChart3,
  Code,
  Users,
  Gauge,
  ArrowRight,
  CheckCircle,
  Send,
  Eye,
} from "lucide-react";
import Link from "next/link";

const platformFeatures = [
  {
    id: "whatsapp",
    icon: MessageSquare,
    title: "WhatsApp Campaigns",
    description: "Native WhatsApp Business API integration with template management, delivery tracking, and read receipts.",
    bullets: [
      "Automatic template approval workflow",
      "Real-time delivery and read status",
      "Rich media support (images, documents, buttons)",
      "Contact list management and segmentation",
    ],
  },
  {
    id: "email",
    icon: Mail,
    title: "Email Campaigns",
    description: "Complement your WhatsApp strategy with beautiful, responsive email campaigns.",
    bullets: [
      "Drag-and-drop email builder",
      "Pre-built templates library",
      "A/B testing capabilities",
      "Advanced analytics and tracking",
    ],
  },
  {
    id: "ai",
    icon: Sparkles,
    title: "AI Campaign Generator",
    description: "Let AI craft compelling messages that match your brand voice and campaign goals.",
    bullets: [
      "Generate multiple message variations",
      "Optimize for engagement and deliverability",
      "Learn from past campaign performance",
      "Support for multiple languages",
    ],
  },
  {
    id: "resend",
    icon: RefreshCw,
    title: "Resend Engine",
    description: "Automatically target non-readers with intelligent timing and guardrails.",
    bullets: [
      "Smart timing optimization",
      "Non-readers only targeting",
      "Frequency caps and guardrails",
      "Incremental uplift measurement",
    ],
  },
  {
    id: "dashboards",
    icon: BarChart3,
    title: "Dashboards & Reporting",
    description: "Real-time analytics with delivery, read, and conversion tracking across all campaigns.",
    bullets: [
      "Campaign performance metrics",
      "Uplift visualization",
      "Tenant-level KPIs",
      "Export and scheduling",
    ],
  },
  {
    id: "api",
    icon: Code,
    title: "API & Webhooks",
    description: "Developer-friendly REST API for custom integrations and automation workflows.",
    bullets: [
      "RESTful API with full documentation",
      "Webhook events for real-time updates",
      "Tenant-scoped API keys",
      "Rate limiting and usage monitoring",
    ],
  },
  {
    id: "multitenant",
    icon: Users,
    title: "Multi-Tenant Operations",
    description: "Manage multiple client accounts with impersonation, audit trails, and cross-tenant insights.",
    bullets: [
      "Client impersonation with audit logs",
      "Cross-tenant reporting dashboards",
      "Role-based access controls",
      "Repeatable campaign templates",
    ],
  },
  {
    id: "quotas",
    icon: Gauge,
    title: "Quotas & Controls",
    description: "Set limits, monitor usage, and control costs across all accounts and campaigns.",
    bullets: [
      "Per-tier message caps",
      "Usage alerts and notifications",
      "Cost tracking and projections",
      "Admin override controls",
    ],
  },
];

export default function Platform() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-accent/30 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              One Platform for{" "}
              <span className="text-primary">WhatsApp, Email, AI & Resend</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Everything you need to run successful customer engagement campaigns at scale.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" data-testid="button-platform-start">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" data-testid="button-platform-demo">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {platformFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className={`flex flex-col gap-12 py-16 lg:flex-row lg:items-center lg:gap-16 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                } ${index > 0 ? "border-t border-border/50" : ""}`}
              >
                <div className="flex-1">
                  <div className="mb-4 inline-flex">
                    <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      <feature.icon className="h-4 w-4" />
                      {feature.title}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">{feature.title}</h2>
                  <p className="mt-4 text-lg text-muted-foreground">{feature.description}</p>
                  <ul className="mt-6 space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <GlassmorphicCard className="aspect-video">
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <feature.icon className="mx-auto h-16 w-16 text-primary/30" />
                        <p className="mt-4 text-sm text-muted-foreground">
                          {feature.title} visualization
                        </p>
                      </div>
                    </div>
                  </GlassmorphicCard>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join hundreds of businesses using EngageNinja for their customer engagement.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" data-testid="button-platform-cta">
                  Start Free Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
