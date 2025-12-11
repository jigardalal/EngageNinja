import { SiWhatsapp } from "react-icons/si";
import { Mail, Database, BarChart2, Users, Webhook } from "lucide-react";

const integrations = [
  { name: "WhatsApp Cloud API", icon: SiWhatsapp, status: "available" },
  { name: "Email (SES/SMTP)", icon: Mail, status: "available" },
  { name: "Database Sync", icon: Database, status: "available" },
  { name: "Analytics", icon: BarChart2, status: "available" },
  { name: "CRM Connect", icon: Users, status: "coming" },
  { name: "Webhooks", icon: Webhook, status: "available" },
];

export function IntegrationsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Integrations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Connect with the tools you already use. More integrations coming soon.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="relative flex flex-col items-center rounded-xl border border-border/50 bg-card/50 p-6 text-center"
            >
              {integration.status === "coming" && (
                <span className="absolute -top-2 right-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Soon
                </span>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <integration.icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="mt-3 text-sm font-medium">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IntegrationsSection;
