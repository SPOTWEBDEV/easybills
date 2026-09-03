import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { ServicesGrid } from "@/components/landing/services-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { AgentCta } from "@/components/landing/agent-cta";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <SiteHeader />
      <main>
        <Hero />
        <TrustBar />
        <ServicesGrid />
        <HowItWorks />
        <Features />
        <AgentCta />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
