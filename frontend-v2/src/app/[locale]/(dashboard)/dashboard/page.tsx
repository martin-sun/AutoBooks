import { useTranslations } from 'next-intl';
import FinancialSummaryCards from '@/components/dashboard/FinancialSummaryCards';
import BankAccountsOverview from '@/components/dashboard/BankAccountsOverview';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import ChartOfAccountsSummary from '@/components/dashboard/ChartOfAccountsSummary';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function Dashboard() {
  const t = useTranslations();
  
  return (
    <div>
      <DashboardHeader title="Dashboard" fiscalYear="2025" />
      
      {/* Financial Summary Cards */}
      <FinancialSummaryCards />
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bank Accounts Overview */}
          <BankAccountsOverview />
          
          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
        
        {/* Right Column - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <UpcomingTasks />
          
          {/* Chart of Accounts Summary */}
          <ChartOfAccountsSummary />
        </div>
      </div>
    </div>
  );
}
