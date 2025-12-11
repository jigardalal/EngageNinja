"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GlassmorphicCard } from "@/components/marketing/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Video,
  Code,
  HelpCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

// todo: remove mock functionality
const blogPosts = [
  {
    title: "10 WhatsApp Marketing Best Practices for 2024",
    excerpt: "Learn the strategies that top brands use to maximize WhatsApp engagement.",
    date: "Dec 5, 2024",
    readTime: "8 min",
  },
  {
    title: "How Resend Intelligence Increases Campaign ROI",
    excerpt: "Deep dive into the science behind our resend engine and uplift measurement.",
    date: "Nov 28, 2024",
    readTime: "6 min",
  },
  {
    title: "AI-Powered Copywriting: A Guide for Marketers",
    excerpt: "How to leverage AI to create compelling messages at scale.",
    date: "Nov 20, 2024",
    readTime: "10 min",
  },
];

const guides = [
  {
    title: "WhatsApp Marketing 101",
    description: "Complete beginner's guide to WhatsApp Business API and marketing.",
    icon: BookOpen,
  },
  {
    title: "Resend Uplift Playbook",
    description: "Master the art of intelligent resending for maximum campaign impact.",
    icon: FileText,
  },
];

const caseStudies = [
  {
    company: "Digital Growth Agency",
    result: "+23% ROI with resend intelligence",
    industry: "Marketing Agency",
  },
  {
    company: "StyleBoutique",
    result: "50K messages/month in 3 weeks",
    industry: "E-commerce",
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Resources & Learning
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Guides, case studies, and best practices to help you succeed.
            </p>
          </div>
        </section>

        <section id="blog" className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Latest from the Blog</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {blogPosts.map((post) => (
                <GlassmorphicCard key={post.title} hover className="cursor-pointer">
                  <div className="mb-4 aspect-video rounded-lg bg-muted" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </section>

        <section id="guides" className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Guides & Playbooks</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {guides.map((guide) => (
                <GlassmorphicCard key={guide.title} hover className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <guide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{guide.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{guide.description}</p>
                    <a href="#" className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline" data-testid={`link-guide-${guide.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      Read Guide <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </section>

        <section id="cases" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Case Studies</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {caseStudies.map((study) => (
                <GlassmorphicCard key={study.company} hover className="cursor-pointer">
                  <span className="text-sm text-muted-foreground">{study.industry}</span>
                  <h3 className="mt-2 text-xl font-semibold">{study.company}</h3>
                  <p className="mt-2 text-lg font-bold text-primary">{study.result}</p>
                  <a href="#" className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline">
                    Read Case Study <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </section>

        <section id="webinars" className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold">Webinars</h2>
                <p className="mt-2 text-muted-foreground">
                  Live sessions and recordings from our team and industry experts.
                </p>
              </div>
              <Button variant="outline" data-testid="button-view-webinars">
                <Video className="mr-2 h-4 w-4" /> View All Webinars
              </Button>
            </div>
          </div>
        </section>

        <section id="api" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <GlassmorphicCard className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">API Documentation</h2>
                <p className="mt-2 text-muted-foreground">
                  Comprehensive API docs for developers. RESTful endpoints, webhooks, and SDKs.
                </p>
              </div>
              <Button data-testid="button-view-api-docs">
                View API Docs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </GlassmorphicCard>
          </div>
        </section>

        <section id="help" className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <GlassmorphicCard className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent">
                <HelpCircle className="h-8 w-8 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Help Center</h2>
                <p className="mt-2 text-muted-foreground">
                  Find answers to common questions, troubleshooting guides, and how-to articles.
                </p>
              </div>
              <Button variant="outline" data-testid="button-visit-help-center">
                Visit Help Center <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </GlassmorphicCard>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
