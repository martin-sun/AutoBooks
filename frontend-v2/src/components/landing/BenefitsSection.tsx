"use client";

import { useTranslations } from "next-intl";

export function BenefitsSection() {
  const t = useTranslations("Landing.benefits");
  return (
    <section
      id="benefits"
      className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
            {t("title").split(",")[0] + ","}
            <span className="gradient-text font-black">
              {" " + t("title").split(",")[1]}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-700">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-extrabold gradient-text mb-2">
              73%
            </div>
            <p className="text-xl text-gray-800 font-semibold">
              {t("stats.timeSaved.label")}
            </p>
            <p className="text-sm text-gray-600">
              {t("stats.timeSaved.description")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold gradient-text mb-2">
              2.5x
            </div>
            <p className="text-xl text-gray-800 font-semibold">
              {t("stats.moreClients.label")}
            </p>
            <p className="text-sm text-gray-600">
              {t("stats.moreClients.description")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold gradient-text mb-2">
              45%
            </div>
            <p className="text-xl text-gray-800 font-semibold">
              {t("stats.revenueIncrease.label")}
            </p>
            <p className="text-sm text-gray-600">
              {t("stats.revenueIncrease.description")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold gradient-text mb-2">
              98%
            </div>
            <p className="text-xl text-gray-800 font-semibold">
              {t("stats.clientSatisfaction.label")}
            </p>
            <p className="text-sm text-gray-600">
              {t("stats.clientSatisfaction.description")}
            </p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
              👤
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {t("testimonial.name")}
              </p>
              <p className="text-gray-600">{t("testimonial.company")}</p>
              <div className="flex text-yellow-400 mt-1">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </div>
          </div>
          <blockquote className="text-lg text-gray-700 italic">
            "{t("testimonial.quote")}"
          </blockquote>
        </div>
      </div>
    </section>
  );
}
