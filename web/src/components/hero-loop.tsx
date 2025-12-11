import Image from "next/image";
import Link from "next/link";

export type HeroLoopStep = {
  icon: string;
  title: string;
  body: string;
  footer: string;
};

export type TimelineStep = {
  icon: string;
  title: string;
  detail: string;
};

type Props = {
  steps: HeroLoopStep[];
  timeline: TimelineStep[];
};

export default function HeroLoopComponent({ steps, timeline }: Props) {
  return (
    <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/30 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-white/10">
        <Image
          src="/feature-art.jpg"
          alt="Abstract illustration of a connected engagement experience"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-950/70 p-6 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">Hero loop, front and center</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">
            Connect → Send → Resend → Prove uplift
          </h3>
          <p className="mt-3 text-sm text-slate-200">
            Guardrails stay visible, delivery ticks refresh live, and the UI mirrors the platform so prospects instantly
            understand the loop.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {timeline.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-slate-200"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">{step.title}</p>
                <p className="text-base text-white">{step.icon}</p>
                <p className="text-xs text-slate-400">{step.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            <Link href="/resources#resend" className="hover:text-white">
              View the timeline
            </Link>
            <span aria-hidden="true">↗</span>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        {steps.map((step) => (
          <article
            key={step.title}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-5 text-sm text-slate-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl" aria-hidden="true">
                {step.icon}
              </span>
              <span className="text-xs uppercase tracking-[0.4em] text-emerald-300">{step.title}</span>
            </div>
            <p className="mt-3 text-base text-white">{step.body}</p>
            <p className="mt-2 text-xs text-slate-400">{step.footer}</p>
          </article>
        ))}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-slate-900/70 p-5 text-sm text-slate-100">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Ready for action</p>
          <p className="mt-2 text-lg font-semibold text-white">Launch with AI copy + guardrails</p>
          <p className="mt-2 text-xs text-slate-200">
            Connect WhatsApp, import contacts, and send within 30 minutes with proof for compliance teams.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            Launch the hero loop
          </Link>
        </div>
      </div>
    </section>
  );
}
