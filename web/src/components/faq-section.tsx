type FAQItem = {
  question: string;
  answer: string;
  icon?: string;
};

type Props = {
  items: FAQItem[];
};

export default function FAQSection({ items }: Props) {
  return (
    <section className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-200 shadow-lg shadow-black/30">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">FAQ</p>
        <h3 className="text-2xl font-semibold text-white">Everything you need to know before pitching stakeholders.</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-emerald-400"
          >
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
              <span className="flex items-center gap-2">
                <span aria-hidden="true">{item.icon ?? "❓"}</span>
                {item.question}
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-200 group-open:rotate-180">+</span>
            </summary>
            <p className="mt-3 text-xs text-slate-300">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
