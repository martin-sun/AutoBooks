import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const t = useTranslations();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('navigation.dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 账户概览卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{t('navigation.accounts')}</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">总账户数</span>
            <span className="text-xl font-bold">0</span>
          </div>
        </div>
        
        {/* 交易概览卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{t('navigation.transactions')}</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">本月交易数</span>
            <span className="text-xl font-bold">0</span>
          </div>
        </div>
        
        {/* 工作空间信息卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{t('workspace.title')}</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">当前工作空间</span>
            <span className="text-xl font-bold">-</span>
          </div>
        </div>
      </div>
      
      {/* 最近交易列表 */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">最近交易</h2>
        <div className="text-center py-8 text-gray-500">
          {t('common.noData')}
        </div>
      </div>
    </div>
  );
}
