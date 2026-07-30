import { MeasurementChart } from '@widgets/metrics';
import { useDashboard } from '@features/dashboard-summary';

import { OverallStatsWidget, MonthlyStatsWidget } from '@features/dashboard-summary';

import { PageTitle } from '@shared/ui/semantics';

const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-card rounded-panel border border-border animate-pulse ${className}`}>
    <div className="p-6 space-y-4">
      <div className="h-4 bg-muted rounded-nav w-1/3" />
      <div className="h-3 bg-muted rounded-nav w-1/4" />
      <div className="h-40 bg-muted rounded-icon-tile" />
    </div>
  </div>
);

export const Dashboard = () => {
  const { stats, overallStats, monthlyStats, isLoading, error } = useDashboard();

  return (
    <div className="space-y-5 min-h-full">
      <PageTitle title="대시보드" description="측정 현황 및 통계 요약"/>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-body-2 rounded-icon-tile px-4 py-3">
          {error}
        </div>
      )}

      {/* Summary KPI cards */}
      {isLoading || !overallStats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-panel border border-border animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OverallStatsWidget summary={overallStats} />
          <MonthlyStatsWidget summary={monthlyStats ?? null} />
        </div>
        
        
      )}

      {/* Measurement trend chart */}
      {isLoading || !stats ? (
        <SkeletonCard />
      ) : (
        <MeasurementChart stats={stats} />
      )}
    </div>
  );
};