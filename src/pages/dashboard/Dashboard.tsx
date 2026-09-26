import { MeasurementChart } from '@widgets/metrics';
import { DashboardStats } from '@widgets/dashboard-stats';
import { DashboardAlerts } from '@widgets/dashboard-alerts';
import { TeamScheduleTable } from '@widgets/team-schedule-table';

import { useIsMobile } from '@shared/model';
import { PageLayout } from '@shared/ui/layout';

/**
 * 대시보드. 위젯이 각자 데이터를 조회한다 — 통계와 알림은 같은 요약 쿼리를 구독하므로
 * 요청은 한 번만 나간다.
 */
export const Dashboard = () => {
  const isMobileDevice = useIsMobile();

  return (
    <PageLayout title="대시보드" description="측정 현황 및 통계 요약">
      {/* MainLayout 이 이미 <main> 이므로 여기서는 div — 중첩 main 은 유효하지 않다 */}
      <div className="flex flex-col items-start gap-5 lg:flex-row lg:justify-between">
        <section className="w-full grow space-y-5">
          <TeamScheduleTable />
          {!isMobileDevice && <MeasurementChart />}
          {!isMobileDevice && <DashboardStats />}
        </section>

        <DashboardAlerts />
      </div>
    </PageLayout>
  );
};
