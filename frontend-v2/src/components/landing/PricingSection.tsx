'use client';

import { useTranslations } from 'next-intl';

export function PricingSection() {
  const t = useTranslations('Landing.pricing');
  return (
    <section id="pricing" className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('titlePrefix')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('plans.starter.name')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('plans.starter.description')}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{t('plans.starter.price')}</span>
              <span className="text-gray-600">
                {t('plans.starter.period')}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.starter.features.clients')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.starter.features.ai')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.starter.features.reports')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.starter.features.support')}
              </li>
            </ul>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-full hover:border-primary hover:text-primary transition">
              {t('plans.starter.cta')}
            </button>
          </div>

          {/* Professional Plan */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 shadow-xl text-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
              {t('plans.professional.badge')}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('plans.professional.name')}
            </h3>
            <p className="text-gray-200 mb-6">
              {t('plans.professional.description')}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">{t('plans.professional.price')}</span>
              <span className="text-gray-200">
                {t('plans.professional.period')}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                {t('plans.professional.features.clients')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                {t('plans.professional.features.ai')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                {t('plans.professional.features.reports')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                {t('plans.professional.features.support')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-white mr-3"></i>
                {t('plans.professional.features.portal')}
              </li>
            </ul>
            <button className="w-full bg-white text-primary py-3 rounded-full hover:bg-gray-100 transition font-semibold">
              {t('plans.professional.cta')}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('plans.enterprise.name')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('plans.enterprise.description')}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {t('plans.enterprise.price')}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.enterprise.features.everything')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.enterprise.features.integrations')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.enterprise.features.manager')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.enterprise.features.onpremise')}
              </li>
              <li className="flex items-center">
                <i className="fas fa-check text-green-500 mr-3"></i>
                {t('plans.enterprise.features.sla')}
              </li>
            </ul>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-full hover:border-primary hover:text-primary transition">
              {t('plans.enterprise.cta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
