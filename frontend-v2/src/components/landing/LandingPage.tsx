"use client";

import { Navigation } from "@/components/landing/Navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustIndicators } from "@/components/landing/TrustIndicators";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

/**
 * LandingPage 组件
 * 
 * 这个组件封装了整个登陆页面的布局和结构，遵循 DRY 原则，
 * 避免在多个地方重复相同的页面结构代码。
 * 
 * 它被用于 src/app/[locale]/page.tsx 中作为主页内容。
 */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Features Section */}
      <FeaturesSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Pricing Section */}
      <PricingSection />

      {/* Call to Action Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
