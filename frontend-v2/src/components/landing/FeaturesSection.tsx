"use client";

import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCheck,
  faBrain,
  faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";

export function FeaturesSection() {
  const t = useTranslations("Landing.features");
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("title").split(",")[0]},
            <span className="gradient-text">
              {" " + t("title").split(",")[1]}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faBrain}
                className="text-2xl text-primary"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("aiAssistant.title")}
            </h3>
            <p className="text-gray-600 mb-6">{t("aiAssistant.description")}</p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("aiAssistant.features.0")}
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("aiAssistant.features.1")}
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("aiAssistant.features.2")}
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faFileInvoice}
                className="text-2xl text-secondary"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("taxCompliance.title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("taxCompliance.description")}
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("taxCompliance.features.0")}
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("taxCompliance.features.1")}
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("taxCompliance.features.2")}
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-2xl text-accent"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("collaboration.title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("collaboration.description")}
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("collaboration.features.0")}
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("collaboration.features.1")}
              </li>
              <li className="flex items-start">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-green-500 mr-3 mt-1"
                />
                {t("collaboration.features.2")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
