'use client';

import { useLocale } from 'next-intl';

export function FeaturesSection() {
  const currentLocale = useLocale();
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {currentLocale === 'zh' ? '自动化繁琐工作,' : 
             currentLocale === 'fr' ? 'Automatisez les tâches banales,' : 
             'Automate the Mundane,'}
            <span className="gradient-text">
              {currentLocale === 'zh' ? ' 提升您的专业水平' : 
               currentLocale === 'fr' ? ' Amplifiez votre expertise' : 
               ' Amplify Your Expertise'}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentLocale === 'zh' ? '让人工智能处理重复性的记账任务，而您可以专注于战略咨询服务' : 
             currentLocale === 'fr' ? 'Laissez l\'IA gérer les tâches comptables répétitives pendant que vous vous concentrez sur les services de conseil stratégique' : 
             'Let AI handle the repetitive bookkeeping tasks while you focus on strategic advisory services'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl text-primary">🧠</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLocale === 'zh' ? 'AI 驱动的分类功能' : 
               currentLocale === 'fr' ? 'Catégorisation alimentée par l\'IA' : 
               'AI-Powered Categorization'}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLocale === 'zh' ? '以95%的准确度自动分类交易。我们的人工智能从您的更正中学习并随着时间的推移而不断改进。' : 
               currentLocale === 'fr' ? 'Catégorisez automatiquement les transactions avec une précision de 95%. Notre IA apprend de vos corrections et s\'améliore avec le temps.' : 
               'Automatically categorize transactions with 95% accuracy. Our AI learns from your corrections and improves over time.'}
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '智能收据扫描和 OCR 技术' : 
                 currentLocale === 'fr' ? 'Numérisation intelligente des reçus et OCR' : 
                 'Smart receipt scanning & OCR'}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '学习客户特定的规则' : 
                 currentLocale === 'fr' ? 'Apprend les règles spécifiques au client' : 
                 'Learns client-specific rules'}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '几秒钟内完成批量分类' : 
                 currentLocale === 'fr' ? 'Catégorisation en masse en quelques secondes' : 
                 'Bulk categorization in seconds'}
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl text-secondary">📄</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLocale === 'zh' ? '加拿大税务合规' : 
               currentLocale === 'fr' ? 'Conformité fiscale canadienne' : 
               'Canadian Tax Compliance'}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLocale === 'zh' ? '专为加拿大税收要求而构建。一键生成符合 CRA 要求的报表。' : 
               currentLocale === 'fr' ? 'Conçu spécifiquement pour les exigences fiscales canadiennes. Générez des rapports prêts pour l\'ARC en un seul clic.' : 
               'Built specifically for Canadian tax requirements. Generate CRA-ready reports with one click.'}
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '自动 GST/HST 计算' : 
                 currentLocale === 'fr' ? 'Calculs automatiques de TPS/TVH' : 
                 'Automatic GST/HST calculations'}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? 'T2125 和 T2 报表生成' : 
                 currentLocale === 'fr' ? 'Génération de rapports T2125 et T2' : 
                 'T2125 & T2 report generation'}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '省级税收合规' : 
                 currentLocale === 'fr' ? 'Conformité fiscale provinciale' : 
                 'Provincial tax compliance'}
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl text-accent">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLocale === 'zh' ? '多客户管理' : 
               currentLocale === 'fr' ? 'Gestion multi-clients' : 
               'Multi-Client Management'}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLocale === 'zh' ? '无缝切换客户。从单一仪表板管理数百个账簿。' : 
               currentLocale === 'fr' ? 'Passez facilement d\'un client à l\'autre. Gérez des centaines de livres comptables à partir d\'un seul tableau de bord.' : 
               'Seamlessly switch between clients. Manage hundreds of books from a single dashboard.'}
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '一键切换客户' : 
                 currentLocale === 'fr' ? 'Changement de client en un clic' : 
                 'One-click client switching'}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '跨客户批量操作' : 
                 currentLocale === 'fr' ? 'Opérations en masse sur plusieurs clients' : 
                 'Bulk operations across clients'}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                {currentLocale === 'zh' ? '客户门户访问' : 
                 currentLocale === 'fr' ? 'Accès au portail client' : 
                 'Client portal access'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
