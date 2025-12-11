"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GlassmorphicCard } from "@/components/marketing/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ShoppingCart,
  GraduationCap,
  Home,
  Heart,
  Rocket,
  ArrowRight,
  CheckCircle,
  X,
} from "lucide-react";
import Link from "next/link";

// todo: remove mock functionality
const solutions = [
  {
    id: "agencies",
    icon: Building2,
    title: "For Agencies",
    description: "Manage all your clients from one powerful dashboard with multi-tenant operations.",
    useCases: [
      "Client campaign management at scale",
      "Cross-tenant ROI reporting",
      "White-label options available",
    ],
    before: ["Juggling multiple tools per client", "Manual reporting across accounts", "No unified analytics"],
    after: ["Single dashboard for all clients", "Automated cross-client reports", "Proven ROI per campaign"],
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    title: "For E-commerce",
    description: "Drive sales with abandoned cart reminders, order updates, and promotional campaigns.",
    useCases: [
      "Abandoned cart recovery via WhatsApp",
      "Order confirmation and shipping updates",
      "Flash sale announcements",
    ],
    before: ["Low email open rates", "Missed cart recovery opportunities", "Generic promotions"],
    after: ["90%+ WhatsApp open rates", "25% cart recovery rate", "Personalized AI-driven offers"],
  },
  {
    id: "education",
    icon: GraduationCap,
    title: "For Education",
    description: "Engage students and parents with course updates, reminders, and announcements.",
    useCases: [
      "Class schedule reminders",
      "Fee payment notifications",
      "Event and exam announcements",
    ],
    before: ["Low parent engagement", "Missed fee payments", "Communication gaps"],
    after: ["Direct WhatsApp reach", "Automated reminders", "Higher engagement rates"],
  },
  {
    id: "realestate",
    icon: Home,
    title: "For Real Estate",
    description: "Nurture leads with property updates, viewing reminders, and personalized listings.",
    useCases: [
      "New listing notifications",
      "Viewing appointment reminders",
      "Document collection campaigns",
    ],
    before: ["Cold leads go stale", "Missed viewing appointments", "Manual follow-ups"],
    after: ["Warm leads via WhatsApp", "Automated reminders", "AI-powered nurturing"],
  },
  {
    id: "healthcare",
    icon: Heart,
    title: "For Healthcare",
    description: "Send appointment reminders, health tips, and follow-up care instructions.",
    useCases: [
      "Appointment reminders and confirmations",
      "Prescription refill notifications",
      "Health tips and wellness campaigns",
    ],
    before: ["High no-show rates", "Manual reminder calls", "Limited patient engagement"],
    after: ["Reduced no-shows by 40%", "Automated reminders", "Better patient outcomes"],
  },
  {
    id: "saas",
    icon: Rocket,
    title: "For SaaS & Startups",
    description: "Onboard users, announce features, and reduce churn with targeted messaging.",
    useCases: [
      "User onboarding sequences",
      "Feature announcement campaigns",
      "Churn prevention outreach",
    ],
    before: ["Low onboarding completion", "Feature announcements ignored", "Silent churn"],
    after: ["Higher activation rates", "Instant feature awareness", "Proactive retention"],
  },
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Solutions for Every Industry
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              See how businesses like yours use EngageNinja to drive results.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {solutions.map((solution) => (
                <GlassmorphicCard key={solution.id} hover className="flex flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <solution.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{solution.title}</h3>
                  <p className="mt-2 text-muted-foreground">{solution.description}</p>

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold">Key Use Cases</h4>
                    <ul className="mt-2 space-y-2">
                      {solution.useCases.map((useCase) => (
                        <li key={useCase} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-destructive/5 p-3">
                      <h5 className="text-xs font-semibold text-destructive">Before</h5>
                      <ul className="mt-2 space-y-1">
                        {solution.before.map((item) => (
                          <li key={item} className="flex items-start gap-1 text-xs text-muted-foreground">
                            <X className="mt-0.5 h-3 w-3 flex-shrink-0 text-destructive" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-green-500/5 p-3">
                      <h5 className="text-xs font-semibold text-green-600 dark:text-green-400">After</h5>
                      <ul className="mt-2 space-y-1">
                        {solution.after.map((item) => (
                          <li key={item} className="flex items-start gap-1 text-xs text-muted-foreground">
                            <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <Link href={`/solutions/${solution.id}`}>
                      <Button variant="outline" className="w-full" data-testid={`button-solution-${solution.id}`}>
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Don't see your industry?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              EngageNinja works for any business that communicates with customers. Let's talk about your specific needs.
            </p>
            <div className="mt-8">
              <Link href="/contact">
                <Button size="lg" data-testid="button-solutions-contact">
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
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
