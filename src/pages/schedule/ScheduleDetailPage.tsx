import { ScheduleProfile } from "@widgets/schedule-profile";

import { PageTitle } from "@shared/ui/semantics";

export const ScheduleDetailPage = () => (
  <div className="p-6 space-y-5 min-h-full">
    <PageTitle title="측정계획 상세" description="측정정보·측정장비를 확인하고 현장 측정 데이터를 입력합니다." />

    <div className="bg-card rounded-panel p-5 shadow-sm border border-border">
      <ScheduleProfile />
    </div>
  </div>
);
