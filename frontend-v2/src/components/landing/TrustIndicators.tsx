"use client";

import { useLocale } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faFlag,
  faClock,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

export function TrustIndicators() {
  const currentLocale = useLocale();
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-500">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="text-2xl text-gray-500"
            />
            <span className="font-semibold">
              {currentLocale === "zh"
                ? "银行级安全性"
                : currentLocale === "fr"
                ? "Sécurité de niveau bancaire"
                : "Bank-Level Security"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faFlag} className="text-2xl text-gray-500" />
            <span className="font-semibold">
              {currentLocale === "zh"
                ? "100% 加拿大制造"
                : currentLocale === "fr"
                ? "100% Canadien"
                : "100% Canadian"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faClock}
              className="text-2xl text-gray-500"
            />
            <span className="font-semibold">
              {currentLocale === "zh"
                ? "99.9% 的运行时间"
                : currentLocale === "fr"
                ? "99.9% de disponibilité"
                : "99.9% Uptime"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faHeadset}
              className="text-2xl text-gray-500"
            />
            <span className="font-semibold">
              {currentLocale === "zh"
                ? "24/7 全天候支持"
                : currentLocale === "fr"
                ? "Support 24/7"
                : "24/7 Support"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
