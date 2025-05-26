'use client';

import { useLocale } from 'next-intl';

export function CTASection() {
  const currentLocale = useLocale();
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {currentLocale === 'zh' ? '准备好转变您的业务了吗？' : 
           currentLocale === 'fr' ? 'Prêt à transformer votre cabinet ?' : 
           'Ready to Transform Your Practice?'}
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          {currentLocale === 'zh' ? '加入成千上万的加拿大会计师行列，使用 AutoBooks 服务更多客户并获得更多收入。' : 
           currentLocale === 'fr' ? 'Rejoignez des milliers de comptables canadiens qui servent plus de clients et gagnent plus de revenus avec AutoBooks.' : 
           'Join thousands of Canadian accountants who are serving more clients and earning more revenue with AutoBooks.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-primary px-8 py-4 rounded-full hover:bg-gray-100 transition font-semibold">
            {currentLocale === 'zh' ? '开始 3 个月免费试用' : 
             currentLocale === 'fr' ? 'Commencer votre essai gratuit de 3 mois' : 
             'Start Your 3-Month Free Trial'}
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white/10 transition font-semibold">
            {currentLocale === 'zh' ? '安排演示' : 
             currentLocale === 'fr' ? 'Planifier une démonstration' : 
             'Schedule a Demo'}
          </button>
        </div>
        <p className="text-sm text-blue-100 mt-6">
          {currentLocale === 'zh' ? '无需信用卡 • 15 分钟内设置完成 • 随时可取消' : 
           currentLocale === 'fr' ? 'Aucune carte de crédit requise • Configuration en 15 minutes • Annulez à tout moment' : 
           'No credit card required • Setup in 15 minutes • Cancel anytime'}
        </p>
      </div>
    </section>
  );
}
