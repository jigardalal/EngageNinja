import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// todo: remove mock functionality
const faqs = [
  {
    question: "Can I start for free?",
    answer: "Yes! Our Free tier includes 1,000 WhatsApp messages per month, one user seat, and access to our basic dashboard. No credit card required to get started.",
  },
  {
    question: "Is WhatsApp Business API approval included?",
    answer: "We guide you through the WhatsApp Business API approval process and help with template submissions. While approval is managed by Meta, we've streamlined the process to get you live quickly.",
  },
  {
    question: "Do you support agencies with multiple clients?",
    answer: "Absolutely! Our Agency and Enterprise plans include multi-tenant capabilities with client impersonation, cross-tenant reporting, and separate billing per client if needed.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades apply at the start of your next billing cycle.",
  },
  {
    question: "What happens if I exceed my message limit?",
    answer: "We'll notify you when you're approaching your limit. You can upgrade your plan or purchase additional message packs. We never stop your campaigns mid-send.",
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No long-term contracts required. Monthly plans are billed month-to-month. Annual plans offer 17% savings and are billed yearly.",
  },
];

export function PricingFAQ() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default PricingFAQ;
