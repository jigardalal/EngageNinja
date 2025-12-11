import { Building2, Store, Users, BarChart3, Shield, Repeat, ArrowRight, Wand2 } from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AgencySMBSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <div className="mb-4 inline-flex">
                <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Building2 className="h-4 w-4" /> For Agencies
                </span>
              </div>
              <h3 className="text-2xl font-bold">Multi-Tenant Operations</h3>
              <p className="mt-3 text-muted-foreground">
                Manage all your clients from one powerful dashboard. Switch contexts instantly, maintain separation, and prove results.
              </p>

              <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-medium">Tenant Switcher</span>
                  <span className="text-muted-foreground">3 clients</span>
                </div>
                <div className="space-y-2">
                  {["Acme Corp", "TechStart Inc", "RetailPro"].map((client, i) => (
                    <div
                      key={client}
                      className={`flex items-center justify-between rounded-lg p-2 ${
                        i === 0 ? "border border-primary/30 bg-primary/5" : "bg-muted/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{client}</span>
                      {i === 0 && <span className="text-xs text-primary">Active</span>}
                    </div>
                  ))}
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {[
                  { icon: Users, text: "Client impersonation with audit trails" },
                  { icon: BarChart3, text: "Cross-tenant ROI dashboards" },
                  { icon: Repeat, text: "Repeatable campaign templates" },
                  { icon: Shield, text: "Role-based access controls" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Link href="/solutions#agencies">
                  <Button variant="outline" data-testid="button-agency-learn-more">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/30 blur-2xl" />
            <div className="relative">
              <div className="mb-4 inline-flex">
                <span className="flex items-center gap-2 rounded-full border border-accent-foreground/20 bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                  <Store className="h-4 w-4" /> For SMBs
                </span>
              </div>
              <h3 className="text-2xl font-bold">Simple & Powerful</h3>
              <p className="mt-3 text-muted-foreground">
                No marketing team needed. Our guided workflows and AI assistance help you create professional campaigns in minutes.
              </p>

              <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="mb-3 text-sm font-medium">Guided Onboarding</div>
                <div className="space-y-2">
                  {[
                    { step: 1, text: "Connect WhatsApp", done: true },
                    { step: 2, text: "Import contacts", done: true },
                    { step: 3, text: "Create first campaign", done: false },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          item.done
                            ? "bg-green-500/10 text-green-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.done ? "✓" : item.step}
                      </div>
                      <span className={`text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {[
                  { icon: Wand2, text: "AI-powered message suggestions" },
                  { icon: BarChart3, text: "Simple, actionable dashboards" },
                  { icon: Users, text: "Easy contact management" },
                  { icon: Shield, text: "Built-in compliance checks" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-accent-foreground" />
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Link href="/solutions#smbs">
                  <Button variant="outline" data-testid="button-smb-learn-more">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </section>
  );
}

export default AgencySMBSection;
