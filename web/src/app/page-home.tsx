import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LiveStatusSection } from "@/components/marketing/LiveStatusSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { AICampaignSection } from "@/components/marketing/AICampaignSection";
import { ResendUpliftSection } from "@/components/marketing/ResendUpliftSection";
import { AgencySMBSection } from "@/components/marketing/AgencySMBSection";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { IntegrationsSection } from "@/components/marketing/IntegrationsSection";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { PricingPreview } from "@/components/marketing/PricingPreview";
import { TestimonialCarousel } from "@/components/marketing/TestimonialCarousel";
import { FinalCTA } from "@/components/marketing/FinalCTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <LiveStatusSection />
        <HowItWorksSection />
        <AICampaignSection />
        <ResendUpliftSection />
        <AgencySMBSection />
        <FeatureGrid />
        <IntegrationsSection />
        <SecuritySection />
        <PricingPreview />
        <TestimonialCarousel />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
