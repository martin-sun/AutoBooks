'use client';

import { useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload,
  faMagicWandSparkles,
  faFileExport,
  faMoneyBillTransfer
} from '@fortawesome/free-solid-svg-icons';

export function HowItWorks() {
  const currentLocale = useLocale();
  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {currentLocale === 'zh' ? '通过' : 
             currentLocale === 'fr' ? 'Démarrez en' : 
             'Get Started in'} <span className="gradient-text">
              {currentLocale === 'zh' ? '3 个简单步骤' : 
               currentLocale === 'fr' ? '3 étapes simples' : 
               '3 Simple Steps'}
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            {currentLocale === 'zh' ? '在不到 15 分钟内完成设置' : 
             currentLocale === 'fr' ? 'Opérationnel en moins de 15 minutes' : 
             'Up and running in less than 15 minutes'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {currentLocale === 'zh' ? '连接您的客户' : 
                 currentLocale === 'fr' ? 'Connectez vos clients' : 
                 'Connect Your Clients'}
              </h3>
              <p className="text-gray-600">
                {currentLocale === 'zh' ? '从 QuickBooks、Excel 导入或直接连接银行数据' : 
                 currentLocale === 'fr' ? 'Importez depuis QuickBooks, Excel ou connectez directement les flux bancaires' : 
                 'Import from QuickBooks, Excel, or connect bank feeds directly'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faMagicWandSparkles} className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {currentLocale === 'zh' ? 'AI 完成繁重工作' : 
                 currentLocale === 'fr' ? 'L\'IA fait le gros du travail' : 
                 'AI Does the Heavy Lifting'}
              </h3>
              <p className="text-gray-600">
                {currentLocale === 'zh' ? '交易自动分类和核对' : 
                 currentLocale === 'fr' ? 'Les transactions sont automatiquement catégorisées et rapprochées' : 
                 'Transactions are automatically categorized and reconciled'}
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faFileExport} className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {currentLocale === 'zh' ? '专注于咨询服务' : 
                 currentLocale === 'fr' ? 'Concentrez-vous sur le conseil' : 
                 'Focus on Advisory'}
              </h3>
              <p className="text-gray-600">
                {currentLocale === 'zh' ? '将您的时间花在能够增加收入的高价值服务上' : 
                 currentLocale === 'fr' ? 'Consacrez votre temps à des services à forte valeur ajoutée qui augmentent vos revenus' : 
                 'Spend your time on high-value services that grow your revenue'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
