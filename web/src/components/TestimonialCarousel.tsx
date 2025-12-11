import { Quote } from "lucide-react";
import { GlassmorphicCard } from "./GlassmorphicCard";
import avatar1 from "@assets/generated_images/female_executive_testimonial_avatar.png";
import avatar2 from "@assets/generated_images/male_founder_testimonial_avatar.png";
import avatar3 from "@assets/generated_images/female_business_owner_avatar.png";

// todo: remove mock functionality - replace with real testimonials
const testimonials = [
  {
    quote: "EngageNinja's resend feature alone increased our campaign ROI by 23%. The uplift proof makes reporting to clients effortless.",
    author: "Sarah Chen",
    role: "CEO, Digital Growth Agency",
    avatar: avatar1,
    metric: "+23% ROI",
  },
  {
    quote: "We consolidated 4 different tools into EngageNinja. The WhatsApp-first approach finally makes sense for our market.",
    author: "Marcus Williams",
    role: "Founder, TechStart Inc",
    avatar: avatar2,
    metric: "4 tools replaced",
  },
  {
    quote: "From zero to 50,000 WhatsApp messages a month in just 3 weeks. The AI copy suggestions saved us countless hours.",
    author: "Priya Sharma",
    role: "Owner, StyleBoutique",
    avatar: avatar3,
    metric: "50K msgs/month",
  },
];

export function TestimonialCarousel() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by Growing Businesses
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            See how agencies and SMBs are achieving real results with EngageNinja.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <GlassmorphicCard key={testimonial.author} className="relative">
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/20" />
              <div className="mb-4 inline-flex">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {testimonial.metric}
                </span>
              </div>
              <p className="text-muted-foreground">{testimonial.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialCarousel;
