'use client';

import { useLocale } from 'next-intl';

export function BenefitsSection() {
  const currentLocale = useLocale();
  return (
    <section
      id="benefits"
      className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {currentLocale === 'zh' ? '改变您的业务,' : 
             currentLocale === 'fr' ? 'Transformez votre cabinet,' : 
             'Transform Your Practice,'}
            <span className="gradient-text">
              {currentLocale === 'zh' ? ' 改变您的生活' : 
               currentLocale === 'fr' ? ' Transformez votre vie' : 
               ' Transform Your Life'}
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            {currentLocale === 'zh' ? '来自使用 AutoBooks 的真实会计师的真实结果' : 
             currentLocale === 'fr' ? 'Des résultats réels de comptables réels utilisant AutoBooks' : 
             'Real results from real accountants using AutoBooks'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-5xl font-bold gradient-text mb-2">73%</div>
            <p className="text-gray-700 font-semibold">
              {currentLocale === 'zh' ? '节省时间' : 
               currentLocale === 'fr' ? 'Temps économisé' : 
               'Time Saved'}
            </p>
            <p className="text-sm text-gray-600">
              {currentLocale === 'zh' ? '在日常记账上' : 
               currentLocale === 'fr' ? 'sur la comptabilité de routine' : 
               'on routine bookkeeping'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold gradient-text mb-2">2.5x</div>
            <p className="text-gray-700 font-semibold">
              {currentLocale === 'zh' ? '更多客户' : 
               currentLocale === 'fr' ? 'Plus de clients' : 
               'More Clients'}
            </p>
            <p className="text-sm text-gray-600">
              {currentLocale === 'zh' ? '每位会计师服务的' : 
               currentLocale === 'fr' ? 'servis par comptable' : 
               'served per accountant'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold gradient-text mb-2">45%</div>
            <p className="text-gray-700 font-semibold">
              {currentLocale === 'zh' ? '收入增长' : 
               currentLocale === 'fr' ? 'Augmentation des revenus' : 
               'Revenue Increase'}
            </p>
            <p className="text-sm text-gray-600">
              {currentLocale === 'zh' ? '在第一年内' : 
               currentLocale === 'fr' ? 'au cours de la première année' : 
               'within first year'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold gradient-text mb-2">98%</div>
            <p className="text-gray-700 font-semibold">
              {currentLocale === 'zh' ? '客户满意度' : 
               currentLocale === 'fr' ? 'Satisfaction client' : 
               'Client Satisfaction'}
            </p>
            <p className="text-sm text-gray-600">
              {currentLocale === 'zh' ? '更快的周转时间' : 
               currentLocale === 'fr' ? 'délais d\'exécution plus rapides' : 
               'faster turnaround times'}
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
                {currentLocale === 'zh' ? '陈莉莉, 注册会计师' : 
                 currentLocale === 'fr' ? 'Sarah Chen, CPA' : 
                 'Sarah Chen, CPA'}
              </p>
              <p className="text-gray-600">
                {currentLocale === 'zh' ? '陈氏会计事务所' : 
                 currentLocale === 'fr' ? 'Chen & Associés Comptabilité' : 
                 'Chen & Associates Accounting'}
              </p>
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
            {currentLocale === 'zh' ? 
              "“AutoBooks 改变了我的业务。我从管理 30 个客户变成了管理 75 个以上的客户，而实际工作时间反而减少了。仅人工智能分类功能就为我每周节省了 20 多个小时。我的客户喜欢更快的周转时间，而我喜欢专注于咨询工作而不是数据录入。”" : 
            currentLocale === 'fr' ? 
              "«AutoBooks a transformé mon cabinet. Je suis passée de la gestion de 30 clients à plus de 75, tout en travaillant moins d'heures. La catégorisation par IA me fait gagner plus de 20 heures par semaine. Mes clients apprécient les délais de traitement plus rapides, et j'aime me concentrer sur le travail de conseil plutôt que sur la saisie de données.»" : 
              "\"AutoBooks transformed my practice. I've gone from managing 30 clients to over 75, while actually working fewer hours. The AI categorization alone saves me 20+ hours per week. My clients love the faster turnaround, and I love focusing on advisory work instead of data entry.\""}
          </blockquote>
        </div>
      </div>
    </section>
  );
}
