'use client';

import { useLocale } from 'next-intl';

export function HeroSection() {
  const currentLocale = useLocale();
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm text-gray-700">
                {currentLocale === 'zh' ? 'AI 驱动 • 专为加拿大会计师打造' : 
                 currentLocale === 'fr' ? 'Propulsé par l\'IA • Conçu pour les comptables canadiens' : 
                 'AI-Powered • Built for Canadian Accountants'}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {currentLocale === 'zh' ? '服务更多客户,' : 
               currentLocale === 'fr' ? 'Servez plus de clients,' : 
               'Serve More Clients,'}<br />
              <span className="gradient-text">
                {currentLocale === 'zh' ? '增加更多收入' : 
                 currentLocale === 'fr' ? 'Gagnez plus de revenus' : 
                 'Earn More Revenue'}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {currentLocale === 'zh' ? 'AutoBooks 是您的人工智能记账助手，可自动执行重复性任务，让您专注于高价值的咨询服务并发展您的业务。' : 
               currentLocale === 'fr' ? 'AutoBooks est votre assistant de comptabilité alimenté par l\'IA qui automatise les tâches répétitives, vous permettant ainsi de vous concentrer sur des services consultatifs à forte valeur ajoutée et de développer votre cabinet.' : 
               'AutoBooks is your AI-powered bookkeeping assistant that automates repetitive tasks, so you can focus on high-value advisory services and grow your practice.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary text-white px-8 py-4 rounded-full hover:bg-blue-600 transition flex items-center justify-center group">
                {currentLocale === 'zh' ? '开始 3 个月免费试用' : 
                 currentLocale === 'fr' ? 'Essai gratuit de 3 mois' : 
                 'Start 3-Month Free Trial'}
                <span className="ml-2 group-hover:translate-x-1 transition">→</span>
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-primary hover:text-primary transition flex items-center justify-center">
                <span className="mr-2">▶</span>
                {currentLocale === 'zh' ? '观看演示' : 
                 currentLocale === 'fr' ? 'Voir la démo' : 
                 'Watch Demo'}
              </button>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {currentLocale === 'zh' ? '无需信用卡' : 
                 currentLocale === 'fr' ? 'Aucune carte de crédit requise' : 
                 'No credit card required'}
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {currentLocale === 'zh' ? '随时可取消' : 
                 currentLocale === 'fr' ? 'Annulez à tout moment' : 
                 'Cancel anytime'}
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative float-animation">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 ai-glow">
                {/* AI Assistant Interface Mock */}
                <div className="bg-gray-50 rounded-xl p-6 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">AI Assistant</p>
                      <p className="text-gray-800">
                        I've categorized 847 transactions this month. GST/HST
                        report is ready with $12,450 in input tax credits
                        identified.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Stats Dashboard Mock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Time Saved</p>
                    <p className="text-2xl font-bold text-gray-900">18.5 hrs</p>
                    <p className="text-xs text-green-600">This month</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Clients Served</p>
                    <p className="text-2xl font-bold text-gray-900">47</p>
                    <p className="text-xs text-green-600">↑ 32% increase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
