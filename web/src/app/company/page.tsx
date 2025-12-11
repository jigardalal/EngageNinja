import Link from "next/link";

const values = [
  {
    icon: "⚡",
    title: "Speed over complexity",
    detail: "30-minute WhatsApp activation, guardrails baked in. We believe fast execution with safety beats 6-month implementations.",
  },
  {
    icon: "🛡️",
    title: "Trust through transparency",
    detail: "Audit trails, compliance dashboards, and real-time quota visibility so every team member knows exactly what happened.",
  },
  {
    icon: "🎯",
    title: "Proof-first mentality",
    detail: "ROI dashboards, uplift snapshots, and exportable metrics mean clients see the value instantly—no guesswork.",
  },
  {
    icon: "🤝",
    title: "Agency-first design",
    detail: "Multi-tenant ops, impersonation with safe exits, and team roles built from day one because agencies are complex.",
  },
];

const milestones = [
  {
    year: "2023",
    title: "EngageNinja launched",
    detail: "Built the first WhatsApp-first engagement platform with live resend loops and instant guardrails.",
  },
  {
    year: "2024",
    title: "Multi-tenant & AI arrives",
    detail: "Agencies joined. AI copy assist, tenant switcher, and impersonation audits shipped. Resend automation became the industry standard.",
  },
  {
    year: "2025",
    title: "Plan tier system & quota enforcement",
    detail: "Five-tier pricing model, monthly usage counters, and feature guards ensure scale and fairness across all account types.",
  },
];

const teamRoles = [
  {
    title: "Engineering",
    detail: "Building the live loop, guardrails, and multi-tenant backbone that powers 10M+ WhatsApp sends monthly.",
  },
  {
    title: "Product",
    detail: "Driving agency feedback loops, resend metrics, and next-generation features like CRM adapters and inbox unification.",
  },
  {
    title: "Customer Success",
    detail: "Ensuring agencies launch confidently, SMBs hit 30-minute activation, and enterprise customers prove ROI on day one.",
  },
  {
    title: "Sales & Partnerships",
    detail: "Building relationships with agencies, SMB networks, and integration partners to expand the EngageNinja ecosystem.",
  },
];

export default function CompanyPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Company story</p>
        <h1 className="text-3xl font-semibold text-white">WhatsApp messaging as a lever for agency growth.</h1>
        <p className="text-sm text-slate-300">
          EngageNinja started with a simple observation: agencies handle 5-7 disconnected tools to run WhatsApp loops. We
          decided to build one platform that combines connection, AI, resend automation, and proof—baked into one system.
        </p>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/70 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Our mission</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Activate WhatsApp certainty, eliminate resend friction, and prove uplift instantly.
          </h2>
        </div>
        <p className="text-sm text-slate-200">
          Every day, thousands of marketers log into EngageNinja to connect WhatsApp, send campaigns in minutes, automate
          resends, and show their clients proof of impact. We're here because we believe that live guardrails, quota
          transparency, and multi-tenant oversight aren't luxuries—they're the baseline for modern engagement platforms.
        </p>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Our values</p>
          <h2 className="text-2xl font-semibold text-white">What drives us forward</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((value) => (
            <article key={value.title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-6">
              <p className="text-3xl" aria-hidden="true">
                {value.icon}
              </p>
              <p className="mt-3 text-lg font-semibold text-white">{value.title}</p>
              <p className="mt-2 text-sm text-slate-200">{value.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Timeline</p>
          <h2 className="text-2xl font-semibold text-white">From WhatsApp-first to agency scale</h2>
        </div>
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.year} className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">{milestone.year}</p>
              <p className="mt-2 text-lg font-semibold text-white">{milestone.title}</p>
              <p className="mt-1 text-sm text-slate-300">{milestone.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/70 p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">How we're organized</p>
          <h2 className="text-2xl font-semibold text-white">Teams aligned around the hero loop</h2>
          <p className="mt-2 text-sm text-slate-300">
            Every team—from engineering to customer success—focuses on one north star: ship the Connect → Send → Resend → Prove
            uplift loop in a way that's safe, fast, and audit-ready.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {teamRoles.map((role) => (
            <div key={role.title} className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <p className="text-lg font-semibold text-white">{role.title}</p>
              <p className="mt-2 text-sm text-slate-300">{role.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-600/20 to-slate-900/80 p-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Join us</p>
          <h2 className="text-2xl font-semibold text-white">We're hiring across engineering, product, and go-to-market.</h2>
          <p className="text-sm text-emerald-100">
            If you're passionate about WhatsApp, agency operations, or building transparent, audit-ready platforms, let's talk.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/careers"
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
          >
            View open roles
          </Link>
          <Link
            href="mailto:careers@engageninja.com"
            className="rounded-full border border-white/30 px-6 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Reach out directly
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-200">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Get in touch</p>
          <h3 className="text-lg font-semibold text-white">Questions about EngageNinja?</h3>
        </div>
        <p>
          Reach us at{" "}
          <Link href="mailto:hello@engageninja.com" className="text-emerald-400 hover:underline">
            hello@engageninja.com
          </Link>{" "}
          or find us on{" "}
          <Link href="https://twitter.com/engageninja" className="text-emerald-400 hover:underline">
            Twitter
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
