"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GlassmorphicCard } from "@/components/marketing/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import {
  Target,
  Eye,
  Heart,
  Rocket,
  Users,
  Globe,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const avatarExecutive = "/assets/generated_images/female_executive_testimonial_avatar.png";
const avatarFounder = "/assets/generated_images/male_founder_testimonial_avatar.png";
const avatarOwner = "/assets/generated_images/female_business_owner_avatar.png";

// todo: remove mock functionality
const teamMembers = [
    {
      name: "Alex Rivera",
      role: "CEO & Co-founder",
      avatar: avatarFounder,
      bio: "Previously led product at a major messaging platform. Passionate about making business communication accessible.",
    },
    {
      name: "Sarah Chen",
      role: "CTO & Co-founder",
      avatar: avatarExecutive,
      bio: "Former engineering lead at a Fortune 500 company. Expert in distributed systems and real-time messaging.",
    },
    {
      name: "Priya Sharma",
      role: "VP of Product",
      avatar: avatarOwner,
      bio: "10+ years in B2B SaaS. Focused on building products that agencies and SMBs love.",
    },
];

const values = [
  {
    icon: Target,
    title: "Customer Obsessed",
    description: "Every feature we build starts with a real customer problem.",
  },
  {
    icon: Heart,
    title: "Transparent",
    description: "Clear pricing, honest communication, no hidden surprises.",
  },
  {
    icon: Rocket,
    title: "Move Fast",
    description: "We ship weekly and iterate based on real feedback.",
  },
  {
    icon: Users,
    title: "Team First",
    description: "We invest in our people and celebrate wins together.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              About EngageNinja
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We're on a mission to make WhatsApp and Email marketing accessible, intelligent, and provably effective.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <GlassmorphicCard>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mt-4 text-2xl font-bold">Our Mission</h2>
                <p className="mt-4 text-muted-foreground">
                  To empower agencies and SMBs with WhatsApp-first customer engagement tools that are simple to use, powered by AI, and deliver provable ROI.
                </p>
                <p className="mt-4 text-muted-foreground">
                  We believe every business deserves access to enterprise-grade messaging tools without the enterprise complexity or price tag.
                </p>
              </GlassmorphicCard>

              <GlassmorphicCard>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <Eye className="h-6 w-6 text-accent-foreground" />
                </div>
                <h2 className="mt-4 text-2xl font-bold">Our Vision</h2>
                <p className="mt-4 text-muted-foreground">
                  A world where every business can communicate with their customers on their preferred channel, with intelligence that maximizes engagement and proves value.
                </p>
                <p className="mt-4 text-muted-foreground">
                  We're building the future of customer engagement—one resend, one uplift, one happy customer at a time.
                </p>
              </GlassmorphicCard>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold">Our Team</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              A passionate team of builders with deep experience in messaging, SaaS, and marketing technology.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {teamMembers.map((member) => (
                <GlassmorphicCard key={member.name} className="text-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="mx-auto h-24 w-24 rounded-full object-cover"
                  />
                  <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold">Our Values</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <GlassmorphicCard key={value.title} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </section>

        <section id="careers" className="bg-muted/30 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Globe className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-2xl font-bold">Join Our Team</h2>
            <p className="mt-4 text-muted-foreground">
              We're always looking for talented people who are passionate about building great products. Check out our open positions.
            </p>
            <div className="mt-8">
              <Button data-testid="button-view-careers">
                View Open Positions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Press & Updates</h2>
            <p className="mt-4 text-muted-foreground">
              For press inquiries, partnership opportunities, or media resources, please contact our communications team.
            </p>
            <div className="mt-8">
              <Link href="/contact">
                <Button variant="outline" data-testid="button-press-contact">
                  Contact Us
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
