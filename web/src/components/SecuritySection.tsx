import { Shield, Lock, FileCheck, Users, Clock, Database } from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption",
    description: "End-to-end encryption for all data in transit and at rest.",
  },
  {
    icon: FileCheck,
    title: "Consent Management",
    description: "Built-in opt-in/opt-out handling and preference centers.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions and audit trails for every action.",
  },
  {
    icon: Shield,
    title: "GDPR Ready",
    description: "Data processing agreements and export capabilities.",
  },
  {
    icon: Clock,
    title: "Audit Logs",
    description: "Complete history of all actions for compliance reviews.",
  },
  {
    icon: Database,
    title: "Data Retention",
    description: "Configurable retention policies and secure deletion.",
  },
];

export function SecuritySection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-4 inline-flex">
            <span className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
              <Shield className="h-4 w-4" /> Enterprise Security
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Security & Compliance
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Built with enterprise-grade security from day one. Your data is safe with us.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {securityFeatures.map((feature) => (
            <GlassmorphicCard key={feature.title}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <feature.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/security">
            <Button variant="outline" data-testid="button-security-learn-more">
              Learn More About Security
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SecuritySection;
