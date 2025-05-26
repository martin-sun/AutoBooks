"use client";

import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faFlag,
  faClock,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

export function TrustIndicators() {
  const t = useTranslations('Landing.trustIndicators');
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
              {t('security')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faFlag} className="text-2xl text-gray-500" />
            <span className="font-semibold">
              {t('canadian')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faClock}
              className="text-2xl text-gray-500"
            />
            <span className="font-semibold">
              {t('uptime')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faHeadset}
              className="text-2xl text-gray-500"
            />
            <span className="font-semibold">
              {t('support')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
