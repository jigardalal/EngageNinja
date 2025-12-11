"use client";

import { useState } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GlassmorphicCard } from "@/components/marketing/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    useCase: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // todo: remove mock functionality - implement real form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({
      name: "",
      email: "",
      company: "",
      role: "",
      useCase: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Get in Touch
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Have questions? Want a demo? We're here to help.
              </p>
            </div>

            <div className="mt-16 grid gap-12 lg:grid-cols-2">
              <div>
                <GlassmorphicCard>
                  <h2 className="text-xl font-bold">Contact Us</h2>
                  <p className="mt-2 text-muted-foreground">
                    Fill out the form and our team will get back to you within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          data-testid="input-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          placeholder="Your company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          data-testid="input-company"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="founder">Founder / CEO</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="useCase">I am a...</Label>
                      <Select
                        value={formData.useCase}
                        onValueChange={(value) => setFormData({ ...formData, useCase: value })}
                      >
                        <SelectTrigger data-testid="select-use-case">
                          <SelectValue placeholder="Select your use case" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agency">Agency</SelectItem>
                          <SelectItem value="smb">SMB / Small Business</SelectItem>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your needs..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        data-testid="textarea-message"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-contact">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </GlassmorphicCard>
              </div>

              <div className="space-y-6">
                <GlassmorphicCard className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Book a Demo</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      See EngageNinja in action. Schedule a personalized demo with our team.
                    </p>
                    <a href="#" className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline" data-testid="button-book-demo">
                      Schedule Demo
                    </a>
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <Mail className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Us</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      For general inquiries, reach out to our team directly.
                    </p>
                    <a href="mailto:hello@engageninja.com" className="mt-2 block text-sm font-medium text-primary hover:underline">
                      hello@engageninja.com
                    </a>
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                    <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Chat</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Chat with our support team in real-time during business hours.
                    </p>
                    <a href="#" className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline" data-testid="button-start-chat">
                      Start Chat
                    </a>
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard>
                  <h3 className="font-semibold">What to Expect</h3>
                  <ul className="mt-4 space-y-3">
                    {[
                      "Response within 24 hours",
                      "No spam or aggressive follow-ups",
                      "Honest answers to your questions",
                      "Free trial or demo available",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </GlassmorphicCard>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
