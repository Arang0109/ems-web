import { TriangleAlert } from 'lucide-react';

import { Callout } from '@shared/ui/feedback';
import { SkeletonPanel } from '@shared/ui/skeletons';

import { useDashboardStats } from '../model/use-dashboard-stats';
import { OverallStatsPanel } from './OverallStatsPanel';
import { MonthlyStatsPanel } from './MonthlyStatsPanel';

/**
 * 대시보드 상단 KPI 2단. 로딩 중에도 같은 그리드를 유지해 레이아웃이 튀지 않게 한다.
 *
 * `h-24` 는 실제 패널 높이(p-4 + 제목 20px + space-y-2 + 카드 68px = 128px)에서
 * 패널 패딩을 뺀 값이라 sm 이상에서 로딩 전후 높이가 같다.
 */
export const DashboardStats = () => {
  const { stats, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <Callout role="alert" tone="danger" icon={TriangleAlert}>
        {error}
      </Callout>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {isLoading || !stats ? (
        Array.from({ length: 2 }).map((_, i) => (
          <SkeletonPanel key={i} withHeader={false} bodyClassName="h-24" />
        ))
      ) : (
        <>
          <OverallStatsPanel summary={stats.overallStats} />
          <MonthlyStatsPanel summary={stats.monthlyStats} />
        </>
      )}
    </div>
  );
};
