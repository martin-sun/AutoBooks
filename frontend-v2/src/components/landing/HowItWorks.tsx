'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faMagicWandSparkles,
  faFileExport,
  faMoneyBillTransfer
} from '@fortawesome/free-solid-svg-icons';

export function HowItWorks() {
  const t = useTranslations('Landing.howItWorks');
  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('steps.connect.title')}
              </h3>
              <p className="text-gray-600">
                {t('steps.connect.description')}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faMagicWandSparkles} className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('steps.ai.title')}
              </h3>
              <p className="text-gray-600">
                {t('steps.ai.description')}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faFileExport} className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('steps.focus.title')}
              </h3>
              <p className="text-gray-600">
                {t('steps.focus.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
