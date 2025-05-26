'use client';

import { useLocale } from 'next-intl';

export function PricingSection() {
  const currentLocale = useLocale();
  return (
    <section id="pricing" className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {currentLocale === 'zh' ? '价格' : 
             currentLocale === 'fr' ? 'Tarification qui' : 
             'Pricing That'} <span className="gradient-text">
              {currentLocale === 'zh' ? '与您一起成长' : 
               currentLocale === 'fr' ? 'évolue avec vous' : 
               'Grows With You'}
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            {currentLocale === 'zh' ? '免费开始，随着您的成长而扩展' : 
             currentLocale === 'fr' ? 'Commencez gratuitement, évoluez à mesure que vous grandissez' : 
             'Start free, scale as you grow'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentLocale === 'zh' ? '入门版' : 
               currentLocale === 'fr' ? 'Débutant' : 
               'Starter'}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLocale === 'zh' ? '适合新成立的事务所' : 
               currentLocale === 'fr' ? 'Parfait pour les nouveaux cabinets' : 
               'Perfect for new practices'}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">
                {currentLocale === 'zh' ? '/月' : 
                 currentLocale === 'fr' ? '/mois' : 
                 '/month'}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? '最多 5 个客户' : 
                 currentLocale === 'fr' ? 'Jusqu\'\u00e0 5 clients' : 
                 'Up to 5 clients'}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? 'AI 分类功能' : 
                 currentLocale === 'fr' ? 'Catégorisation par IA' : 
                 'AI categorization'}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? '基本报表' : 
                 currentLocale === 'fr' ? 'Rapports de base' : 
                 'Basic reports'}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? '电子邮件支持' : 
                 currentLocale === 'fr' ? 'Support par email' : 
                 'Email support'}
              </li>
            </ul>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-full hover:border-primary hover:text-primary transition">
              {currentLocale === 'zh' ? '免费开始' : 
               currentLocale === 'fr' ? 'Démarrer gratuitement' : 
               'Start Free'}
            </button>
          </div>

          {/* Professional Plan */}
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 shadow-xl text-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
              {currentLocale === 'zh' ? '最受欢迎' : 
               currentLocale === 'fr' ? 'PLUS POPULAIRE' : 
               'MOST POPULAR'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {currentLocale === 'zh' ? '专业版' : 
               currentLocale === 'fr' ? 'Professionnel' : 
               'Professional'}
            </h3>
            <p className="text-blue-100 mb-6">
              {currentLocale === 'zh' ? '适合成长中的事务所' : 
               currentLocale === 'fr' ? 'Pour les cabinets en croissance' : 
               'For growing practices'}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-blue-100">
                {currentLocale === 'zh' ? '/月，每 10 个客户' : 
                 currentLocale === 'fr' ? '/mois pour 10 clients' : 
                 '/month per 10 clients'}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-white mr-3">✓</span>
                {currentLocale === 'zh' ? '无限客户' : 
                 currentLocale === 'fr' ? 'Clients illimités' : 
                 'Unlimited clients'}
              </li>
              <li className="flex items-center">
                <span className="text-white mr-3">✓</span>
                {currentLocale === 'zh' ? '高级 AI 分类功能' : 
                 currentLocale === 'fr' ? 'Catégorisation IA avancée' : 
                 'Advanced AI categorization'}
              </li>
              <li className="flex items-center">
                <span className="text-white mr-3">✓</span>
                {currentLocale === 'zh' ? '所有 CRA 报表' : 
                 currentLocale === 'fr' ? 'Tous les rapports CRA' : 
                 'All CRA reports'}
              </li>
              <li className="flex items-center">
                <span className="text-white mr-3">✓</span>
                {currentLocale === 'zh' ? '优先支持' : 
                 currentLocale === 'fr' ? 'Support prioritaire' : 
                 'Priority support'}
              </li>
              <li className="flex items-center">
                <span className="text-white mr-3">✓</span>
                {currentLocale === 'zh' ? '客户门户' : 
                 currentLocale === 'fr' ? 'Portail client' : 
                 'Client portal'}
              </li>
            </ul>
            <button className="w-full bg-white text-primary py-3 rounded-full hover:bg-gray-100 transition font-semibold">
              {currentLocale === 'zh' ? '开始 3 个月试用' : 
               currentLocale === 'fr' ? 'Essai de 3 mois' : 
               'Start 3-Month Trial'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentLocale === 'zh' ? '企业版' : 
               currentLocale === 'fr' ? 'Entreprise' : 
               'Enterprise'}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLocale === 'zh' ? '适合大型事务所' : 
               currentLocale === 'fr' ? 'Pour les grands cabinets' : 
               'For large firms'}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {currentLocale === 'zh' ? '定制价格' : 
                 currentLocale === 'fr' ? 'Personnalisé' : 
                 'Custom'}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? '包含专业版所有功能' : 
                 currentLocale === 'fr' ? 'Tout ce qui est inclus dans Pro' : 
                 'Everything in Pro'}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? '自定义集成' : 
                 currentLocale === 'fr' ? 'Intégrations personnalisées' : 
                 'Custom integrations'}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? '专属客户经理' : 
                 currentLocale === 'fr' ? 'Gestionnaire de compte dédié' : 
                 'Dedicated account manager'}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? '本地部署选项' : 
                 currentLocale === 'fr' ? 'Option sur site' : 
                 'On-premise option'}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                {currentLocale === 'zh' ? 'SLA 服务级别保证' : 
                 currentLocale === 'fr' ? 'Garantie de niveau de service (SLA)' : 
                 'SLA guarantee'}
              </li>
            </ul>
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-full hover:border-primary hover:text-primary transition">
              {currentLocale === 'zh' ? '联系销售' : 
               currentLocale === 'fr' ? 'Contacter les ventes' : 
               'Contact Sales'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
