'use client';

import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustIndicators } from '@/components/landing/TrustIndicators';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import '@/components/landing/landing.css';

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
