"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GlassmorphicCard } from "@/components/marketing/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  FileCheck,
  Users,
  Clock,
  Database,
  Server,
  Key,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";

const securityFeatures = [
  {
    icon: Lock,
    title: "Data Encryption",
    description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Your messages and customer data are always protected.",
  },
  {
    icon: Server,
    title: "Infrastructure Security",
    description: "Hosted on SOC 2 Type II certified infrastructure with regular penetration testing and vulnerability assessments.",
  },
  {
    icon: Key,
    title: "Access Controls",
    description: "Role-based access control (RBAC) with granular permissions. SSO integration available for Enterprise customers.",
  },
  {
    icon: Clock,
    title: "Audit Logs",
    description: "Complete audit trail of all actions taken in your account. Export logs for compliance reviews and internal investigations.",
  },
  {
    icon: FileCheck,
    title: "Consent Management",
    description: "Built-in opt-in/opt-out handling, preference centers, and consent tracking to ensure compliant messaging.",
  },
  {
    icon: Users,
    title: "Impersonation Safety",
    description: "When agency users impersonate client accounts, all actions are logged with the original user identity preserved.",
  },
  {
    icon: Eye,
    title: "Data Privacy",
    description: "GDPR-ready with data processing agreements, right to access, and right to erasure support.",
  },
  {
    icon: Trash2,
    title: "Data Retention",
    description: "Configurable retention policies. Secure deletion with audit trail when data is removed.",
  },
  {
    icon: Database,
    title: "Backups",
    description: "Automated daily backups with point-in-time recovery. Data redundancy across multiple availability zones.",
  },
];

const certifications = [
  { name: "SOC 2 Type II", status: "In Progress", description: "Security audit in progress" },
  { name: "GDPR", status: "Compliant", description: "EU data protection ready" },
  { name: "ISO 27001", status: "Planned", description: "Information security management" },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex">
              <span className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                <Shield className="h-4 w-4" /> Enterprise-Grade Security
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Security & Compliance
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Your data security is our top priority. Built with enterprise-grade protection from day one.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold">Certifications & Compliance</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {certifications.map((cert) => (
                <GlassmorphicCard key={cert.name} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{cert.name}</h3>
                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      cert.status === "Compliant"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : cert.status === "In Progress"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cert.status}
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground">{cert.description}</p>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Have Security Questions?</h2>
            <p className="mt-4 text-muted-foreground">
              Our security team is here to help. Request our security documentation or schedule a call.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button data-testid="button-request-security-docs">
                Request Security Docs
              </Button>
              <Link href="/contact">
                <Button variant="outline" data-testid="button-security-contact">
                  Contact Security Team
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
