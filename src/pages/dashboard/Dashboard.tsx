import { useDashboard } from '@features/dashboard-summary';

import { MeasurementChart } from '@widgets/metrics';
import { DashboardStats } from '@widgets/dashboard-stats';
import { DashboardAlerts } from '@widgets/dashboard-alerts';
import { TeamScheduleTable } from '@widgets/team-schedule-table';

import { useIsMobile } from '@shared/model';
import { PageLayout } from '@shared/ui/layout';
import { SkeletonPanel } from '@shared/ui/skeletons';

/**
 * 대시보드.
 *
 * `useDashboard` 는 두 엔드포인트를 한 번에 받아 stats·alerts 위젯 모두에 먹이는
 * coordinator 훅이라 페이지가 보유한다. 위젯별로 나누면 같은 summary 요청이 2번 나간다
 * (쿼리 캐시가 없는 plain useEffect 구조). pages/CLAUDE.md 의 조합 예외에 해당한다.
 */
export const Dashboard = () => {
  const {
    stats, overallStats, monthlyStats,
    expiringContracts, inspectionDueEquipments,
    isLoading, error,
  } = useDashboard();
  const isMobileDevice = useIsMobile();

  return (
    <PageLayout title="대시보드" description="측정 현황 및 통계 요약">
      {/* MainLayout 이 이미 <main> 이므로 여기서는 div — 중첩 main 은 유효하지 않다 */}
      <div className="flex flex-col items-start gap-5 lg:flex-row lg:justify-between">
        <section className="w-full grow space-y-5">
          {error && (
            <div className="bg-danger-soft border border-danger text-danger text-body-2 rounded-icon-tile px-4 py-3">
              {error}
            </div>
          )}
          <TeamScheduleTable
            schedules={[]} loading={isLoading} error={error} selectedWorkplace={null}
          />

          {!isMobileDevice && (
            isLoading || !stats ? (
              <SkeletonPanel bodyClassName="h-64" />
            ) : (
              <MeasurementChart stats={stats} />
            )
          )}

          {!isMobileDevice && (
            <DashboardStats
              overallStats={overallStats}
              monthlyStats={monthlyStats}
              isLoading={isLoading}
            />
          )}
          
        </section>

        <DashboardAlerts
          contracts={expiringContracts}
          equipments={inspectionDueEquipments}
          isLoading={isLoading}
        />
      </div>
    </PageLayout>
  );
};
