"use client";

import { useTranslations } from "next-intl";

export function CTASection() {
  const t = useTranslations('Landing.cta');
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {t('title')}
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-primary px-8 py-4 rounded-full hover:bg-gray-100 transition font-semibold">
            {t('trial')}
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white/10 transition font-semibold">
            {t('demo')}
          </button>
        </div>
        <p className="text-sm text-blue-100 mt-6">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
