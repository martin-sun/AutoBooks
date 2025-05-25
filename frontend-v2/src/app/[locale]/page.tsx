// 这是一个客户端组件，用于实现 landing page
"use client";

import { useEffect } from "react";
import {
  Navbar,
  HeroSection,
  TrustIndicators,
  FeaturesSection,
  BenefitsSection,
  HowItWorks,
  PricingSection,
  CtaSection,
  Footer,
} from "@/features/landing/components";

export default function Home() {
  // 添加平滑滚动效果和淡入动画
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (this: HTMLAnchorElement, e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href") || "");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // 添加淡入动画
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    // 观察所有 section 元素
    document.querySelectorAll("section").forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustIndicators />
      <FeaturesSection />
      <BenefitsSection />
      <HowItWorks />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
