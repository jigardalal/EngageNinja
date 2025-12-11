"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { PricingTable } from "@/components/marketing/PricingTable";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";
import { FinalCTA } from "@/components/marketing/FinalCTA";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Start free. Scale as you grow. No hidden fees or surprises.
              </p>
            </div>
            <div className="mt-16">
              <PricingTable />
            </div>
          </div>
        </section>
        <PricingFAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
