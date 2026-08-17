"use client";

import React from "react";
import LandingNav from "./components/LandingNav";
import MarketingHero from "./components/marketing/MarketingHero";
import MarketingFeatures from "./components/marketing/MarketingFeatures";
import HowItWorks from "./components/marketing/HowItWorks";
import StatusFilmstrip from "./components/marketing/StatusFilmstrip";
import PricingPlans from "./components/marketing/PricingPlans";
import MarketingSocialProof from "./components/marketing/MarketingSocialProof";
import MarketingContactCTA from "./components/marketing/MarketingContactCTA";

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-zinc-900/15 selection:text-zinc-900 dark:selection:bg-[#C9A227]/25 dark:selection:text-[#E4C55E]">
      {/* Navigation Header */}
      <LandingNav />

      <main className="flex-1">
        {/* Kinetic Hero */}
        <MarketingHero />

        {/* 5 Core Feature Sections with Animated Vector Constructs */}
        <MarketingFeatures />

        {/* 4-Step How It Works Flow */}
        <HowItWorks />

        {/* Status System In Action Filmstrip */}
        <StatusFilmstrip />

        {/* Commercial Pricing Plans */}
        <PricingPlans />

        {/* Workshop Social Proof */}
        <MarketingSocialProof />
      </main>

      {/* Pre-Login CTA & Technical Footer */}
      <MarketingContactCTA />
    </div>
  );
}
