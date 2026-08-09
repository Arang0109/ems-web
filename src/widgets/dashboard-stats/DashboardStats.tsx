import {
  OverallStatsWidget, MonthlyStatsWidget,
  type OverallStats, type MonthlyStats,
} from '@features/dashboard-summary';

import { SkeletonPanel } from '@shared/ui/skeletons';

interface Props {
  overallStats: OverallStats | null;
  monthlyStats: MonthlyStats | null;
  isLoading?: boolean;
}

/**
 * 대시보드 상단 KPI 2단. 로딩 중에도 같은 그리드를 유지해 레이아웃이 튀지 않게 한다.
 *
 * `h-24` 는 실제 패널 높이(p-4 + 제목 20px + space-y-2 + 카드 68px = 128px)에서
 * 패널 패딩을 뺀 값이라 sm 이상에서 로딩 전후 높이가 같다.
 */
export const DashboardStats = ({ overallStats, monthlyStats, isLoading }: Props) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    {isLoading || !overallStats || !monthlyStats ? (
      Array.from({ length: 2 }).map((_, i) => (
        <SkeletonPanel key={i} withHeader={false} bodyClassName="h-24" />
      ))
    ) : (
      <>
        <OverallStatsWidget summary={overallStats} />
        <MonthlyStatsWidget summary={monthlyStats} />
      </>
    )}
  </div>
);
