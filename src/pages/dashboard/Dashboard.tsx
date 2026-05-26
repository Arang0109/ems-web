import { MainLayout } from '@/widgets/layouts';
import { MeasurementChart, SummaryCards } from '@/widgets/dashboard';
import { useDashboard } from '@features/get-dashboard-summary';

import { PageTitle } from '@/shared/ui/sementics';

const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 animate-pulse ${className}`}>
    <div className="p-6 space-y-4">
      <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
      <div className="h-40 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

export const Dashboard = () => {
  const { stats, summary, isLoading, error } = useDashboard();

  return (
    <MainLayout>
      <div className="p-6 space-y-5 min-h-full">
        <PageTitle title="대시보드" description="측정 현황 및 통계 요약"/>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Summary KPI cards */}
        {isLoading || !summary ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse h-20" />
            ))}
          </div>
        ) : (
          <SummaryCards summary={summary} />
        )}

        {/* Measurement trend chart */}
        {isLoading || !stats ? (
          <SkeletonCard />
        ) : (
          <MeasurementChart stats={stats} />
        )}
      </div>
    </MainLayout>
  );
};