import { MessageSquare, Users, Sparkles } from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";

const steps = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Connect WhatsApp",
    description: "Link your WhatsApp Business account in minutes. We handle template approvals and API setup automatically.",
  },
  {
    step: "02",
    icon: Users,
    title: "Import Contacts & Generate AI Copy",
    description: "Upload your contacts and let AI craft compelling messages tailored to your audience and campaign goals.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Send, Resend & Prove Uplift",
    description: "Launch campaigns, automatically resend to non-readers, and measure the exact uplift from every resend.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Get started in three simple steps. No technical expertise required.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <GlassmorphicCard key={item.step} hover className="relative">
              <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {item.step}
              </span>
              <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-muted-foreground">{item.description}</p>
            </GlassmorphicCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
